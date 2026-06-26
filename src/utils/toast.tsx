import { toast } from 'sonner';
import type { MatchType } from '../types/match';

const formatPins = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const base = {
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

const colored = (bg: string, color: string) => ({
  ...base,
  style: { ...base.style, backgroundColor: bg, color, fontWeight: 600 },
});

const BLUE   = colored('#eff6ff', '#1e40af');
const GREEN  = colored('#ecfdf5', '#065f46');
const PINK   = colored('#fdf2f8', '#9d174d');
const RED    = colored('#fef2f2', '#b91c1c');
const ORANGE = colored('#fff7ed', '#9a3412');

const showDelayedPinToast = (amount: number) => {
  setTimeout(() => {
    toast(
      <span>
        🎳 또랑핀 <b style={{ fontWeight: 700 }}>{formatPins(amount)}</b>개 획득!
      </span>,
      GREEN,
    );
  }, 1500);
};

export const showToast = (
  message: string,
  id?: string,
  type?: 'pick' | 'unpick',
) => {
  const icon = type === 'pick' ? '⚔️' : type === 'unpick' ? '❌' : '';
  toast(`${icon ? icon + ' ' : ''}${message}`, { id, ...base });
};

export const showAchievementToast = () => {
  toast('🏆 새로운 업적 달성', BLUE);
};

export const showPinRewardToast = (amount: number) => {
  toast(
    <span>
      🎳 또랑핀 <b style={{ fontWeight: 700 }}>{amount}</b>개 획득!
    </span>,
    GREEN,
  );
};

export const showHiddenNamesToast = (
  productName?: string,
  names?: string[],
) => {
  const safeNames = names ?? [];
  toast.dismiss();

  if (!safeNames.length) {
    toast('🙅 추가 인원 없음', RED);
    return;
  }

  toast(
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span>
        👥 [{productName}] 신청자 ({safeNames.length}명)
      </span>
      <span style={{ fontSize: '0.8rem', color: '#374151' }}>
        {safeNames.join(', ')}
      </span>
    </div>,
    { ...ORANGE, duration: 3000 },
  );
};

export const showMatchWithPinToast = (amount: number, type: MatchType) => {
  const title = type === 'rival' ? '🏆 라이벌 매치 승리!' : '🏆 핀 쟁탈전 승리!';
  toast(title, BLUE);
  showDelayedPinToast(amount);
};

export const showTargetWithPinToast = (amount: number) => {
  toast('🎯 목표 점수 달성!', BLUE);
  showDelayedPinToast(amount);
};

export const showGalleryRewardToast = (amount: number) => {
  toast('📸 사진 업로드 미션 성공!', BLUE);
  showDelayedPinToast(amount);
};

export const showGalleryPopularityRewardToast = (
  amount: number,
  type: 'like' | 'comment',
  threshold: number,
) => {
  const title =
    type === 'like'
      ? `❤️ 내 사진 좋아요 ${threshold}개 달성!`
      : `💬 내 사진 댓글 ${threshold}개 달성!`;
  toast(title, PINK);
  showDelayedPinToast(amount);
};

export const showReferrerRewardToast = (amount: number) => {
  toast('🤝 친구 추천으로 가입했어요!', BLUE);
  showDelayedPinToast(amount);
};
