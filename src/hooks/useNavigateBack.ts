import { useNavigate, useLocation } from 'react-router-dom';

export function useNavigateBack(fallback = '/menu') {
  const navigate = useNavigate();
  const { key } = useLocation();
  return () => {
    if (key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
}
