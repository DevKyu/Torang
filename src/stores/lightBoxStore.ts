import { create } from 'zustand';
import type { GalleryImage, Comment } from '../types/lightbox';

type LightBoxState = {
  images: GalleryImage[];
  open: boolean;
  index: number;

  uploadImages: GalleryImage[];
  uploadOpen: boolean;
  uploadIndex: number;

  showIcon: boolean;
  showCaption: boolean;

  commentOpen: boolean;
  commentIndex: number;
  comments: Record<string, Comment[]>;

  direction: number;

  setImages: (images: GalleryImage[]) => void;
  openLightBox: (index: number) => void;
  closeLightBox: () => void;

  goPrev: () => void;
  goNext: () => void;
  swipePrev: () => void;
  swipeNext: () => void;

  setUploadImages: (images: GalleryImage[]) => void;
  openUploadLightBox: (index: number) => void;
  closeUploadLightBox: () => void;

  prevUpload: () => void;
  nextUpload: () => void;
  swipePrevUpload: () => void;
  swipeNextUpload: () => void;

  openComment: (index: number) => void;
  closeComment: () => void;

  addComment: (imageId: string, c: Comment) => void;
  updateComment: (
    imageId: string,
    cid: string,
    patch: Partial<Comment>,
  ) => void;
  deleteComment: (imageId: string, cid: string) => void;

  toggleLike: () => void;
};

export const useLightBoxStore = create<LightBoxState>((set, get) => ({
  images: [],
  open: false,
  index: 0,

  uploadImages: [],
  uploadOpen: false,
  uploadIndex: 0,

  showIcon: true,
  showCaption: true,

  commentOpen: false,
  commentIndex: 0,
  comments: {},

  direction: 0,

  setImages: (images) =>
    set({
      images: images.map((i) => ({
        ...i,
        liked: i.liked ?? false,
        likes: i.likes ?? 0,
      })),
    }),

  openLightBox: (index) =>
    set({
      open: true,
      index,
      commentOpen: false,
      commentIndex: index,
      direction: 0,
    }),

  closeLightBox: () =>
    set({
      open: false,
      commentOpen: false,
    }),

  goPrev: () => {
    const { index, commentOpen } = get();
    const newIndex = Math.max(0, index - 1);
    set({
      index: newIndex,
      direction: -1,
      ...(commentOpen && { commentIndex: newIndex }),
    });
  },

  goNext: () => {
    const { index, images, commentOpen } = get();
    const newIndex = Math.min(images.length - 1, index + 1);
    set({
      index: newIndex,
      direction: 1,
      ...(commentOpen && { commentIndex: newIndex }),
    });
  },

  swipePrev: () => get().goPrev(),
  swipeNext: () => get().goNext(),

  setUploadImages: (images) =>
    set({
      uploadImages: images,
      uploadIndex: 0,
    }),

  openUploadLightBox: (index) =>
    set({
      uploadOpen: true,
      uploadIndex: index,
      direction: 0,
    }),

  closeUploadLightBox: () => set({ uploadOpen: false }),

  prevUpload: () =>
    set((s) => ({
      uploadIndex: Math.max(0, s.uploadIndex - 1),
      direction: -1,
    })),

  nextUpload: () =>
    set((s) => ({
      uploadIndex: Math.min(s.uploadImages.length - 1, s.uploadIndex + 1),
      direction: 1,
    })),

  swipePrevUpload: () => get().prevUpload(),
  swipeNextUpload: () => get().nextUpload(),

  openComment: (index) =>
    set({
      commentOpen: true,
      commentIndex: index,
    }),

  closeComment: () => set({ commentOpen: false }),

  addComment: (imageId, c) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [imageId]: [...(s.comments[imageId] ?? []), c],
      },
    })),

  updateComment: (imageId, cid, patch) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [imageId]: (s.comments[imageId] ?? []).map((c) =>
          c.id === cid ? { ...c, ...patch } : c,
        ),
      },
    })),

  deleteComment: (imageId, cid) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [imageId]: (s.comments[imageId] ?? []).map((c) =>
          c.id === cid ? { ...c, deleted: true, text: '' } : c,
        ),
      },
    })),

  toggleLike: () => {
    const { images, index } = get();
    const target = images[index];

    const nextLiked = !target.liked;
    const nextLikes = nextLiked
      ? (target.likes ?? 0) + 1
      : Math.max(0, (target.likes ?? 0) - 1);

    const updated = {
      ...target,
      liked: nextLiked,
      likes: nextLikes,
    };

    const newImages = [...images];
    newImages[index] = updated;

    set({ images: newImages });
  },
}));
