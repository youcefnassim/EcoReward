import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { rewardsAPI } from '../services/api';
import {
  ArrowLeft, Wifi, Coffee, BookOpen, Utensils,
  Printer, Film, Gift, Star, Zap
} from 'lucide-react';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const IconsMap = {
  wifi: Wifi,
  coffee: Coffee,
  book: BookOpen,
  utensils: Utensils,
  printer: Printer,
  film: Film,
  gift: Gift,
  star: Star,
  zap: Zap,
};

const colorMap = {
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500', badge: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-500',  badge: 'bg-green-100 text-green-700 dark:bg-green-900/40' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20',text: 'text-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-500',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40' },
  gray:   { bg: 'bg-gray-50 dark:bg-gray-800',      text: 'text-gray-500',   badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800' },
  red:    { bg: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-500',    badge: 'bg-red-100 text-red-600 dark:bg-red-900/40' },
};

const Rewards = () => {
  const { userData, updateLocalPoints } = useAuth();
  const navigate = useNavigate();
  const [rewardsList, setRewardsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [filter, setFilter] = useState('all');

  const points = userData?.points ?? 0;

  useEffect(() => {
    rewardsAPI.getAll()
      .then(setRewardsList)
      .catch(() => toast.error('Erreur lors du chargement des récompenses'))
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward) => {
    if (points < reward.cost) {
      toast.error(`Il vous manque ${reward.cost - points} DA`);
      return;
    }

    setRedeeming(reward.id);
    try {
      const result = await rewardsAPI.redeem(reward.id);
      // Update points locally immediately (no need to refetch)
      updateLocalPoints(result.newPoints);
      toast.success(`🎉 ${reward.title} échangé !`);
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'échange");
    } finally {
      setRedeeming(null);
    }
  };

  const categories = ['all', ...new Set(rewardsList.map(r => r.category))];
  const filtered = filter === 'all' ? rewardsList : rewardsList.filter(r => r.category === filter);

  const categoryLabels = {
    all: 'Tout', food: 'Nourriture', tech: 'Tech',
    shopping: 'Shopping', services: 'Services', entertainment: 'Divertissement'
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* Sticky Header */}
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Récompenses</h1>
      </div>

      <div className="p-6 space-y-6 page-enter">

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Votre Solde</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{points.toLocaleString('fr-FR')}</span>
              <span className="text-gray-400 font-semibold">DA</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
            <Star className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200',
                filter === cat
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
              )}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Récompenses disponibles
            <span className="ml-2 text-sm font-medium text-gray-400">({filtered.length})</span>
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="app-card animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Aucune récompense disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((reward) => {
                const Icon = IconsMap[reward.icon] || Gift;
                const colors = colorMap[reward.color] || colorMap.green;
                const canAfford = points >= reward.cost;
                const missing = reward.cost - points;

                return (
                  <div
                    key={reward.id}
                    className={clsx(
                      'app-card transition-all duration-200',
                      !canAfford && 'opacity-70'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0', colors.bg)}>
                        <Icon className={clsx('w-7 h-7', colors.text)} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{reward.title}</h3>
                          <span className={clsx('flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full', colors.badge)}>
                            {reward.cost} DA
                          </span>
                        </div>
                        {reward.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                            {reward.description}
                          </p>
                        )}
                        {!canAfford && (
                          <p className="text-xs text-red-400 font-medium mb-3">
                            Il vous manque {missing} DA
                          </p>
                        )}
                        <Button
                          size="sm"
                          variant={canAfford ? 'primary' : 'ghost'}
                          disabled={!canAfford || redeeming === reward.id}
                          loading={redeeming === reward.id}
                          onClick={() => handleRedeem(reward)}
                          className="w-full"
                        >
                          {canAfford ? 'Échanger' : 'Solde insuffisant'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
