import { useLightBoxStore } from '../stores/lightBoxStore';

export const preloadImage = (src: string): Promise<void> => {
  if (!src) return Promise.resolve();

  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();

    img.src = src;

    if (img.decode) {
      img.decode().then(resolve).catch(resolve);
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
