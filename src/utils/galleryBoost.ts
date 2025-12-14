import { ref, get, update } from 'firebase/database';
import {
  db,
  getCurrentUserId,
  incrementPinsByEmpId,
} from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';
import { GALLERY_POLICY } from './galleryPolicy';

export const applyGalleryBoost = async (yyyymm: string) => {
  const empId = getCurrentUserId();
  if (!empId) return null;

  const { getServerNow, getServerTimestamp } = useUiStore.getState();

  const usageId = getServerTimestamp();
  const nowMs = getServerNow().getTime();

  const countRef = ref(db, `users/${empId}/gallery/uploadCount/${yyyymm}`);

  const snap = await get(countRef);

  const current = snap.exists()
    ? Number(snap.val())
    : GALLERY_POLICY.BASE_UPLOAD;

  const next = current + GALLERY_POLICY.BOOST_AMOUNT;

  await incrementPinsByEmpId(empId, -1);

  await update(ref(db), {
    [`users/${empId}/gallery/uploadCount/${yyyymm}`]: next,
    [`users/${empId}/gallery/pinUsage/${yyyymm}/${usageId}`]: {
      type: 'gallery_boost',
      detail: `업로드 횟수 +${GALLERY_POLICY.BOOST_AMOUNT}`,
      delta: -1,
      createdAt: usageId,
      createdAtMs: nowMs,
    },
  });

  return next;
};
