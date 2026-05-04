import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const { studentId, fullName, email, password } = formData;

    if (!studentId || !fullName || !email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await register({ studentId, fullName, email, password });
      toast.success('Compte créé avec succès ! 🌱');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-eco-gradient relative overflow-hidden min-h-screen">
      
      {/* Header */}
      <div className="mb-8 z-10 page-enter">
        <Link to="/login" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow mb-6">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 overflow-hidden p-2">
          <img src={logo} alt="EcoReward Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Créer un compte</h1>
        <p className="text-gray-600 font-medium">Commencez à gagner des récompenses dès aujourd'hui.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="w-full max-w-sm mx-auto space-y-4 z-10 page-enter" style={{animationDelay: '100ms'}}>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">ID Étudiant</label>
          <input
            type="text"
            name="studentId"
            className="input-field"
            placeholder="ex: 2024001"
            value={formData.studentId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Nom complet</label>
          <input
            type="text"
            name="fullName"
            className="input-field"
            placeholder="Jean Dupont"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Email</label>
          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="jean.dupont@univ.edu"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Mot de passe</label>
          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="Min. 6 caractères"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="pt-6">
          <Button type="submit" loading={loading} variant="primary">
            Créer mon compte
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-green-600 font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </form>

      {/* Decorative blurred circles */}
      <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
    </div>
  );
};

export default Register;
