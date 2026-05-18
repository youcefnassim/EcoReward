import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { authAPI, usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);   // Supabase Auth user
  const [userData, setUserData] = useState(null);   // profil Supabase (table profiles)
  const [loading, setLoading]   = useState(true);

  // ─── Dark mode ─────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('eco-dark') === 'true'
  );

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else          document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('eco-dark', String(next));
  };

  // ─── Charger le profil depuis Supabase ─────────────────────────────────────
  const loadProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (err) {
      console.error('loadProfile error:', err.message);
      setUserData(null);
    }
  };

  // ─── Écouter les changements de session Supabase ──────────────────────────
  useEffect(() => {
    // Récupère la session existante au montage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listener temps réel sur les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user);
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    );

    // Cleanup
    return () => subscription?.unsubscribe();
  }, []);

  // ─── Real-time subscription : met à jour les points en direct ─────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          setUserData((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    // onAuthStateChange gérera le reste automatiquement
    return data;
  };

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = async ({ studentId, fullName, email, password }) => {
    const data = await authAPI.register({ studentId, fullName, email, password });
    return data;
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setUserData(null);
    toast.success('Déconnexion réussie');
  };

  // ─── Refresh profil manuellement ──────────────────────────────────────────
  const refreshUser = async () => {
    if (user) await loadProfile(user);
  };

  const updateLocalPoints = (newPoints) => {
    setUserData((prev) => prev ? { ...prev, points: newPoints } : prev);
  };

  const value = {
    user,
    userData,
    loading,
    darkMode,
    toggleDarkMode,
    login,
    register,
    logout,
    refreshUser,
    updateLocalPoints,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
