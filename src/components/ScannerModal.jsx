import { useState, useEffect, useRef } from 'react';
import { X, Camera, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { gamificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from './Button';

const ScannerModal = ({ isOpen, onClose, onFinish }) => {
  const [step, setStep] = useState('scanning'); // scanning -> processing -> success
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && step === 'scanning') {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, step]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleScan = async () => {
    setStep('processing');
    stopCamera();
    try {
      await new Promise(r => setTimeout(r, 1500));
      const data = await gamificationAPI.scan('m1');
      setScanResult(data);
      setStep('success');
    } catch (err) {
      toast.error('Échec du scan');
      setStep('scanning');
    }
  };

  const handleClose = () => {
    stopCamera();
    setStep('scanning');
    setScanResult(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative animate-slide-up">
        
        <button onClick={handleClose} className="absolute top-6 right-6 w-10 h-10 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center z-20">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {step === 'scanning' && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6 relative">
              <Camera className="w-10 h-10 text-green-500" />
              <div className="absolute inset-0 border-2 border-green-500 rounded-3xl animate-pulse scale-110 opacity-50" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Scanner une borne</h2>
            <p className="text-sm text-gray-500 mb-6 px-4">Placez le QR code de la borne dans le cadre pour recycler vos déchets.</p>
            
            {/* Live Camera Feed */}
            <div className="w-full aspect-square bg-black rounded-[2rem] relative overflow-hidden mb-6 border-4 border-green-500/30">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-900">
                  <Camera className="w-10 h-10 text-gray-500 mb-3" />
                  <p className="text-xs font-bold text-gray-400">{cameraError}</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Scan Line Animation */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-[scan_2s_infinite]" />
                  </div>
                  {/* Corner Markers */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
                </>
              )}
            </div>

            <Button variant="primary" className="w-full h-14 font-black tracking-widest" onClick={handleScan}>
               SCANNER MAINTENANT
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
                  <span className="text-sm font-black text-gray-900 dark:text-white">{scanResult?.itemCount} articles</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">GAINS</span>
                  <span className="text-xl font-black text-green-500 flex items-center gap-1">
                     <Zap className="w-5 h-5 fill-current" />
                     +{scanResult?.pointsEarned} DA
                  </span>
               </div>
            </div>

            <Button variant="primary" className="w-full h-14 font-black tracking-widest" onClick={() => {
              onFinish();
              handleClose();
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
