import { ToastContainer } from 'react-toastify';
import LoginScreen from './components/LoginScreen';
import RewardLayout from './components/RewardLayout';

function App() {
  return (
    <>
      <RewardLayout />
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;
