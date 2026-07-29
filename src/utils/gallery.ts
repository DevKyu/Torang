import type { ActivityDateAll } from '../services/firebase';
import { useLightBoxStore } from '../stores/lightBoxStore';
import { useUiStore } from '../stores/useUiStore';
import { getDiffDaysServer, resolveActivityYmd } from './date';

const preloadImage = (src: string): Promise<void> => {
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

  const activityYmd = resolveActivityYmd(
    activityMaps,
    String(serverYear),
    serverMonth,
  );

  if (!activityYmd) return currentYm;

  const diff = getDiffDaysServer(activityYmd);

  if (diff >= 0 && diff <= extraDays) {
    return activityYmd.slice(0, 6);
  }

  return currentYm;
};
