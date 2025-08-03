import { toast } from 'sonner';

const rankingToast = {
  position: 'top-center' as const,
  duration: 2000,
  style: {
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '0.9rem',
  },
};

export const showToast = (message: string, id?: string) => {
  toast(message, {
    id,
    ...rankingToast,
  });
};
