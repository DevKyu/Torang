import { useEffect } from 'react';
import { useLightBoxStore } from '../stores/lightBoxStore';
import type { GalleryImage } from '../types/lightbox';

export const useLightBox = (images?: GalleryImage[]) => {
  const store = useLightBoxStore();

  useEffect(() => {
    if (images) store.setImages(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  return store;
};
