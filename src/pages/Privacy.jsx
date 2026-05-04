import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Eye,
      title: "Données Collectées",
      content: "Nous collectons uniquement les données nécessaires à votre compte : nom, email, ID étudiant et historique de recyclage pour le calcul de vos points."
    },
    {
      icon: Lock,
      title: "Sécurité",
      content: "Vos données sont cryptées et stockées en toute sécurité sur nos serveurs locaux. Vos mots de passe sont hachés et ne sont jamais visibles, même par nos administrateurs."
    },
    {
      icon: Database,
      title: "Utilisation des données",
      content: "EcoReward utilise vos données exclusivement pour gérer votre solde de points et les échanges de récompenses. Nous ne partageons ni ne vendons jamais vos données à des tiers."
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 min-h-screen page-enter pb-10">
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Confidentialité</h1>
      </div>

      <div className="p-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 mb-8 flex flex-col items-center text-center border border-emerald-100 dark:border-emerald-900/30">
          <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4" />
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">Vos données sont en sécurité</h2>
          <p className="text-sm text-emerald-700 dark:text-emerald-600 mt-1">Chez EcoReward, nous respectons votre vie privée et protégeons vos informations personnelles.</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{section.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 text-center leading-loose">
            Dernière mise à jour : 28 Avril 2026<br/>
            EcoReward Tlemcen - Équipe de Développement
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
