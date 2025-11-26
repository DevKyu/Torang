import { ref, get, set, update, remove, onValue, off } from 'firebase/database';
import { db, getCurrentUserId, getCachedUserName } from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';
import { scheduleLikeUpdate } from './likeScheduler';
import type { LightboxComment } from '../types/lightbox';

type Raw = {
  parentId?: string | null;
  empId?: string;
  userName?: string;
  text?: string;
  createdAt?: number | string;
  deleted?: boolean;
  likes?: Record<string, true>;
};

const getYm = (uploadedAt: string) => uploadedAt.slice(0, 6);

const createCommentId = (empId: string) => {
  const fmt = useUiStore.getState().formatServerDate;
  return `${empId}_${fmt('ymdhmsms')}`;
};

const convertRaw = (
  raw: Record<string, Raw>,
  empId: string | null,
): LightboxComment[] =>
  Object.entries(raw).map(([cid, v]) => ({
    id: cid,
    parentId: v.parentId ?? null,
    user: v.userName ?? getCachedUserName(v.empId ?? ''),
    text: v.deleted ? '' : (v.text ?? ''),
    createdAt: Number(v.createdAt ?? 0),
    deleted: Boolean(v.deleted),
    likes: v.likes ? Object.keys(v.likes).length : 0,
    likedByMe: empId ? Boolean(v.likes?.[empId]) : false,
  }));

export const addGalleryComment = async (
  uploadedAt: string,
  imageId: string,
  text: string,
  parentId: string | null = null,
): Promise<string | null> => {
  const empId = getCurrentUserId();
  const t = text.trim();

  if (!empId || !uploadedAt || !imageId || !t) return null;

  const ym = getYm(uploadedAt);
  const cid = createCommentId(empId);
  const now = useUiStore.getState().getServerNow().getTime();

  await set(ref(db, `gallery/${ym}/${imageId}/comments/${cid}`), {
    id: cid,
    parentId,
    empId,
    userName: getCachedUserName(empId),
    text: t,
    createdAt: now,
  });

  return cid;
};

export const deleteGalleryComment = async (
  uploadedAt: string,
  imageId: string,
  cid: string,
) => {
  if (!uploadedAt || !imageId || !cid) return;

  const ym = getYm(uploadedAt);
  const base = `gallery/${ym}/${imageId}/comments`;

  const snap = await get(ref(db, base));
  if (!snap.exists()) return;

  const raw = snap.val() as Record<string, Raw>;
  const children = Object.entries(raw)
    .filter(([_, v]) => v.parentId === cid)
    .map(([id]) => id);

  const updates: Record<string, any> = {
    [`${base}/${cid}`]: { deleted: true, text: '' },
  };

  for (const childId of children) {
    updates[`${base}/${childId}`] = { deleted: true, text: '' };
  }

  await update(ref(db), updates);
};

export const toggleCommentLike = (
  uploadedAt: string,
  imageId: string,
  cid: string,
  nextLiked: boolean,
) => {
  const empId = getCurrentUserId();
  if (!empId || !uploadedAt) return;

  const ym = getYm(uploadedAt);
  const likeRef = ref(
    db,
    `gallery/${ym}/${imageId}/comments/${cid}/likes/${empId}`,
  );

  const key = `${ym}-${imageId}-${cid}-${empId}`;

  scheduleLikeUpdate(key, nextLiked, async (liked) => {
    if (liked) await set(likeRef, true);
    else await remove(likeRef);
  });
};

export const subscribeGalleryComments = (
  uploadedAt: string,
  imageId: string,
  cb: (list: LightboxComment[]) => void,
) => {
  if (!uploadedAt || !imageId) return () => {};

  const ym = getYm(uploadedAt);
  const commentsRef = ref(db, `gallery/${ym}/${imageId}/comments`);
  const empId = getCurrentUserId();

  const handler = (snap: any) => {
    if (!snap.exists()) {
      cb([]);
      return;
    }

    const raw = snap.val() as Record<string, Raw>;
    cb(convertRaw(raw, empId));
  };

  onValue(commentsRef, handler);
  return () => off(commentsRef, 'value', handler);
};

export const fetchGalleryComments = async (
  uploadedAt: string,
  imageId: string,
) => {
  if (!uploadedAt || !imageId) return [];

  const ym = getYm(uploadedAt);
  const snap = await get(ref(db, `gallery/${ym}/${imageId}/comments`));

  if (!snap.exists()) return [];

  const raw = snap.val() as Record<string, Raw>;
  return convertRaw(raw, getCurrentUserId());
};
