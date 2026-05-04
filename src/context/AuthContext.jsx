import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // { uid, email, token }
  const [userData, setUserData] = useState(null); // full profile from DB
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('eco-dark') === 'true';
  });

  // ─── Dark mode init ────────────────────────────────────────────────────────
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('eco-dark', String(next));
  };

  // ─── Restore session from localStorage ────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('eco_token');
    const savedUser = localStorage.getItem('eco_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Refresh profile from server
        usersAPI.getMe()
          .then((data) => setUserData(data))
          .catch(() => {
            // Token expired — clear session
            localStorage.removeItem('eco_token');
            localStorage.removeItem('eco_user');
            setUser(null);
            setUserData(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('eco_token', data.token);
    localStorage.setItem('eco_user', JSON.stringify({ uid: data.user.uid, email: data.user.email }));
    setUser({ uid: data.user.uid, email: data.user.email });
    setUserData(data.user);
    return data;
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async ({ studentId, fullName, email, password }) => {
    const data = await authAPI.register({ studentId, fullName, email, password });
    localStorage.setItem('eco_token', data.token);
    localStorage.setItem('eco_user', JSON.stringify({ uid: data.user.uid, email: data.user.email }));
    setUser({ uid: data.user.uid, email: data.user.email });
    setUserData(data.user);
    return data;
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('eco_token');
    localStorage.removeItem('eco_user');
    setUser(null);
    setUserData(null);
    toast.success('Déconnexion réussie');
  };

  // ─── Update local userData (e.g. after redeem) ────────────────────────────
  const refreshUser = async () => {
    try {
      const data = await usersAPI.getMe();
      setUserData(data);
    } catch {
      // silent
    }
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
