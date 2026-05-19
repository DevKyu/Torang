import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import ProtectedRoute from './ProtectedRoute';

const Menu           = lazy(() => import('../components/MainMenu'));
const Reward         = lazy(() => import('../components/Reward'));
const Draw           = lazy(() => import('../components/Draw'));
const MyInfo         = lazy(() => import('../components/MyInfo'));
const Ranking        = lazy(() => import('../components/Ranking'));
const Achievements   = lazy(() => import('../components/Achievements'));
const GalleryPage    = lazy(() => import('../components/gallery/GalleryPage'));
const ActivityHistory = lazy(() => import('../components/activity/ActivityHistory'));
const MissionPage    = lazy(() => import('../components/mission/MissionPage'));
const AdminUserManagement      = lazy(() => import('../components/admin/AdminUserManagement'));
const AdminEvent               = lazy(() => import('../components/admin/AdminEvent'));
const AdminLeague              = lazy(() => import('../components/admin/AdminLeague'));
const AdminActivityParticipants = lazy(() => import('../components/admin/AdminActivityParticipants'));
const AdminMission             = lazy(() => import('../components/admin/AdminMission'));

const Router = () => (
  <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f9f9f9' }} />}>
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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default Router;
