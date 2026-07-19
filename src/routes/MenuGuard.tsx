import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useEventStore } from '../stores/eventStore';
import { useUiStore } from '../stores/useUiStore';
import { useRouteLoading } from './RouteSpinner';

type MenuGuardProps = {
  menuKey: string;
  preload?: () => Promise<unknown>;
};

const MenuGuard = ({ menuKey, preload }: MenuGuardProps) => {
  const loadEventConfig = useEventStore((s) => s.loadEventConfig);
  const loaded = useEventStore((s) => s.loaded);
  const syncServerTime = useUiStore((s) => s.syncServerTime);
  const lastSync = useUiStore((s) => s.lastSync);

  useEffect(() => {
    if (!loaded) loadEventConfig();
  }, [loaded, loadEventConfig]);

  useEffect(() => {
    if (lastSync === null) syncServerTime();
  }, [lastSync, syncServerTime]);

  useEffect(() => {
    preload?.().catch(() => {});
  }, [preload]);

  const ready = loaded && lastSync !== null;
  useRouteLoading(!ready);

  if (!ready) return null;

  if (useEventStore.getState().isMenuBlocked(menuKey)) {
    return <Navigate to="/menu" replace />;
  }
  return <Outlet />;
};

export default MenuGuard;
