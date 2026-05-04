import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { Recycle, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Connexion réussie ! 🌱');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setEmail('demo@univ.edu');
    setPassword('demo1234');
    setLoading(true);
    setError('');
    try {
      await login('demo@univ.edu', 'demo1234');
      toast.success('Connexion démo réussie ! 🌱');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erreur connexion démo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-eco-gradient relative overflow-hidden min-h-screen">

      {/* Logo */}
      <div className="mb-10 text-center z-10 page-enter">
        <div className="w-48 h-48 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-eco mb-6 overflow-hidden">
          <img src={logo} alt="EcoReward Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Bon retour !</h1>
        <p className="text-gray-600 font-medium">Connectez-vous pour gérer vos récompenses.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 z-10 page-enter" style={{ animationDelay: '100ms' }}>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            className="input-field pl-12"
            placeholder="Email étudiant"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            className="input-field pl-12"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="pt-2 space-y-3">
          <Button type="submit" loading={loading} className="w-full">
            Se connecter
          </Button>
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl border-2 border-green-300 text-green-700 font-bold text-sm hover:bg-green-50 transition-all duration-200"
          >
            🚀 Connexion Démo (demo@univ.edu)
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center z-10 page-enter" style={{ animationDelay: '200ms' }}>
        <p className="text-gray-600 font-medium">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-green-600 font-bold hover:text-green-700 underline-offset-4 hover:underline transition-all">
            Créer un compte
          </Link>
        </p>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-green" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-green" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default Login;
