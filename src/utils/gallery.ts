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

const MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
};

const EXTENSION_MIMES: Record<string, string> = {
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

const resolveImageMime = (mime: string, url: string) => {
  if (mime.startsWith('image/')) return mime;

  const ext = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_MIMES[ext] ?? 'image/jpeg';
};

export const isTouchPrimaryDevice = () =>
  window.matchMedia('(pointer: coarse)').matches;

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

const openInNewTab = (url: string) => {
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) throw new Error('image_open_failed');
};

const fetchAsFile = async (url: string, name: string): Promise<File | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const blob = await res.blob();
    const mime = resolveImageMime(blob.type, url);
    return new File([blob], `${name}.${MIME_EXTENSIONS[mime] ?? 'jpg'}`, { type: mime });
  } catch {
    return null;
  }
};

export const prepareShareFile = (url: string, name: string) => fetchAsFile(url, name);

export const shareOrDownloadImage = async (
  url: string,
  name: string,
  onPresented?: () => void,
  preparedFile?: File | null,
) => {
  if (isTouchPrimaryDevice()) {
    const file = preparedFile ?? (await fetchAsFile(url, name));

    if (file && navigator.canShare?.({ files: [file] })) {
      const sharePromise = navigator.share({ files: [file] });
      onPresented?.();
      try {
        await sharePromise;
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    onPresented?.();
    openInNewTab(url);
    return;
  }

  let blob: Blob | null = null;

  try {
    const res = await fetch(url);
    if (res.ok) blob = await res.blob();
  } catch {}

  if (!blob) {
    onPresented?.();
    openInNewTab(url);
    return;
  }

  const mime = resolveImageMime(blob.type, url);
  onPresented?.();
  downloadBlob(blob, `${name}.${MIME_EXTENSIONS[mime] ?? 'jpg'}`);
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
