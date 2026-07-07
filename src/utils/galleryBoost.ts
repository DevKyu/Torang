import { ref, get, update, runTransaction } from 'firebase/database';
import { db, getCurrentUserId } from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';
import { GALLERY_POLICY } from './galleryPolicy';

export const applyGalleryBoost = async (ym: string) => {
  const empId = getCurrentUserId();
  if (!empId) return null;

  const { getServerNow, getServerTimestamp, formatServerDate } = useUiStore.getState();

  const createdAt = getServerTimestamp();
  const usageKey = formatServerDate('ymdhmsms');
  const nowMs = getServerNow().getTime();

  const countRef = ref(db, `users/${empId}/gallery/uploadCount/${ym}`);

  const snap = await get(countRef);

  const current = snap.exists()
    ? Number(snap.val())
    : GALLERY_POLICY.BASE_UPLOAD;

  const next = current + GALLERY_POLICY.BOOST_AMOUNT;

  const tx = await runTransaction(ref(db, `users/${empId}/pin`), (cur) => {
    const pin = typeof cur === 'number' ? cur : 0;
    if (pin < 1) return;
    return pin - 1;
  });
  if (!tx.committed) return null;

  await update(ref(db), {
    [`users/${empId}/gallery/uploadCount/${ym}`]: next,
    [`users/${empId}/gallery/pinUsage/${ym}/${usageKey}`]: {
      type: 'gallery_boost',
      detail: `업로드 횟수 +${GALLERY_POLICY.BOOST_AMOUNT}`,
      delta: -1,
      createdAt,
      createdAtMs: nowMs,
    },
  });

  return next;
};
