import { Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Reward from '../components/Reward';

const Router = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/reward" element={<Reward />} />
  </Routes>
);

export default Router;
