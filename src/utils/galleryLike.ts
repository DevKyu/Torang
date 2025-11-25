import { ref, set, remove, onValue } from 'firebase/database';
import { db, getCurrentUserId } from '../services/firebase';
import { scheduleLikeUpdate } from './likeScheduler.ts';

export const toggleGalleryLike = (
  uploadedAt: string,
  imageId: string,
  nextLiked: boolean,
) => {
  const empId = getCurrentUserId();
  if (!empId || !uploadedAt) return;

  const ym = uploadedAt.slice(0, 6);
  const key = `${ym}-${imageId}-${empId}`;

  const likeRef = ref(db, `gallery/${ym}/${imageId}/likes/${empId}`);

  scheduleLikeUpdate(key, nextLiked, async (liked) => {
    if (liked) {
      await set(likeRef, true);
    } else {
      await remove(likeRef);
    }
  });
};

export const subscribeGalleryLikes = (
  uploadedAt: string,
  imageId: string,
  callback: (liked: boolean, count: number) => void,
) => {
  const ym = uploadedAt.slice(0, 6);
  const empId = getCurrentUserId();

  const likeRef = ref(db, `gallery/${ym}/${imageId}/likes`);

  return onValue(likeRef, (snap) => {
    const data = snap.val() || {};
    const count = Object.keys(data).length;
    const liked = empId ? Boolean(data[empId]) : false;
    callback(liked, count);
  });
};
