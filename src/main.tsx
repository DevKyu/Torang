import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import BowlingSplash from './components/BowlingSplash';
import './styles/swiper.css';

type AppComponent = React.ComponentType;

const SPLASH_KEY = 'torang_splash';
const splashShown = sessionStorage.getItem(SPLASH_KEY) === '1';

if (splashShown) document.body.style.background = '#fff';

const appPromise = import('./App');

const Root = () => {
  const [App, setApp] = useState<AppComponent | null>(null);
  const [splashDone, setSplashDone] = useState(splashShown);

  useEffect(() => {
    appPromise
      .then(m => setApp(() => m.default))
      .catch(() => window.location.reload());
  }, []);

  return (
    <>
      {App && <App />}
      {!splashDone && (
        <BowlingSplash
          readyToComplete={App !== null}
          onComplete={() => {
            sessionStorage.setItem(SPLASH_KEY, '1');
            document.body.style.background = '#fff';
            setSplashDone(true);
          }}
        />
      )}
    </>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
