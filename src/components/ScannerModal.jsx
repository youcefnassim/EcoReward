import { useState, useEffect } from 'react';
import { X, Camera, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { gamificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from './Button';

const ScannerModal = ({ isOpen, onClose, onFinish }) => {
  const [step, setStep] = useState('scanning'); // scanning -> processing -> success
  const [scanResult, setScanResult] = useState(null);

  if (!isOpen) return null;

  const handleSimulateScan = async () => {
    setStep('processing');
    try {
      // Simulate network delay for "scanning" feel
      await new Promise(r => setTimeout(r, 2000));
      
      const data = await gamificationAPI.scan('m1'); // Simulating scan on m1 (Grande Mosquée)
      setScanResult(data);
      setStep('success');
    } catch (err) {
      toast.error('Échec du scan');
      setStep('scanning');
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative animate-slide-up">
        
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center z-10">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {step === 'scanning' && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6 relative">
              <Camera className="w-10 h-10 text-green-500" />
              <div className="absolute inset-0 border-2 border-green-500 rounded-3xl animate-pulse scale-110 opacity-50" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Scanner une borne</h2>
            <p className="text-sm text-gray-500 mb-8 px-4">Placez le QR code de la borne dans le cadre pour recycler vos déchets.</p>
            
            <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-700 relative overflow-hidden group mb-8">
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-[scan_2s_infinite]" />
               <p className="text-xs font-bold text-gray-400 group-hover:text-green-500 transition-colors">CAMÉRA ACTIVE</p>
            </div>

            <Button variant="primary" className="w-full h-14 font-black tracking-widest" onClick={handleSimulateScan}>
               SIMULER LE SCAN
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 flex flex-col items-center text-center py-20">
            <RefreshCw className="w-16 h-16 text-green-500 animate-spin mb-6" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Traitement...</h2>
            <p className="text-sm text-gray-500">Vérification de la borne et calcul de vos points.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-eco-lg animate-bounce">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">BRAVO !</h2>
            <p className="text-green-600 font-bold mb-6 italic text-sm">Recyclage validé avec succès</p>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] w-full p-6 mb-8 border border-gray-100 dark:border-gray-800">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">DÉCHETS</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{scanResult.itemCount} articles</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">GAINS</span>
                  <span className="text-xl font-black text-green-500 flex items-center gap-1">
                     <Zap className="w-5 h-5 fill-current" />
                     +{scanResult.pointsEarned} DA
                  </span>
               </div>
            </div>

            <Button variant="primary" className="w-full h-14 font-black tracking-widest" onClick={() => {
              onFinish();
              onClose();
            }}>
               RETOUR AU DASHBOARD
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerModal;
