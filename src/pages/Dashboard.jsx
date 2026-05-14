import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Zap,
  Download,
  Recycle, 
  Trophy, 
  History as HistoryIcon, 
  Gift, 
  TrendingUp,
  Leaf,
  Droplets
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { historyAPI } from '../services/api';
import ScannerModal from '../components/ScannerModal';
import logo from '../assets/logo.png';

import { useI18n } from '../context/I18nContext';

const Dashboard = () => {
  const { userData, refreshUser } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Capture the PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyAPI.getAll(3);
        setRecentActivity(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  const calculateLevel = (points = 0) => {
    const level = Math.floor(points / 500) + 1;
    const progress = ((points % 500) / 500) * 100;
    return { level, progress };
  };

  const { level, progress } = calculateLevel(userData?.points);

  return (
    <div className="flex-1 flex flex-col page-enter pb-10">
      {/* Header Profile Section */}
      <div className="px-6 pt-8 pb-12 bg-white dark:bg-gray-900 rounded-b-[3.5rem] shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center gap-4 mb-10">
          <div>
            <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">{t('welcome')}</h2>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {userData?.fullName || 'Utilisateur'}
            </h1>
          </div>
          <div className="flex-shrink-0 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-eco overflow-hidden border-2 border-green-500/20">
            <img src={userData?.avatar || logo} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Level Card */}
        <div className="bg-gray-950 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-green-500 font-black text-sm tracking-widest">{t('level')} {level}</span>
              <span className="text-white font-bold text-xs">{userData?.points || 0} {t('points')}</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Plus que {500 - (userData?.points % 500)} {t('points')} avant le niveau {level + 1}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6">

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="mb-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-[2rem] p-4 flex items-center justify-between gap-3 shadow-lg shadow-green-500/20 animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-xs">Installer EcoReward</p>
                <p className="text-white/80 text-[10px]">Accès rapide depuis ton écran d'accueil</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-green-600 text-[10px] font-black px-3 py-1.5 rounded-full hover:bg-green-50 active:scale-95 transition-all"
              >
                Installer
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="text-white/60 text-xs font-bold px-1">✕</button>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => navigate('/rewards')}
            className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-card border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all group"
          >
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('shop')}</span>
          </button>
          
          <button 
            onClick={() => navigate('/history')}
            className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-card border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <HistoryIcon className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('history')}</span>
          </button>

          <button 
            onClick={() => navigate('/leaderboard')}
            className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-card border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all group"
          >
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('leaderboard')}</span>
          </button>
        </div>

        {/* Eco Impact Stats */}
        <div className="mb-8">
           <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="font-black text-sm text-gray-900 dark:text-white tracking-widest flex items-center gap-2 uppercase">
                <TrendingUp className="w-4 h-4 text-green-500" />
                {t('eco_impact')}
             </h3>
           </div>
           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-8 relative overflow-hidden">
              <div className="flex flex-col items-center text-center">
                 <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-3">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                 </div>
                 <span className="text-lg font-black text-gray-900 dark:text-white">{(userData?.points / 10).toFixed(1)}kg</span>
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('co2_saved')}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                 <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center mb-3">
                    <Droplets className="w-5 h-5 text-cyan-500" />
                 </div>
                 <span className="text-lg font-black text-gray-900 dark:text-white">{(userData?.points * 1.5).toFixed(0)}L</span>
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('water_saved')}</span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-gray-100 dark:bg-gray-800" />
           </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-black text-sm text-gray-900 dark:text-white tracking-widest flex items-center gap-2 uppercase">
              <Zap className="w-4 h-4 text-orange-500" />
              {t('recent_activity')}
            </h3>
            <button onClick={() => navigate('/history')} className="text-[10px] font-black text-green-500 uppercase tracking-widest hover:translate-x-1 transition-transform">{t('see_all')}</button>
          </div>

          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-900 p-4 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-green-100 dark:hover:border-green-900/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:text-white transition-all ${
                      item.type === 'recycle' ? 'bg-green-50 dark:bg-green-900/20 group-hover:bg-green-500' : 'bg-orange-50 dark:bg-orange-900/20 group-hover:bg-orange-500'
                    }`}>
                      {item.type === 'recycle' ? <Recycle className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs capitalize">
                        {item.type === 'recycle' ? (item.item_type || 'Recyclage') : (item.reward_title || 'Récompense')}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(item.created_at).toLocaleDateString(lang === 'AR' ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-black ${item.type === 'recycle' ? 'text-green-600' : 'text-orange-600'}`}>
                      {item.type === 'recycle' ? '+' : '-'}{item.points}
                    </span>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{t('points')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                 <p className="text-xs font-bold text-gray-400">{t('no_activity')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Scanner */}
      <button 
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] w-20 h-20 bg-green-500 rounded-full flex flex-col items-center justify-center text-white shadow-[0_15px_35px_rgba(34,197,94,0.4)] hover:scale-110 active:scale-95 transition-all"
      >
        <Recycle className="w-8 h-8 mb-0.5 animate-spin-slow" />
        <span className="text-[9px] font-black uppercase tracking-tighter">{t('scan_to_recycle')}</span>
      </button>

      {/* Scanner Modal */}
      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onFinish={refreshUser}
      />
    </div>
  );
};

export default Dashboard;
