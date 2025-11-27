import { create } from 'zustand';
import type { GalleryImage, LightboxComment } from '../types/lightbox';
import { toggleGalleryLike, subscribeGalleryLikes } from '../utils/galleryLike';
import {
  fetchGalleryComments,
  subscribeGalleryComments,
} from '../utils/comments';

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
  comments: Record<string, LightboxComment[]>;

  direction: number;

  commentUnsub: (() => void) | null;
  likeUnsub: (() => void) | null;

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

  openComment: (index: number) => Promise<void>;
  closeComment: () => void;

  setComments: (imageId: string, list: LightboxComment[]) => void;
  addComment: (imageId: string, c: LightboxComment) => void;
  updateComment: (
    imageId: string,
    cid: string,
    patch: Partial<LightboxComment>,
  ) => void;
  deleteComment: (imageId: string, cid: string) => void;

  toggleLike: () => void;

  bindLikeSubscription: (idx: number) => void;
  bindCommentSubscription: (idx: number) => void;
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

  commentUnsub: null,
  likeUnsub: null,

  setImages: (images) =>
    set({
      images: images.map((i) => ({
        ...i,
        liked: i.liked ?? false,
        likes: i.likes ?? 0,
        commentCount: i.commentCount ?? 0,
      })),
    }),

  bindLikeSubscription: (idx) => {
    const s = get();
    const img = s.images[idx];
    if (!img?.uploadedAt) return;

    s.likeUnsub?.();

    const unsub = subscribeGalleryLikes(
      img.uploadedAt,
      img.id,
      (liked, likes) => {
        set((state) => {
          const arr = [...state.images];
          const t = arr[idx];
          if (!t) return {};
          arr[idx] = { ...t, liked, likes };
          return { images: arr };
        });
      },
    );

    set({ likeUnsub: unsub });
  },

  bindCommentSubscription: async (idx) => {
    const s = get();
    const img = s.images[idx];
    if (!img?.uploadedAt) return;

    s.commentUnsub?.();
    set({ commentUnsub: null });

    const unsub = subscribeGalleryComments(img.uploadedAt, img.id, (list) => {
      get().setComments(img.id, list);

      set((st) => {
        const arr = [...st.images];
        const t = arr[idx];
        if (!t) return {};
        arr[idx] = {
          ...t,
          commentCount: list.filter((c) => !c.deleted).length,
        };
        return { images: arr };
      });
    });

    set({ commentUnsub: unsub });

    const list = await fetchGalleryComments(img.uploadedAt, img.id);
    get().setComments(img.id, list);

    set((st) => {
      const arr = [...st.images];
      const t = arr[idx];
      if (!t) return {};
      arr[idx] = { ...t, commentCount: list.filter((c) => !c.deleted).length };
      return { images: arr };
    });
  },

  openLightBox: (index) => {
    set({
      open: true,
      index,
      commentOpen: false,
      commentIndex: index,
      direction: 0,
    });

    const s = get();
    s.bindLikeSubscription(index);
    s.bindCommentSubscription(index);
  },

  closeLightBox: () => {
    const s = get();
    s.likeUnsub?.();
    s.commentUnsub?.();

    set({
      open: false,
      likeUnsub: null,
      commentUnsub: null,
      commentOpen: false,
    });
  },

  goPrev: () => {
    const s = get();
    const next = Math.max(0, s.index - 1);

    set({
      index: next,
      direction: -1,
      ...(s.commentOpen && { commentIndex: next }),
    });

    s.bindLikeSubscription(next);
    s.bindCommentSubscription(next);
  },

  goNext: () => {
    const s = get();
    const next = Math.min(s.images.length - 1, s.index + 1);

    set({
      index: next,
      direction: 1,
      ...(s.commentOpen && { commentIndex: next }),
    });

    s.bindLikeSubscription(next);
    s.bindCommentSubscription(next);
  },

  swipePrev: () => get().goPrev(),
  swipeNext: () => get().goNext(),

  setUploadImages: (images) => set({ uploadImages: images, uploadIndex: 0 }),

  openUploadLightBox: (index) =>
    set({ uploadOpen: true, uploadIndex: index, direction: 0 }),

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

  setComments: (imageId, list) =>
    set((s) => {
      const next = { ...s.comments, [imageId]: list };

      const idx = s.images.findIndex((i) => i.id === imageId);
      if (idx === -1) return { comments: next };

      const arr = [...s.images];
      const t = arr[idx];
      arr[idx] = {
        ...t,
        commentCount: list.filter((c) => !c.deleted).length,
      };

      return { comments: next, images: arr };
    }),

  openComment: async (index) => {
    const s = get();
    const img = s.images[index];
    set({ commentOpen: true, commentIndex: index });

    if (!img?.uploadedAt) return;

    s.commentUnsub?.();
    set({ commentUnsub: null });

    const unsub = subscribeGalleryComments(img.uploadedAt, img.id, (list) =>
      get().setComments(img.id, list),
    );

    set({ commentUnsub: unsub });

    const list = await fetchGalleryComments(img.uploadedAt, img.id);
    get().setComments(img.id, list);
  },

  closeComment: () => {
    const s = get();
    s.commentUnsub?.();
    set({ commentOpen: false, commentUnsub: null });
  },

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
    const s = get();
    const img = s.images[s.index];
    if (!img?.uploadedAt) return;

    const liked = !img.liked;
    const likes = liked
      ? (img.likes ?? 0) + 1
      : Math.max(0, (img.likes ?? 0) - 1);

    set((st) => {
      const arr = [...st.images];
      const base = arr[s.index];
      if (!base) return {};
      arr[s.index] = { ...base, liked, likes };
      return { images: arr };
    });

    toggleGalleryLike(img.uploadedAt, img.id, liked);
  },
}));
