import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Menu from '../components/MainMenu';
import ProtectedRoute from './ProtectedRoute';
import MenuGuard from './MenuGuard';
import { useRouteLoading } from './RouteSpinner';
import Reward from '../components/Reward';
import Draw from '../components/Draw';
import MyInfo from '../components/MyInfo';
import Achievements from '../components/Achievements';
import ActivityHistory from '../components/activity/ActivityHistory';
import MissionPage from '../components/mission/MissionPage';
import TeamFormation from '../components/TeamFormation';

const preloadRanking = () => import('../components/Ranking');
const preloadGalleryPage = () => import('../components/gallery/GalleryPage');

const Ranking = lazy(preloadRanking);
const GalleryPage = lazy(preloadGalleryPage);

const AdminUserManagement = lazy(
  () => import('../components/admin/AdminUserManagement'),
);
const AdminEvent = lazy(() => import('../components/admin/AdminEvent'));
const AdminLeague = lazy(() => import('../components/admin/AdminLeague'));
const AdminActivityParticipants = lazy(
  () => import('../components/admin/AdminActivityParticipants'),
);
const AdminMission = lazy(() => import('../components/admin/AdminMission'));
const AdminProducts = lazy(() => import('../components/admin/AdminProducts'));
const AdminTeamFormation = lazy(
  () => import('../components/admin/AdminTeamFormation'),
);

const SuspenseFallback = () => {
  useRouteLoading(true);
  return null;
};

const Router = () => (
  <Suspense fallback={<SuspenseFallback />}>
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/menu" element={<Menu />} />

        <Route element={<MenuGuard menuKey="reward" />}>
          <Route path="/reward" element={<Reward />} />
        </Route>
        <Route element={<MenuGuard menuKey="draw" />}>
          <Route path="/draw" element={<Draw />} />
        </Route>
        <Route element={<MenuGuard menuKey="user" />}>
          <Route path="/myinfo" element={<MyInfo />} />
        </Route>
        <Route element={<MenuGuard menuKey="rank" preload={preloadRanking} />}>
          <Route path="/ranking" element={<Ranking />} />
        </Route>
        <Route path="/achievements" element={<Achievements />} />
        <Route
          element={<MenuGuard menuKey="gallery" preload={preloadGalleryPage} />}
        >
          <Route path="/gallery" element={<GalleryPage />} />
        </Route>
        <Route element={<MenuGuard menuKey="history" />}>
          <Route path="/history" element={<ActivityHistory />} />
        </Route>
        <Route element={<MenuGuard menuKey="mission" />}>
          <Route path="/mission" element={<MissionPage />} />
        </Route>
        <Route element={<MenuGuard menuKey="teams" />}>
          <Route path="/teams" element={<TeamFormation />} />
        </Route>
        <Route path="/admin" element={<AdminUserManagement />} />
        <Route path="/admin/event" element={<AdminEvent />} />
        <Route path="/admin/league" element={<AdminLeague />} />
        <Route
          path="/admin/activity-participants"
          element={<AdminActivityParticipants />}
        />
        <Route
          path="/admin/after-party-participants"
          element={<AdminActivityParticipants mode="afterParty" />}
        />
        <Route path="/admin/mission" element={<AdminMission />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route
          path="/admin/team-formation"
          element={<AdminTeamFormation />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default Router;
