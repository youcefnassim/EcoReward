import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Camera, Check, User, Mail, Save } from 'lucide-react';
import { usersAPI } from '../services/api';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const AVATARS = [
  '🌱', '🦁', '🦉', '🦊', '🐼', '🐨', '♻️', '🌍', '🥇', '🦸', '🍃', '✨'
];

const ProfileEdit = () => {
  const { userData, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(userData?.full_name || '');
  const [avatar, setAvatar] = useState(userData?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("L'image est trop lourde (max 2Mo)");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName) return toast.error('Le nom est requis');

    setLoading(true);
    try {
      await usersAPI.updateMe({ full_name: fullName, avatar });
      await refreshUser();
      toast.success('Profil mis à jour !');
      navigate('/settings');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 min-h-screen page-enter pb-10">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Éditer le profil</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-8">
        {/* Avatar Selection */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <label className="cursor-pointer block group">
              <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-eco border-4 border-white dark:border-gray-800 relative z-10 overflow-hidden">
                {avatar && avatar.length > 4 ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{avatar || '👤'}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </label>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg z-20 border-4 border-white dark:border-gray-950 pointer-events-none">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appuyez pour changer la photo</p>
          
          <div className="flex flex-wrap justify-center gap-3 max-w-xs">
            {['🌱', '🦁', '♻️', '🌍', '🥇', '🦸'].map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                  avatar === a 
                  ? 'bg-green-500 text-white scale-110 shadow-eco-lg' 
                  : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Info Fields */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nom complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-transparent focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm font-bold text-gray-900 dark:text-white"
                  placeholder="Ton nom complet"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email étudiant</label>
              <div className="relative opacity-60">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  value={userData?.email || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-transparent text-sm font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[9px] font-bold text-gray-400 mt-2 ml-1 italic">* L'email ne peut pas être modifié</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/40">
             <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 leading-relaxed">
                💡 Ton nom et ton avatar seront visibles sur le <strong>classement général</strong> de l'université.
             </p>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          loading={loading}
          leftIcon={Save}
          className="w-full h-16 rounded-3xl shadow-eco-lg font-black tracking-widest"
        >
          ENREGISTRER LES MODIFS
        </Button>
      </form>
    </div>
  );
};

export default ProfileEdit;
