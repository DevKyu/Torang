import { ref, set, remove, onValue } from 'firebase/database';
import { db, getCurrentUserId } from '../services/firebase';
import { scheduleLikeUpdate } from './likeScheduler.ts';

export const toggleGalleryLike = (
  ym: string,
  imageId: string,
  nextLiked: boolean,
) => {
  const empId = getCurrentUserId();
  if (!empId || !ym) return;

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
  ym: string,
  imageId: string,
  callback: (liked: boolean, count: number) => void,
) => {
  const empId = getCurrentUserId();
  const likeRef = ref(db, `gallery/${ym}/${imageId}/likes`);

  return onValue(likeRef, (snap) => {
    const data = snap.val() || {};
    const count = Object.keys(data).length;
    const liked = empId ? Boolean(data[empId]) : false;
    callback(liked, count);
  });
};
