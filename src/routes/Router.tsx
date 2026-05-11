import { Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Menu from '../components/MainMenu';
import Reward from '../components/Reward';
import Draw from '../components/Draw';
import MyInfo from '../components/MyInfo';
import ActivityHistory from '../components/activity/ActivityHistory';
import Ranking from '../components/Ranking';
import Achievements from '../components/Achievements';
import GalleryPage from '../components/gallery/GalleryPage';
import AdminUserManagement from '../components/admin/AdminUserManagement';
import AdminEvent from '../components/admin/AdminEvent';
import AdminLeague from '../components/admin/AdminLeague';
import AdminActivityParticipants from '../components/admin/AdminActivityParticipants';

const Router = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/menu" element={<Menu />} />
    <Route path="/reward" element={<Reward />} />
    <Route path="/draw" element={<Draw />} />
    <Route path="/myinfo" element={<MyInfo />} />
    <Route path="/ranking" element={<Ranking />} />
    <Route path="/achievements" element={<Achievements />} />
    <Route path="/admin" element={<AdminUserManagement />} />
    <Route path="/admin/event" element={<AdminEvent />} />
    <Route path="/admin/league" element={<AdminLeague />} />
    <Route
      path="/admin/activity-participants"
      element={<AdminActivityParticipants />}
    />
    <Route path="/gallery" element={<GalleryPage />} />
    <Route path="/history" element={<ActivityHistory />} />
  </Routes>
);

export default Router;
