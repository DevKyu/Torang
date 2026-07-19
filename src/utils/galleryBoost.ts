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
  const pinRef = ref(db, `users/${empId}/pin`);

  const pinSnap = await get(pinRef);
  const serverPin = typeof pinSnap.val() === 'number' ? pinSnap.val() : 0;
  if (serverPin < 1) return null;

  const tx = await runTransaction(pinRef, (cur) => {
    const pin = typeof cur === 'number' ? cur : serverPin;
    if (pin < 1) return;
    return pin - 1;
  });
  if (!tx.committed) return null;

  const countTx = await runTransaction(countRef, (cur) => {
    const base = typeof cur === 'number' ? cur : GALLERY_POLICY.BASE_UPLOAD;
    return base + GALLERY_POLICY.BOOST_AMOUNT;
  });
  const next =
    typeof countTx.snapshot.val() === 'number'
      ? (countTx.snapshot.val() as number)
      : GALLERY_POLICY.BASE_UPLOAD + GALLERY_POLICY.BOOST_AMOUNT;

  await update(ref(db), {
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
