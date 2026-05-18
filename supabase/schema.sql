-- ============================================================
-- EcoReward — Supabase Schema
-- Copiez-collez ce fichier ENTIER dans SQL Editor de Supabase
-- ============================================================

-- ─── 1. Tables ────────────────────────────────────────────────────────────────

-- Profiles (liés à auth.users via trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  student_id      TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  email           TEXT,
  points          INTEGER DEFAULT 0,
  total_recycled  INTEGER DEFAULT 0,
  weekly_recycled INTEGER DEFAULT 0,
  avatar          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards
CREATE TABLE IF NOT EXISTS public.rewards (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  cost        INTEGER NOT NULL,
  icon        TEXT DEFAULT 'gift',
  color       TEXT DEFAULT 'green',
  category    TEXT DEFAULT 'general',
  stock       INTEGER DEFAULT -1,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Redemptions (historique échanges)
CREATE TABLE IF NOT EXISTS public.redemptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  reward_id   TEXT REFERENCES public.rewards NOT NULL,
  points_used INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recycle history
CREATE TABLE IF NOT EXISTS public.recycle_history (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  machine_id    TEXT,
  item_type     TEXT NOT NULL DEFAULT 'plastic',
  points_earned INTEGER NOT NULL,
  recycled_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Machines (bornes de recyclage)
CREATE TABLE IF NOT EXISTS public.machines (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  address      TEXT,
  lat          REAL NOT NULL,
  lng          REAL NOT NULL,
  type         TEXT DEFAULT 'plastic',
  status       TEXT DEFAULT 'active',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Trigger — auto-create profile on signup ───────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, student_id, full_name, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'studentId', 'STU' || SUBSTR(NEW.id::text, 1, 6)),
    COALESCE(NEW.raw_user_meta_data->>'fullName', 'Utilisateur'),
    NEW.email,
    UPPER(SUBSTR(COALESCE(NEW.raw_user_meta_data->>'fullName', 'U'), 1, 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── 3. RLS Policies ──────────────────────────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines       ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Own profile read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Rewards — lecture publique pour tous les authentifiés
CREATE POLICY "Read rewards" ON public.rewards FOR SELECT TO authenticated USING (active = TRUE);

-- Machines — lecture publique
CREATE POLICY "Read machines" ON public.machines FOR SELECT TO authenticated USING (TRUE);

-- Redemptions
CREATE POLICY "Own redemptions read"   ON public.redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own redemptions insert" ON public.redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recycle History
CREATE POLICY "Own recycle read" ON public.recycle_history FOR SELECT USING (auth.uid() = user_id);

-- ─── 4. RPC Functions ─────────────────────────────────────────────────────────

-- process_recycle : appelé par le ScannerModal
CREATE OR REPLACE FUNCTION public.process_recycle(
  p_user_id   UUID,
  p_machine_id TEXT,
  p_item_type  TEXT DEFAULT 'plastic',
  p_count      INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_points    INTEGER;
  v_new_total INTEGER;
BEGIN
  v_points := p_count * 10;

  INSERT INTO public.recycle_history (user_id, machine_id, item_type, points_earned)
  VALUES (p_user_id, p_machine_id, p_item_type, v_points);

  UPDATE public.profiles
  SET points          = points + v_points,
      total_recycled  = total_recycled + p_count,
      weekly_recycled = weekly_recycled + p_count,
      updated_at      = NOW()
  WHERE id = p_user_id
  RETURNING points INTO v_new_total;

  RETURN json_build_object(
    'pointsEarned', v_points,
    'itemCount',    p_count,
    'newTotal',     v_new_total
  );
END;
$$;

-- redeem_reward : appelé par la page Rewards
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_user_id  UUID,
  p_reward_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_reward      RECORD;
  v_user_points INTEGER;
  v_new_total   INTEGER;
BEGIN
  SELECT * INTO v_reward FROM public.rewards WHERE id = p_reward_id AND active = TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Récompense introuvable';
  END IF;

  SELECT points INTO v_user_points FROM public.profiles WHERE id = p_user_id;
  IF v_user_points < v_reward.cost THEN
    RAISE EXCEPTION 'Points insuffisants (vous avez % pts, il faut % pts)', v_user_points, v_reward.cost;
  END IF;

  INSERT INTO public.redemptions (user_id, reward_id, points_used)
  VALUES (p_user_id, p_reward_id, v_reward.cost);

  UPDATE public.profiles
  SET points     = points - v_reward.cost,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING points INTO v_new_total;

  RETURN json_build_object(
    'success',    TRUE,
    'pointsUsed', v_reward.cost,
    'newTotal',   v_new_total
  );
END;
$$;

-- get_history : historique unifié recycle + échanges
CREATE OR REPLACE FUNCTION public.get_history(
  p_user_id UUID,
  p_limit   INTEGER DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(h ORDER BY h.created_at DESC) INTO v_result FROM (
    SELECT
      id::text,
      'recycle'     AS type,
      item_type,
      points_earned AS points,
      machine_id,
      NULL          AS reward_title,
      recycled_at   AS created_at
    FROM public.recycle_history
    WHERE user_id = p_user_id

    UNION ALL

    SELECT
      rd.id::text,
      'redeem'      AS type,
      NULL          AS item_type,
      rd.points_used AS points,
      NULL          AS machine_id,
      r.title       AS reward_title,
      rd.redeemed_at AS created_at
    FROM public.redemptions rd
    JOIN public.rewards r ON rd.reward_id = r.id
    WHERE rd.user_id = p_user_id

    ORDER BY created_at DESC
    LIMIT p_limit
  ) h;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_order)
    FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY points DESC) AS rank,
        full_name,
        student_id,
        points,
        total_recycled,
        avatar
      FROM public.profiles
      ORDER BY points DESC
      LIMIT p_limit
    ) row_order
  );
END;
$$;

-- ─── 5. Seed Data ─────────────────────────────────────────────────────────────

-- Récompenses
INSERT INTO public.rewards (id, title, description, cost, icon, color, category) VALUES
  ('r1', 'Café Gratuit',        'Un café offert à la cafétéria du campus', 100,  'coffee',  'orange', 'food'),
  ('r2', 'Repas Resto U',       'Un repas complet au Restaurant Universitaire', 500, 'utensils', 'green', 'food'),
  ('r3', 'Bon d''achat 1000 DA','Bon pour la librairie universitaire', 1000, 'book', 'purple', 'shopping'),
  ('r4', '10Go Internet',       'Crédit data mobile pour 30 jours', 750, 'wifi', 'blue', 'tech'),
  ('r5', 'Impression A4 x20',   '20 feuilles imprimées au service reprographie', 300, 'printer', 'gray', 'services'),
  ('r6', 'Place Cinéma',        'Une place pour le cinéma étudiant', 1200, 'film', 'red', 'entertainment')
ON CONFLICT (id) DO NOTHING;

-- Machines (Tlemcen)
INSERT INTO public.machines (id, name, address, lat, lng, type, status) VALUES
  ('m1', 'Grande Mosquée',            'Place de la Mairie, Tlemcen',    34.8825, -1.3115, 'mixed',   'active'),
  ('m2', 'Palais El Mechouar',        'Centre Ville, Tlemcen',          34.8805, -1.3105, 'plastic',  'active'),
  ('m3', 'Université (Nouveau Pôle)', 'Imama, Tlemcen',                 34.8910, -1.3410, 'plastic',  'active'),
  ('m4', 'Parc Lalla Setti',          'Plateau Lalla Setti',            34.8690, -1.3120, 'mixed',   'maintenance'),
  ('m5', 'Ruines de Mansourah',       'Route de Mansourah',             34.8720, -1.3340, 'paper',   'active')
ON CONFLICT (id) DO NOTHING;
