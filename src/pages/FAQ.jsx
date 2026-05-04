import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: "Comment gagner des points ?",
    a: "C'est simple ! Scannez le QR code présent sur une borne de recyclage EcoReward, déposez vos bouteilles en plastique ou canettes, et les points seront automatiquement crédités sur votre compte."
  },
  {
    q: "Où se trouvent les bornes ?",
    a: "Vous pouvez consulter la carte interactive dans l'onglet 'Carte' pour localiser toutes les bornes disponibles à Tlemcen, notamment à l'Université, au Palais Mechouar et à Lalla Setti."
  },
  {
    q: "Quelles sont les récompenses ?",
    a: "Vous pouvez échanger vos points contre des recharges Internet, des repas à la cafétéria, des fournitures scolaires ou même des tickets de bus."
  },
  {
    q: "Mes points expirent-ils ?",
    a: "Non, vos points EcoReward n'ont pas de date d'expiration. Vous pouvez les accumuler aussi longtemps que vous le souhaitez."
  }
];

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 min-h-screen page-enter pb-10">
      <div className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Centre d'aide & FAQ</h1>
      </div>

      <div className="p-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-3xl p-6 mb-8 flex items-center gap-4 border border-green-100 dark:border-green-900/30">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-green-900 dark:text-green-400">Besoin d'aide ?</h2>
            <p className="text-sm text-green-700 dark:text-green-500">Trouvez les réponses à vos questions ici.</p>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all shadow-sm"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed animate-slide-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
