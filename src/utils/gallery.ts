import type { ActivityDateAll } from '../services/firebase';
import { useLightBoxStore } from '../stores/lightBoxStore';
import { useUiStore } from '../stores/useUiStore';
import { getDiffDaysServer } from './date';

export const preloadImage = (src: string): Promise<void> => {
  if (!src) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    let resolved = false;

    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    img.onload = done;
    img.onerror = done;

    img.src = src;

    if (img.decode) {
      img.decode().then(done).catch(done);
    }
  });
};

export const preloadOpenLightBox = (index: number) => {
  const { images, openLightBox } = useLightBoxStore.getState();
  const target = images[index];
  if (!target) return;

  requestAnimationFrame(() => openLightBox(index));

  preloadImage(target.preview);
};

export const preloadOpenUploadLightBox = (index: number) => {
  const { uploadImages, openUploadLightBox } = useLightBoxStore.getState();
  const target = uploadImages[index];
  if (!target) return;

  requestAnimationFrame(() => openUploadLightBox(index));
  preloadImage(target.preview);
};
export const getInitialGalleryYm = (
  activityMaps: ActivityDateAll,
  serverYear: number,
  serverMonth: number,
  extraDays = 7,
): string => {
  const { formatServerDate } = useUiStore.getState();
  const currentYm = formatServerDate('ym');

  const findActivity = (y: number, m: number) =>
    activityMaps?.[String(y)]?.[String(m)];

  let activityYmd = findActivity(serverYear, serverMonth);

  if (!activityYmd) {
    const prevMonth = serverMonth === 1 ? 12 : serverMonth - 1;
    const prevYear = serverMonth === 1 ? serverYear - 1 : serverYear;
    activityYmd = findActivity(prevYear, prevMonth);
  }

  if (!activityYmd) return currentYm;

  const diff = getDiffDaysServer(String(activityYmd));

  if (diff >= 0 && diff <= extraDays) {
    return String(activityYmd).slice(0, 6);
  }

  return currentYm;
};
