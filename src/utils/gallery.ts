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

const getExtensionFromMime = (mime: string) => {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  return 'jpg';
};

const isTouchPrimaryDevice = () => window.matchMedia('(pointer: coarse)').matches;

const downloadBlob = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
};

export const shareOrDownloadImage = async (url: string, name: string) => {
  let blob: Blob | null = null;

  try {
    const res = await fetch(url);
    if (res.ok) blob = await res.blob();
  } catch {}

  if (!blob) {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) throw new Error('image_open_failed');
    return;
  }

  const filename = `${name}.${getExtensionFromMime(blob.type)}`;

  if (isTouchPrimaryDevice() && navigator.canShare) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).catch(() => {});
      return;
    }
  }

  downloadBlob(blob, filename);
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
