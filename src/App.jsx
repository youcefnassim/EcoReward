import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Components
import Layout from './components/Layout';
import Loader from './components/Loader';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rewards from './pages/Rewards';
import MapComponent from './pages/Map';
import Settings from './pages/Settings';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import ProfileEdit from './pages/ProfileEdit';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 24px',
            fontWeight: 600,
          },
          success: {
            style: { background: '#16a34a' },
            iconTheme: { primary: '#fff', secondary: '#16a34a' },
          },
          error: {
            style: { background: '#ef4444' },
            iconTheme: { primary: '#fff', secondary: '#ef4444' },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/rewards" element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <MapComponent />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/faq" element={
            <ProtectedRoute>
              <FAQ />
            </ProtectedRoute>
          } />
          <Route path="/privacy" element={
            <ProtectedRoute>
              <Privacy />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />
          <Route path="/profile-edit" element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

import { I18nProvider } from './context/I18nContext';

function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <Router>
          <AppRoutes />
        </Router>
      </I18nProvider>
    </AuthProvider>
  );
}

export default App;
