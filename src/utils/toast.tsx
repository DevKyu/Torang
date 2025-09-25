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

const hiddenNamesBaseToast = {
  position: 'top-center' as const,
  style: {
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '0.9rem',
  },
};
export const showHiddenNamesToast = (names?: string[]) => {
  const safeNames = names ?? [];

  toast.dismiss();

  if (!safeNames.length) {
    toast('🙅 추가 인원 없음', {
      ...hiddenNamesBaseToast,
      duration: 2000,
      style: {
        ...hiddenNamesBaseToast.style,
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        fontWeight: 600,
      },
    });
    return;
  }

  toast(
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span>👥 숨겨진 신청자</span>
      <span style={{ fontSize: '0.8rem', color: '#374151' }}>
        {safeNames.join(', ')}
      </span>
    </div>,
    {
      ...hiddenNamesBaseToast,
      duration: 3000,
      style: {
        ...hiddenNamesBaseToast.style,
        backgroundColor: '#fff7ed',
        color: '#9a3412',
      },
    },
  );
};

export const showMatchWithPinToast = (amount: number) => {
  toast('🏆 핀 쟁탈전 승리!', {
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
        🎳 또랑핀 <b style={{ fontWeight: 700 }}>{formatPins(amount)}</b>개
        획득!
      </span>,
      {
        ...baseToast,
        duration: 2000,
        style: {
          ...baseToast.style,
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          fontWeight: 600,
        },
      },
    );
  }, 1500);
};

const formatPins = (value: number) => {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};
