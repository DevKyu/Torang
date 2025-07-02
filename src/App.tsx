import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
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
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 1000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </LoadingProvider>
    </>
  );
}

export default App;
