import { createContext, useContext, useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('잠시만 기다려주세요.');

  const showLoading = (text?: string) => {
    setLoadingText(text || '잠시만 기다려주세요.');
    setLoading(true);
  };

  const showLoadingWithTimeout = (text?: string, duration: number = 1000) => {
    showLoading(text);
    setTimeout(() => {
      hideLoading();
    }, duration);
  };

  const hideLoading = () => setLoading(false);

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
