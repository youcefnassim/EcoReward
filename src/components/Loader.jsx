/**
 * Full-screen global loader
 */
const Loader = ({ message = 'Chargement...' }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-50 animate-fade-in">
      {/* Animated recycle icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 text-green-600 animate-spin-slow"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
            <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
            <path d="m14 16-3 3 3 3" />
            <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
            <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
            <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
          </svg>
        </div>
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-3xl border-2 border-green-400 animate-ping opacity-30" />
      </div>

      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{message}</p>
      <p className="text-sm text-gray-400 mt-1">EcoReward</p>

      {/* Progress bar */}
      <div className="mt-6 w-48 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
