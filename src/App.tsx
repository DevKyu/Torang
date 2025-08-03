import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'sonner';
import GlobalStyle from './styles/GlobalStyle';
import { LoadingProvider } from './contexts/LoadingContext';
import { LoadingOverlay } from './components/LoadingOverlay';
import Router from './routes/Router';

function App() {
  return (
    <>
      <GlobalStyle />
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
        <Toaster position="bottom-center" richColors />
      </LoadingProvider>
    </>
  );
}

export default App;
