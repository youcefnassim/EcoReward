/**
 * api.js — Toutes les requêtes Supabase (remplace axios + Express)
 * Chaque fonction retourne { data, error } ou lève une exception propre.
 */
import { supabase } from '../lib/supabase';

// ─── Helper : lève une erreur lisible ────────────────────────────────────────
const check = ({ data, error }) => {
  if (error) throw new Error(error.message || 'Erreur Supabase');
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  /**
   * Connexion email/password
   */
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data; // { user, session }
  },

  /**
   * Inscription + création du profil (via trigger Supabase)
   */
  register: async ({ studentId, fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { studentId, fullName }, // stocké dans raw_user_meta_data → trigger le crée dans profiles
      },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Déconnexion
   */
  logout: () => supabase.auth.signOut(),

  /**
   * Écouter les changements de session
   */
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),

  /**
   * Session courante
   */
  getSession: () => supabase.auth.getSession(),
};

// ─── Profil utilisateur ───────────────────────────────────────────────────────
export const usersAPI = {
  /**
   * Récupère le profil de l'utilisateur connecté
   */
  getMe: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    return check(
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    );
  },

  /**
   * Met à jour le profil
   */
  updateMe: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    return check(
      await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()
    );
  },
};

// ─── Récompenses ──────────────────────────────────────────────────────────────
export const rewardsAPI = {
  /**
   * Liste toutes les récompenses actives
   */
  getAll: async () => {
    return check(
      await supabase
        .from('rewards')
        .select('*')
        .eq('active', true)
        .order('cost', { ascending: true })
    );
  },

  /**
   * Échange une récompense via RPC (sécurisé, transactionnel)
   */
  redeem: async (rewardId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    return check(
      await supabase.rpc('redeem_reward', {
        p_user_id:   user.id,
        p_reward_id: rewardId,
      })
    );
  },
};

// ─── Historique ───────────────────────────────────────────────────────────────
export const historyAPI = {
  /**
   * Historique unifié (recycles + échanges) via RPC
   */
  getAll: async (limitCount = 20) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return check(
      await supabase.rpc('get_history', {
        p_user_id: user.id,
        p_limit:   limitCount,
      })
    ) || [];
  },
};

// ─── Machines ─────────────────────────────────────────────────────────────────
export const machinesAPI = {
  getAll: async () => {
    return check(
      await supabase
        .from('machines')
        .select('*')
        .order('name', { ascending: true })
    );
  },

  getById: async (id) => {
    return check(
      await supabase
        .from('machines')
        .select('*')
        .eq('id', id)
        .single()
    );
  },
};

// ─── Gamification ─────────────────────────────────────────────────────────────
export const gamificationAPI = {
  /**
   * Simule le scan d'une borne et crédite les points via RPC
   */
  scan: async (machineId, itemType = 'plastic', count = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    return check(
      await supabase.rpc('process_recycle', {
        p_user_id:   user.id,
        p_machine_id: machineId,
        p_item_type:  itemType,
        p_count:      count,
      })
    );
  },

  /**
   * Classement via RPC
   */
  getLeaderboard: async (limit = 10) => {
    return check(
      await supabase.rpc('get_leaderboard', { p_limit: limit })
    ) || [];
  },
};

// Export default pour compatibilité
export default supabase;
