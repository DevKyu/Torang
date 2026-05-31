import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Menu from '../components/MainMenu';
import ProtectedRoute from './ProtectedRoute';
import Reward from '../components/Reward';
import Draw from '../components/Draw';
import MyInfo from '../components/MyInfo';
import Achievements from '../components/Achievements';
import ActivityHistory from '../components/activity/ActivityHistory';
import MissionPage from '../components/mission/MissionPage';
import TeamFormation from '../components/TeamFormation';

const Ranking = lazy(() => import('../components/Ranking'));
const GalleryPage = lazy(() => import('../components/gallery/GalleryPage'));

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

const Router = () => (
  <Suspense fallback={null}>
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/menu" element={<Menu />} />
        <Route path="/reward" element={<Reward />} />
        <Route path="/draw" element={<Draw />} />
        <Route path="/myinfo" element={<MyInfo />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/history" element={<ActivityHistory />} />
        <Route path="/mission" element={<MissionPage />} />
        <Route path="/teams" element={<TeamFormation />} />
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
