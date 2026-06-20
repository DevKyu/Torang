import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useEventStore } from '../stores/eventStore';
import { useRouteLoading } from './RouteSpinner';

type MenuGuardProps = {
  menuKey: string;
  preload?: () => Promise<unknown>;
};

const MenuGuard = ({ menuKey, preload }: MenuGuardProps) => {
  const loadEventConfig = useEventStore((s) => s.loadEventConfig);
  const loaded = useEventStore((s) => s.loaded);

  useEffect(() => {
    if (!loaded) loadEventConfig();
  }, [loaded, loadEventConfig]);

  useEffect(() => {
    preload?.().catch(() => {});
  }, [preload]);

  useRouteLoading(!loaded);

  if (!loaded) return null;

  if (useEventStore.getState().isMenuBlocked(menuKey)) {
    return <Navigate to="/menu" replace />;
  }
  return <Outlet />;
};

export default MenuGuard;
