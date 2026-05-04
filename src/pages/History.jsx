import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { historyAPI } from '../services/api';
import { ArrowLeft, Recycle, Clock, Gift, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyAPI.getAll();
        setHistory(data);
      } catch (err) {
        toast.error('Erreur lors du chargement de l\'historique');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 min-h-screen page-enter pb-10">
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Historique</h1>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-gray-500">Chargement...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun historique</h2>
            <p className="text-sm text-gray-500">Commencez à recycler pour voir vos activités ici !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    item.type === 'recycle' 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-orange-50 dark:bg-orange-900/20'
                  }`}>
                    {item.type === 'recycle' ? (
                      <Recycle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Gift className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight capitalize">
                      {item.type === 'recycle' ? (item.item_type || 'Recyclage') : (item.reward_title || 'Récompense')}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                      {new Date(item.created_at).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className={`flex items-center gap-1 text-lg font-black ${
                    item.type === 'recycle' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {item.type === 'recycle' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    {item.points}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
