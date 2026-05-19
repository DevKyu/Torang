import { createContext, useCallback, useContext, useState } from 'react';

type LoadingContextType = {
  loading: boolean;
  loadingText: string;
  showLoading: (text?: string) => void;
  showLoadingWithTimeout: (text?: string, duration?: number) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

type LoadingProviderProps = {
  children: React.ReactNode;
};

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [count, setCount] = useState(0);
  const [loadingText, setLoadingText] = useState('잠시만 기다려 주세요.');

  const loading = count > 0;

  const showLoading = useCallback((text?: string) => {
    setLoadingText(text || '잠시만 기다려 주세요.');
    setCount(c => c + 1);
  }, []);

  const hideLoading = useCallback(() => setCount(c => Math.max(0, c - 1)), []);

  const showLoadingWithTimeout = useCallback((text?: string, duration: number = 1000) => {
    showLoading(text);
    setTimeout(() => hideLoading(), duration);
  }, [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider
      value={{
        loading,
        loadingText,
        showLoading,
        showLoadingWithTimeout,
        hideLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context)
    throw new Error('useLoading must be used within LoadingProvider');
  return context;
}
