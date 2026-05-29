import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Menu from '../components/MainMenu';
import ProtectedRoute from './ProtectedRoute';
import Reward from '../components/Reward';
import Draw from '../components/Draw';
import MyInfo from '../components/MyInfo';
import Ranking from '../components/Ranking';
import Achievements from '../components/Achievements';
import GalleryPage from '../components/gallery/GalleryPage';
import ActivityHistory from '../components/activity/ActivityHistory';
import MissionPage from '../components/mission/MissionPage';

const AdminUserManagement = lazy(
  () => import('../components/admin/AdminUserManagement'),
);
const AdminEvent = lazy(() => import('../components/admin/AdminEvent'));
const AdminLeague = lazy(() => import('../components/admin/AdminLeague'));
const AdminActivityParticipants = lazy(
  () => import('../components/admin/AdminActivityParticipants'),
);
const AdminMission = lazy(() => import('../components/admin/AdminMission'));

const Router = () => (
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

      <Suspense fallback={null}>
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
      </Suspense>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default Router;
