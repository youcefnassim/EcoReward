import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '../hooks/useAuth';
import { clsx } from 'clsx';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <main className={clsx(
        "page-container",
        !isMapPage && "pb-24"
      )}>
        <Outlet />
      </main>
      {isAuthenticated && <BottomNav />}
    </div>
  );
};

export default Layout;
