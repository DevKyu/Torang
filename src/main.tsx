import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import BowlingSplash from './components/BowlingSplash';
import './styles/swiper.css';

type AppComponent = React.ComponentType;

const SPLASH_KEY = 'torang_splash';
const splashShown = sessionStorage.getItem(SPLASH_KEY) === '1';

if (splashShown) document.body.style.background = '#f9f9f9';

const loadApp = (): Promise<typeof import('./App')> =>
  import('./App').catch(
    () => new Promise((r) => setTimeout(r, 1000)).then(() => import('./App')),
  );

const appPromise = loadApp();

const FAIL_SCREEN_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 32px',
  background: '#fff',
  textAlign: 'center',
};

const Root = () => {
  const [App, setApp] = useState<AppComponent | null>(null);
  const [splashDone, setSplashDone] = useState(splashShown);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    appPromise
      .then(m => setApp(() => m.default))
      .catch(() => setLoadFailed(true));
  }, []);

  if (loadFailed) {
    return (
      <div style={FAIL_SCREEN_STYLE}>
        <p style={{ fontSize: 15, color: '#374151', margin: 0 }}>
          앱을 불러오지 못했어요.
          <br />
          네트워크 상태를 확인하고 다시 시도해 주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            maxWidth: 240,
            padding: '12px 16px',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: '#0070f3',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <>
      {App && <App />}
      {!splashDone && (
        <BowlingSplash
          readyToComplete={App !== null}
          onComplete={() => {
            sessionStorage.setItem(SPLASH_KEY, '1');
            document.body.style.background = '#f9f9f9';
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
