import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft, 
  Globe, 
  Bell, 
  HelpCircle, 
  Shield, 
  LogOut, 
  ChevronRight,
  Award,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { gamificationAPI } from '../services/api';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

import { useI18n } from '../context/I18nContext';

const Settings = () => {
  const { userData, logout, darkMode, toggleDarkMode } = useAuth();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await gamificationAPI.getBadges();
        setBadges(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBadges();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLang = () => {
    const next = lang === 'FR' ? 'AR' : 'FR';
    setLang(next);
    toast.success(`Langue changée en ${next === 'AR' ? 'Arabe' : 'Français'}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 min-h-screen page-enter">
      {/* Top Header */}
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
      </div>

      <div className="p-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-card border border-gray-100 dark:border-gray-800 mb-8 flex items-center gap-5 relative overflow-hidden">
          <div className="w-24 h-24 rounded-[2rem] bg-white border-2 border-green-500 overflow-hidden flex items-center justify-center shadow-eco relative z-10">
            <img src={userData?.avatar || logo} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 flex-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{userData?.fullName || 'Étudiant'}</h2>
            <p className="text-sm text-gray-400 font-bold tracking-wider mt-0.5">ID: {userData?.studentId || 'N/A'}</p>
            <button 
              onClick={() => navigate('/profile-edit')}
              className="mt-3 px-4 py-1.5 bg-green-500 text-white text-[10px] font-black rounded-full shadow-eco hover:bg-green-600 transition-colors uppercase tracking-widest"
            >
              {t('edit_profile')}
            </button>
          </div>
          <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-full blur-3xl" />
        </div>

        {/* Section: Badges */}
        {badges.length > 0 && (
          <div className="mb-10">
            <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-4 ml-4 uppercase flex items-center gap-2">
               <Award className="w-3 h-3" />
               {t('my_badges')} ({badges.length})
            </p>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
               {badges.map(badge => (
                  <div key={badge.id} className="flex-shrink-0 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center w-24 shadow-sm group hover:border-green-500 transition-colors">
                     <span className="text-2xl mb-2 group-hover:scale-125 transition-transform">{badge.icon}</span>
                     <span className="text-[9px] font-black text-gray-900 dark:text-white uppercase text-center leading-tight">{badge.name}</span>
                  </div>
               ))}
            </div>
          </div>
        )}

        {/* Section: Préférences */}
        <div className="mb-8">
          <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-4 ml-4 uppercase">{t('preferences')}</p>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-card border border-gray-100 dark:border-gray-800">
            <div 
              onClick={toggleLang}
              className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{t('language')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400">{lang === 'FR' ? 'Français' : 'العربية'}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  {darkMode ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-purple-500" />}
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{t('dark_mode')}</span>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-pink-500" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{t('notifications')}</span>
              </div>
              <button 
                onClick={() => setNotifEnabled(!notifEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Support */}
        <div className="mb-10">
          <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-4 ml-4 uppercase">{t('support')}</p>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-card border border-gray-100 dark:border-gray-800">
            <div onClick={() => navigate('/faq')} className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-orange-500" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{t('faq')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            
            <div onClick={() => navigate('/privacy')} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{t('privacy')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full py-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[2rem] flex items-center justify-center gap-3 text-red-500 font-black hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-95 transition-all shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
};

export default Settings;
