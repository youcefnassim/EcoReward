import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,       // Firebase auth user
        userData: null,   // Firestore user document
        loading: true,

        setUser: (user) => set({ user }),
        setUserData: (userData) => set({ userData }),
        setLoading: (loading) => set({ loading }),
        clearAuth: () => set({ user: null, userData: null, loading: false }),
      }),
      {
        name: 'eco-auth',
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// ─── UI Store (Dark Mode, Notifications) ─────────────────────────────────────
export const useUIStore = create(
  devtools(
    persist(
      (set, get) => ({
        darkMode: false,
        sidebarOpen: false,
        globalLoading: false,
        notifications: [],

        toggleDarkMode: () => {
          const next = !get().darkMode;
          set({ darkMode: next });
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        },

        initDarkMode: () => {
          if (get().darkMode) {
            document.documentElement.classList.add('dark');
          }
        },

        setGlobalLoading: (globalLoading) => set({ globalLoading }),
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              { id: Date.now(), read: false, ...notification },
              ...state.notifications,
            ].slice(0, 20),
          })),

        markAllRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
          })),

        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'eco-ui',
        partialize: (state) => ({ darkMode: state.darkMode }),
      }
    ),
    { name: 'UIStore' }
  )
);

// ─── Rewards Store ────────────────────────────────────────────────────────────
export const useRewardsStore = create(
  devtools(
    (set) => ({
      rewards: [],
      loading: false,
      error: null,

      setRewards: (rewards) => set({ rewards }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: 'RewardsStore' }
  )
);
