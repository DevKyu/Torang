import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoadingProvider } from './contexts/LoadingContext';
import { LoadingOverlay } from './components/LoadingOverlay';
import Router from './routes/Router';

function App() {
  return (
    <>
      <LoadingProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
        <LoadingOverlay />
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={true}
        />
      </LoadingProvider>
    </>
  );
}

export default App;
