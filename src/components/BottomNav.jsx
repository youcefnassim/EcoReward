import { NavLink } from 'react-router-dom';
import { Home, Map as MapIcon, Gift, User, Search } from 'lucide-react';
import { clsx } from 'clsx';

import { useI18n } from '../context/I18nContext';

const navItems = [
  { path: '/', labelKey: 'home', icon: Home },
  { path: '/map', labelKey: 'map', icon: MapIcon },
  { path: '/rewards', labelKey: 'rewards', icon: Gift },
  { path: '/settings', labelKey: 'settings', icon: User },
];

const BottomNav = () => {
  const { t } = useI18n();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 pb-safe z-[1000] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, labelKey, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'relative flex flex-col items-center justify-center w-16 h-12 transition-all duration-300',
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={clsx(
                    'w-6 h-6 transition-all duration-300 z-10',
                    isActive ? 'scale-110 -translate-y-1' : ''
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={clsx(
                    'text-[10px] font-bold transition-all duration-300',
                    isActive ? 'opacity-100' : 'opacity-0 scale-75 translate-y-2'
                  )}
                >
                  {t(labelKey)}
                </span>
                
                {/* Modern Active Indicator Bubble */}
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-2xl animate-pulse shadow-sm" />
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
