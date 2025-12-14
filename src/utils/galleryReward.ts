import { ref, get, update } from 'firebase/database';
import {
  db,
  getCurrentUserId,
  incrementPinsByEmpId,
} from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';
import { GALLERY_POLICY } from './galleryPolicy';
import { showGalleryRewardToast } from './toast';

export const rewardGalleryMaxUpload = async (yyyymm: string) => {
  const empId = getCurrentUserId();
  if (!empId) return null;

  const rewardRef = ref(db, `users/${empId}/gallery/uploadReward/${yyyymm}`);

  const snap = await get(rewardRef);
  if (snap.exists()) return null;

  const { getServerNow, getServerTimestamp } = useUiStore.getState();

  const rewardedAt = getServerTimestamp();
  const nowMs = getServerNow().getTime();
  const pin = GALLERY_POLICY.REWARD_PIN;

  await incrementPinsByEmpId(empId, pin);
  await update(ref(db), {
    [`users/${empId}/gallery/uploadReward/${yyyymm}`]: {
      rewarded: true,
      pin,
      rewardedAt,
      rewardedAtMs: nowMs,
    },

    [`users/${empId}/rewards/${yyyymm}/gallery/${rewardedAt}`]: {
      type: 'gallery',
      detail: `사진 ${GALLERY_POLICY.REWARD_THRESHOLD}장 이상 업로드`,
      direction: 'gain',
      pin,
      ym: yyyymm,
      createdAt: rewardedAt,
      createdAtMs: nowMs,
    },
  });

  showGalleryRewardToast(pin);

  return pin;
};
