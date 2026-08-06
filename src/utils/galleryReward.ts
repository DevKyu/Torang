import { ref, update, runTransaction, increment } from 'firebase/database';
import { db, getCurrentUserId } from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';
import { useEventStore } from '../stores/useEventStore';
import { showGalleryRewardToast, showGalleryPopularityRewardToast } from './toast';
import type { LightboxComment } from '../types/lightbox';

export const rewardGalleryMaxUpload = async (ym: string, uploadedCount: number) => {
  const empId = getCurrentUserId();
  if (!empId) return null;

  const { upload } = useEventStore.getState().getGalleryReward(ym);
  const { pin, threshold } = upload;
  if (!pin || threshold <= 0 || uploadedCount < threshold) return null;

  const { getServerNow, getServerTimestamp, formatServerDate } = useUiStore.getState();
  const rewardedAt = getServerTimestamp();
  const rewardKey = formatServerDate('ymdhmsms');
  const nowMs = getServerNow().getTime();

  const rewardPath = `users/${empId}/gallery/uploadReward/${ym}`;
  const claim = await runTransaction(ref(db, rewardPath), (cur) =>
    cur === null ? { rewarded: true, pin, rewardedAt, rewardedAtMs: nowMs } : undefined,
  );
  if (!claim.committed) return null;

  try {
    await update(ref(db), {
      [`users/${empId}/pin`]: increment(pin),
      [`users/${empId}/rewards/${ym}/gallery/${rewardKey}`]: {
        type: 'gallery',
        detail: `사진 ${threshold}장 이상 업로드`,
        direction: 'gain',
        pin,
        ym,
        createdAt: rewardedAt,
        createdAtMs: nowMs,
      },
    });
  } catch (err) {
    await update(ref(db), { [rewardPath]: null }).catch(() => {});
    throw err;
  }

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
  const { getServerTimestamp, getServerNow, formatServerDate } = useUiStore.getState();
  const rewardedAt = getServerTimestamp();
  const rewardKey = formatServerDate('ymdhmsms');
  const rewardedAtMs = getServerNow().getTime();

  const claim = await runTransaction(ref(db, checkPath), (cur) =>
    cur === null ? { pin, rewardedAt, rewardedAtMs } : undefined,
  );
  if (!claim.committed) return null;

  try {
    await update(ref(db), {
      [`users/${creatorEmpId}/pin`]: increment(pin),
      [`users/${creatorEmpId}/rewards/${ym}/gallery/${rewardKey}`]: {
        type: 'gallery',
        detail: `내 사진 좋아요 ${threshold}개 달성`,
        direction: 'gain',
        pin,
        ym,
        createdAt: rewardedAt,
        createdAtMs: rewardedAtMs,
      },
    });
  } catch (err) {
    await update(ref(db), { [checkPath]: null }).catch(() => {});
    throw err;
  }

  showGalleryPopularityRewardToast(pin, 'like', threshold);
  return pin;
};

export const rewardGalleryCommentCreator = async (
  ym: string,
  imageId: string,
  creatorEmpId: string,
  rawComments: Record<string, LightboxComment>,
): Promise<number | null> => {
  const cfg = useEventStore.getState().getGalleryReward(ym);
  const { pin, threshold } = cfg.commentCreator;
  if (!pin || threshold <= 0) return null;

  const uniqueEmpIds = new Set(
    Object.values(rawComments)
      .filter((c) => !c.deleted && !c.parentId && c.empId !== creatorEmpId)
      .map((c) => c.empId),
  );
  const count = uniqueEmpIds.size;
  if (count < threshold) return null;

  const checkPath = `users/${creatorEmpId}/gallery/commentCreatorReward/${ym}/${imageId}`;
  const { getServerTimestamp, getServerNow, formatServerDate } = useUiStore.getState();
  const rewardedAt = getServerTimestamp();
  const rewardKey = formatServerDate('ymdhmsms');
  const rewardedAtMs = getServerNow().getTime();

  const claim = await runTransaction(ref(db, checkPath), (cur) =>
    cur === null ? { pin, rewardedAt, rewardedAtMs } : undefined,
  );
  if (!claim.committed) return null;

  try {
    await update(ref(db), {
      [`users/${creatorEmpId}/pin`]: increment(pin),
      [`users/${creatorEmpId}/rewards/${ym}/gallery/${rewardKey}`]: {
        type: 'gallery',
        detail: `내 사진 댓글 ${threshold}개 달성`,
        direction: 'gain',
        pin,
        ym,
        createdAt: rewardedAt,
        createdAtMs: rewardedAtMs,
      },
    });
  } catch (err) {
    await update(ref(db), { [checkPath]: null }).catch(() => {});
    throw err;
  }

  showGalleryPopularityRewardToast(pin, 'comment', threshold);
  return pin;
};
