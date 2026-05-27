import { ref, get, update } from 'firebase/database';
import {
  db,
  getCurrentUserId,
  incrementPinsByEmpId,
} from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';
import { useEventStore } from '../stores/eventStore';
import { showGalleryRewardToast, showGalleryPopularityRewardToast } from './toast';

export const rewardGalleryMaxUpload = async (ym: string, uploadedCount: number) => {
  const empId = getCurrentUserId();
  if (!empId) return null;

  const { upload } = useEventStore.getState().getGalleryReward(ym);
  const { pin, threshold } = upload;
  if (!pin || threshold <= 0 || uploadedCount < threshold) return null;

  const rewardRef = ref(db, `users/${empId}/gallery/uploadReward/${ym}`);
  const snap = await get(rewardRef);
  if (snap.exists()) return null;

  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const rewardedAt = getServerTimestamp();
  const nowMs = getServerNow().getTime();

  await incrementPinsByEmpId(empId, pin);
  await update(ref(db), {
    [`users/${empId}/gallery/uploadReward/${ym}`]: {
      rewarded: true,
      pin,
      rewardedAt,
      rewardedAtMs: nowMs,
    },
    [`users/${empId}/rewards/${ym}/gallery/${rewardedAt}`]: {
      type: 'gallery',
      detail: `사진 ${threshold}장 이상 업로드`,
      direction: 'gain',
      pin,
      ym,
      createdAt: rewardedAt,
      createdAtMs: nowMs,
    },
  });

  showGalleryRewardToast(pin);
  return pin;
};

export const rewardGalleryLikeCreator = async (
  ym: string,
  imageId: string,
  creatorEmpId: string,
  likeUserIds: string[],
): Promise<number | null> => {
  const cfg = useEventStore.getState().getGalleryReward(ym);
  const { pin, threshold } = cfg.likeCreator;
  if (!pin || threshold <= 0) return null;

  const count = likeUserIds.filter((id) => id !== creatorEmpId).length;
  if (count < threshold) return null;

  const checkPath = `users/${creatorEmpId}/gallery/likeCreatorReward/${ym}/${imageId}`;
  const snap = await get(ref(db, checkPath));
  if (snap.exists()) return null;

  const { getServerTimestamp, getServerNow } = useUiStore.getState();
  const rewardedAt = getServerTimestamp();
  const rewardedAtMs = getServerNow().getTime();

  await incrementPinsByEmpId(creatorEmpId, pin);
  await update(ref(db), {
    [checkPath]: { pin, rewardedAt, rewardedAtMs },
    [`users/${creatorEmpId}/rewards/${ym}/gallery/${rewardedAt}`]: {
      type: 'gallery',
      detail: `내 사진 좋아요 ${threshold}개 달성`,
      direction: 'gain',
      pin,
      ym,
      createdAt: rewardedAt,
      createdAtMs: rewardedAtMs,
    },
  });

  showGalleryPopularityRewardToast(pin, 'like', threshold);
  return pin;
};

export const rewardGalleryCommentCreator = async (
  ym: string,
  imageId: string,
  creatorEmpId: string,
  rawComments: Record<string, any>,
): Promise<number | null> => {
  const cfg = useEventStore.getState().getGalleryReward(ym);
  const { pin, threshold } = cfg.commentCreator;
  if (!pin || threshold <= 0) return null;

  const count = Object.values(rawComments).filter(
    (c: any) => !c.deleted && c.empId !== creatorEmpId,
  ).length;
  if (count < threshold) return null;

  const checkPath = `users/${creatorEmpId}/gallery/commentCreatorReward/${ym}/${imageId}`;
  const snap = await get(ref(db, checkPath));
  if (snap.exists()) return null;

  const { getServerTimestamp, getServerNow } = useUiStore.getState();
  const rewardedAt = getServerTimestamp();
  const rewardedAtMs = getServerNow().getTime();

  await incrementPinsByEmpId(creatorEmpId, pin);
  await update(ref(db), {
    [checkPath]: { pin, rewardedAt, rewardedAtMs },
    [`users/${creatorEmpId}/rewards/${ym}/gallery/${rewardedAt}`]: {
      type: 'gallery',
      detail: `내 사진 댓글 ${threshold}개 달성`,
      direction: 'gain',
      pin,
      ym,
      createdAt: rewardedAt,
      createdAtMs: rewardedAtMs,
    },
  });

  showGalleryPopularityRewardToast(pin, 'comment', threshold);
  return pin;
};
