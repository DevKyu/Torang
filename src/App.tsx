import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import GlobalStyle from './styles/GlobalStyle';
import { LoadingProvider } from './contexts/LoadingContext';
import { LoadingOverlay } from './components/LoadingOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import RouteSpinner from './routes/RouteSpinner';
import Router from './routes/Router';

function App() {
  if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
    document.body.classList.add('ios');
  }
  return (
    <>
      <GlobalStyle />
      <LoadingProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </ErrorBoundary>
        <RouteSpinner />
        <LoadingOverlay />
        <Toaster position="top-center" richColors />
      </LoadingProvider>
    </>
  );
}

export default App;
