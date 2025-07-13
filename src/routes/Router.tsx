import { Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Menu from '../components/MainMenu';
import Reward from '../components/Reward';
import Draw from '../components/Draw';
import MyInfo from '../components/MyInfo';

const Router = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/menu" element={<Menu />} />
    <Route path="/reward" element={<Reward />} />
    <Route path="/draw" element={<Draw />} />
    <Route path="/myinfo" element={<MyInfo />} />
  </Routes>
);

export default Router;
