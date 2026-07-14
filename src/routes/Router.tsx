import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Login from '../components/pages/Login';
import Menu from '../components/pages/MainMenu';
import ProtectedRoute from './ProtectedRoute';
import MenuGuard from './MenuGuard';
import { useRouteLoading } from './RouteSpinner';
import {
  preloadAchievements,
  preloadMyInfo,
  preloadRanking,
  preloadGalleryPage,
  preloadReward,
  preloadDraw,
  preloadActivityHistory,
  preloadMissionPage,
  preloadTeamFormation,
} from './lazyPreloads';

const Achievements = lazy(preloadAchievements);
const MyInfo = lazy(preloadMyInfo);
const Ranking = lazy(preloadRanking);
const GalleryPage = lazy(preloadGalleryPage);
const Reward = lazy(preloadReward);
const Draw = lazy(preloadDraw);
const ActivityHistory = lazy(preloadActivityHistory);
const MissionPage = lazy(preloadMissionPage);
const TeamFormation = lazy(preloadTeamFormation);

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
const AdminMessages = lazy(() => import('../components/admin/AdminMessages'));
const AdminMonthlyChecklist = lazy(
  () => import('../components/admin/AdminMonthlyChecklist'),
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

        <Route element={<MenuGuard menuKey="reward" preload={preloadReward} />}>
          <Route path="/reward" element={<Reward />} />
        </Route>
        <Route element={<MenuGuard menuKey="draw" preload={preloadDraw} />}>
          <Route path="/draw" element={<Draw />} />
        </Route>
        <Route element={<MenuGuard menuKey="user" preload={preloadMyInfo} />}>
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
        <Route
          element={
            <MenuGuard menuKey="history" preload={preloadActivityHistory} />
          }
        >
          <Route path="/history" element={<ActivityHistory />} />
        </Route>
        <Route
          element={<MenuGuard menuKey="mission" preload={preloadMissionPage} />}
        >
          <Route path="/mission" element={<MissionPage />} />
        </Route>
        <Route
          element={
            <MenuGuard menuKey="teams" preload={preloadTeamFormation} />
          }
        >
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
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route
          path="/admin/monthly-checklist"
          element={<AdminMonthlyChecklist />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default Router;
