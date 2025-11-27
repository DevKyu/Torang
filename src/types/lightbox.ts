export type GalleryImage = {
  id: string;
  preview: string;
  description?: string;
  uploadedAt?: string;
  empId: string;
  liked?: boolean;
  likes?: number;
  commentCount?: number;
};

export type LightBoxProps = {
  open: boolean;
  index: number;
  images: GalleryImage[];

  onClose: () => void;

  showIcon?: boolean;
  showCaption?: boolean;

  onShare?: (img: GalleryImage) => void;
  onComment?: (img: GalleryImage) => void;
};

export type LightboxComment = {
  id: string;
  parentId: string | null;
  user: string;
  text: string;
  createdAt: number;
  likes: number;
  likedByMe: boolean;
  deleted?: boolean;
};

export type CommentSheetProps = {
  open: boolean;
  onClose: () => void;
};
