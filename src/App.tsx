import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import GlobalStyle from './styles/GlobalStyle';
import { LoadingProvider } from './contexts/LoadingContext';
import { LoadingOverlay } from './components/LoadingOverlay';
import Router from './routes/Router';

function App() {
  if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
    document.body.classList.add('ios');
  }
  return (
    <>
      <GlobalStyle />
      <LoadingProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
        <LoadingOverlay />
        <Toaster position="top-center" richColors />
      </LoadingProvider>
    </>
  );
}

export default App;
