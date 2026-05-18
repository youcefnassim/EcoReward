import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Star } from 'lucide-react';
import { gamificationAPI } from '../services/api';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await gamificationAPI.getLeaderboard();
        setLeaders(data);
      } catch (err) {
        toast.error('Erreur lors du chargement du classement');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const getMedalColor = (index) => {
    switch(index) {
      case 0: return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 1: return 'text-gray-400 bg-gray-50 dark:bg-gray-800';
      case 2: return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-gray-400 bg-transparent';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 min-h-screen page-enter pb-10">
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Classement</h1>
      </div>

      <div className="p-6">
        {/* Top 3 Visual */}
        <div className="flex items-end justify-center gap-4 mb-10 mt-4">
          {leaders[1] && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 relative">
                <span className="text-2xl font-black text-gray-400">2</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 text-center w-20 truncate">{leaders[1].full_name}</p>
              <p className="text-xs font-black text-gray-400">{leaders[1].points} DA</p>
            </div>
          )}
          {leaders[0] && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mb-2 border-4 border-yellow-400 relative">
                <Trophy className="w-10 h-10 text-yellow-500" />
                <div className="absolute -top-3 -right-2 bg-yellow-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</div>
              </div>
              <p className="text-xs font-black text-gray-900 dark:text-white text-center w-24 truncate">{leaders[0].full_name}</p>
              <p className="text-sm font-black text-yellow-600">{leaders[0].points} DA</p>
            </div>
          )}
          {leaders[2] && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-2 border-2 border-orange-200 dark:border-orange-800 relative">
                <span className="text-2xl font-black text-orange-400">3</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 text-center w-20 truncate">{leaders[2].full_name}</p>
              <p className="text-xs font-black text-orange-400">{leaders[2].points} DA</p>
            </div>
          )}
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-2 shadow-sm border border-gray-100 dark:border-gray-800">
          {loading ? (
            <div className="p-10 text-center opacity-50">Chargement...</div>
          ) : leaders.map((leader, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${getMedalColor(idx)}`}>
                  {idx + 1}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{leader.full_name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{leader.studentId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900 dark:text-white">{leader.points}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">DA</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
