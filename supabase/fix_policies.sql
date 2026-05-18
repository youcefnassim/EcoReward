-- ============================================================
-- FIX : Supprimer et recréer les policies en conflit
-- Exécutez ceci dans Supabase SQL Editor → New Query
-- ============================================================

-- ─── Drop policies existantes ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Own profile read"       ON public.profiles;
DROP POLICY IF EXISTS "Own profile update"     ON public.profiles;
DROP POLICY IF EXISTS "Read rewards"           ON public.rewards;
DROP POLICY IF EXISTS "Read machines"          ON public.machines;
DROP POLICY IF EXISTS "Own redemptions read"   ON public.redemptions;
DROP POLICY IF EXISTS "Own redemptions insert" ON public.redemptions;
DROP POLICY IF EXISTS "Own recycle read"       ON public.recycle_history;

-- ─── Recréer les policies ─────────────────────────────────────────────────────
CREATE POLICY "Own profile read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Read rewards"       ON public.rewards  FOR SELECT TO authenticated USING (active = TRUE);
CREATE POLICY "Read machines"      ON public.machines FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Own redemptions read"   ON public.redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own redemptions insert" ON public.redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own recycle read"   ON public.recycle_history FOR SELECT USING (auth.uid() = user_id);
