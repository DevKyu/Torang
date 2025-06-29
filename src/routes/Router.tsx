import { Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Reward from '../components/Reward';
import Draw from '../components/Draw';

const Router = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/reward" element={<Reward />} />
    <Route path="/draw" element={<Draw />} />
  </Routes>
);

export default Router;
