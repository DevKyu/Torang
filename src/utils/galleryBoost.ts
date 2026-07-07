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

  const [snap, pinSnap] = await Promise.all([get(countRef), get(pinRef)]);

  const current = snap.exists()
    ? Number(snap.val())
    : GALLERY_POLICY.BASE_UPLOAD;

  const next = current + GALLERY_POLICY.BOOST_AMOUNT;

  const serverPin = typeof pinSnap.val() === 'number' ? pinSnap.val() : 0;
  if (serverPin < 1) return null;

  const tx = await runTransaction(pinRef, (cur) => {
    // cur는 캐시 미적재 시 null로 먼저 호출됨 — abort 대신 서버 읽기 값으로 시드
    const pin = typeof cur === 'number' ? cur : serverPin;
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
