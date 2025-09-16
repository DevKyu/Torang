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

export const showToast = (
  message: string,
  id?: string,
  type?: 'pick' | 'unpick',
) => {
  const icon = type === 'pick' ? '⚔️' : type === 'unpick' ? '❌' : '';

  toast(`${icon ? icon + ' ' : ''}${message}`, {
    id,
    ...rankingToast,
  });
};

const baseToast = {
  position: 'top-center' as const,
  style: {
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '0.9rem',
  },
};

export const showAchievementWithPinToast = (amount: number) => {
  toast('🏆 새로운 업적 달성', {
    ...baseToast,
    duration: 2000,
    style: {
      ...baseToast.style,
      backgroundColor: '#eff6ff',
      color: '#1e40af',
      fontWeight: 600,
    },
  });

  setTimeout(() => {
    toast(
      <span>
        🎳 또랑핀 <b style={{ fontWeight: 700 }}>{amount}</b>개 획득!
      </span>,
      {
        ...baseToast,
        duration: 2000,
        style: {
          ...baseToast.style,
          backgroundColor: '#ecfdf5',
          color: '#065f46',
        },
      },
    );
  }, 1500);
};
