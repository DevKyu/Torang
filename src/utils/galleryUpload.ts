import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { ref as dbRef, set } from 'firebase/database';
import {
  storage,
  db,
  getCurrentUserId,
  type ActivityDateAll,
} from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';
import { nanoid } from 'nanoid';
import { getDiffDaysServer } from './date';

export const uploadGalleryImage = async (file: File, yyyymm: string) => {
  const imageId = nanoid();
  const path = `gallery/${yyyymm}/${imageId}`;
  const ref = storageRef(storage, path);

  await uploadBytes(ref, file);
  const url = await getDownloadURL(ref);

  return { imageId, url };
};

export const saveGalleryMeta = async (params: {
  yyyymm: string;
  imageId: string;
  url: string;
  caption: string;
}) => {
  const { yyyymm, imageId, url, caption } = params;
  const empId = getCurrentUserId();
  const uploadedAt = useUiStore.getState().formatServerDate('ymdhm');
  const ref = dbRef(db, `gallery/${yyyymm}/${imageId}`);

  await set(ref, {
    url,
    empId,
    caption,
    uploadedAt,
    likes: {},
    comments: {},
  });
};

export const getValidGalleryMonth = (
  activityYmd?: string,
  extraDays: number = 7,
): string => {
  const store = useUiStore.getState();
  if (!activityYmd || activityYmd.length !== 8) {
    return store.formatServerDate('ym');
  }
  const diff = getDiffDaysServer(activityYmd);
  if (diff <= extraDays) {
    return activityYmd.slice(0, 6);
  }
  return store.formatServerDate('ym');
};
export const checkGalleryUploadAvailability = (
  activityMaps: ActivityDateAll | undefined,
  year: number,
  month: number,
) => {
  const { getServerNow } = useUiStore.getState();
  const now = getServerNow();

  if (!activityMaps) return { allowed: false, reason: 'no_data' };

  const yearMap = activityMaps[String(year)];
  if (!yearMap) return { allowed: false, reason: 'no_activity' };

  const thisMonth = yearMap[String(month)];

  const parse = (v?: string | number): Date | null => {
    if (!v) return null;
    const s = String(v);
    if (s.length !== 8) return null;
    return new Date(
      Number(s.slice(0, 4)),
      Number(s.slice(4, 6)) - 1,
      Number(s.slice(6, 8)),
    );
  };

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const actThis = parse(thisMonth);

  const check = (act: Date) => {
    const diff = today.getTime() - act.getTime();
    if (diff <= 0) return 'before_activity';
    if (diff / 86400000 <= 7) return 'ok';
    return 'after_grace';
  };

  if (!actThis) return { allowed: false, reason: 'no_activity' };

  const tag = check(actThis);
  return { allowed: tag === 'ok', reason: tag };
};
