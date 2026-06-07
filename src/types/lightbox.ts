export type GalleryImage = {
  id: string;
  preview: string;
  description?: string;
  uploadedAt?: number;
  empId: string;
  liked?: boolean;
  likes?: number;
  likedUsers?: string[];
  commentCount?: number;
  ym: string;
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
