import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate, Outlet } from 'react-router-dom';
import { auth, empIdFromEmail } from '../services/firebase';
import { useRouteLoading } from './RouteSpinner';

const ProtectedRoute = () => {
  const [status, setStatus] = useState<'loading' | 'ok' | 'unauth'>('loading');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const isAuth = !!empIdFromEmail(user?.email);
      setStatus(isAuth ? 'ok' : 'unauth');
    });
    return unsub;
  }, []);

  useRouteLoading(status === 'loading');

  if (status === 'loading') return null;
  if (status === 'unauth') return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
