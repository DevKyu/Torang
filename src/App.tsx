import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Router from './routes/Router';

function App() {
  return (
    <>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
      />
    </>
  );
}

export default App;
