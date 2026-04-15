import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

import {
  GalleryOuter,
  GalleryBox,
  GalleryTitle,
  DropArea,
  ScrollableArea,
  PreviewGrid,
  PreviewCard,
  ImageWrapper,
  RemoveButton,
  CaptionArea,
  CaptionBox,
  CharCount,
  GalleryButton,
  ClearText,
  NoticeBox,
  BoostButton,
} from '../../styles/galleryStyle';

import { SmallText } from '../../styles/commonStyle';
import { useLightBoxStore } from '../../stores/lightBoxStore';
import LightBox from '../lightbox/LightBox';
import { preloadOpenUploadLightBox } from '../../utils/gallery';
import { getCurrentUserId } from '../../services/firebase';
import { GALLERY_POLICY } from '../../utils/galleryPolicy';

export type GalleryUploadProps = {
  onUpload: (files: File[], captions: string[]) => Promise<void>;
  disabled: boolean;
  availableCount: number;
  reason: string;
  onCancel: () => void;
  onBoost?: () => Promise<void>;
};

const MAX_FILES = GALLERY_POLICY.BASE_UPLOAD;
const MAX_CAPTION_LENGTH = 20;

const waitForKeyboardToClose = () =>
  new Promise((resolve) => {
    const orig = window.visualViewport?.height || 0;
    const check = () => {
      const now = window.visualViewport?.height || 0;
      if (now >= orig) resolve(true);
      else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });

const GalleryUpload = ({
  onUpload,
  disabled,
  availableCount,
  reason,
  onCancel,
  onBoost,
}: GalleryUploadProps) => {
  const [items, setItems] = useState<
    { id: string; file: File; preview: string; caption: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const { setUploadImages } = useLightBoxStore();

  const maxSelectable = Math.min(MAX_FILES, availableCount);
  const empId = getCurrentUserId();

  const revoke = useCallback((url: string) => {
    if (url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
  }, []);

  const MAX_GIF_SIZE = 6 * 1024 * 1024;
  const compress = useCallback(async (file: File) => {
    if (file.type === 'image/gif') {
      if (file.size > MAX_GIF_SIZE) {
        toast.error('GIF는 6MB 이하만 업로드할 수 있어요.');
        return null;
      }

      return {
        id: nanoid(),
        file,
        preview: URL.createObjectURL(file),
        caption: '',
      };
    }

    try {
      const c = await imageCompression(file, {
        maxWidthOrHeight: 1600,
        maxSizeMB: 0.9,
        initialQuality: 0.85,
        useWebWorker: true,
      });

      return {
        id: nanoid(),
        file: c,
        preview: URL.createObjectURL(c),
        caption: '',
      };
    } catch {
      return {
        id: nanoid(),
        file,
        preview: URL.createObjectURL(file),
        caption: '',
      };
    }
  }, []);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (disabled || uploading || items.length >= maxSelectable) return;
      const limit = maxSelectable - items.length;
      const selected = accepted.slice(0, limit);
      const processed = (await Promise.all(selected.map(compress))).filter(
        (
          v,
        ): v is { id: string; file: File; preview: string; caption: string } =>
          Boolean(v),
      );
      setItems((p) => [...p, ...processed]);
    },
    [disabled, uploading, items.length, maxSelectable, compress],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: disabled || uploading || availableCount <= 0,
    multiple: true,
  });

  const uploadImages = useMemo(
    () =>
      items.map((i) => ({
        id: i.id,
        preview: i.preview,
        description: i.caption,
        empId,
        liked: false,
        likes: 0,
        ym: '',
      })),
    [items, empId],
  );

  useEffect(() => {
    if (!uploadImages.length) return;
    setUploadImages(uploadImages);
  }, [uploadImages, setUploadImages]);

  const remove = useCallback(
    (id: string) => {
      if (uploading) return;
      setItems((p) => {
        const t = p.find((i) => i.id === id);
        if (t) revoke(t.preview);
        return p.filter((i) => i.id !== id);
      });
    },
    [uploading, revoke],
  );

  const clearAll = useCallback(() => {
    if (uploading) return;
    items.forEach((i) => revoke(i.preview));
    setItems([]);
    if (fileRef.current) fileRef.current.value = '';
  }, [items, revoke, uploading]);

  const setCaption = useCallback((id: string, v: string) => {
    setItems((p) =>
      p.map((i) =>
        i.id === id ? { ...i, caption: v.slice(0, MAX_CAPTION_LENGTH) } : i,
      ),
    );
  }, []);

  const submit = useCallback(async () => {
    if (disabled || uploading) return;
    if (!items.length) {
      toast.error('업로드할 사진을 선택해주세요.');
      return;
    }
    setUploading(true);
    try {
      await onUpload(
        items.map((i) => i.file),
        items.map((i) => i.caption),
      );
      clearAll();
    } finally {
      setUploading(false);
    }
  }, [disabled, uploading, items, onUpload, clearAll]);

  useEffect(() => {
    const arr = items.map((i) => i.preview);
    return () => arr.forEach(revoke);
  }, []);

  const blocked = disabled && reason !== 'loading';
  const showBoost = !disabled && availableCount <= 0 && !uploading && onBoost;

  if (uploading) return <GalleryOuter />;

  return (
    <GalleryOuter>
      <GalleryBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <GalleryTitle>사진 업로드</GalleryTitle>

        {blocked ? (
          <>
            <NoticeBox>
              {reason === 'before_activity' &&
                '활동 당일부터 등록할 수 있어요.'}
              {reason === 'after_grace' && '업로드 가능 기간이 지났어요.'}
              {reason === 'no_activity' && '활동일 정보가 아직 없어요.'}
              {reason === 'loading' && '활동일 정보를 불러오는 중이에요.'}
            </NoticeBox>

            <SmallText top="narrow" onClick={onCancel}>
              돌아가기
            </SmallText>
          </>
        ) : showBoost ? (
          <>
            <NoticeBox>이번 달 업로드 제한을 초과했습니다.</NoticeBox>

            <BoostButton onClick={onBoost}>
              🔥 또랑핀 1개 사용 (업로드 +{GALLERY_POLICY.BOOST_AMOUNT})
            </BoostButton>

            <SmallText top="narrow" onClick={onCancel}>
              돌아가기
            </SmallText>
          </>
        ) : (
          <>
            <DropArea
              {...getRootProps()}
              isActive={isDragActive}
              isDisabled={disabled || uploading || availableCount <= 0}
            >
              <input ref={fileRef} {...getInputProps()} />
              <span>
                {items.length === 0
                  ? `사진을 선택하세요 (최대 ${maxSelectable}장)`
                  : `+ 추가 선택 (${items.length}/${maxSelectable})`}
              </span>
            </DropArea>

            {items.length > 0 && (
              <ScrollableArea>
                <PreviewGrid>
                  {items.map((i, index) => (
                    <PreviewCard key={i.id}>
                      <ImageWrapper
                        onClick={async () => {
                          const el = document.activeElement;
                          if (
                            el &&
                            typeof (el as HTMLElement).blur === 'function'
                          ) {
                            (el as HTMLElement).blur();
                          }
                          await waitForKeyboardToClose();
                          preloadOpenUploadLightBox(index);
                        }}
                      >
                        <img src={i.preview} alt={i.file.name} />
                        <RemoveButton
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(i.id);
                          }}
                        >
                          ✕
                        </RemoveButton>
                      </ImageWrapper>

                      <CaptionArea>
                        <CaptionBox
                          key={`cap-${i.id}`}
                          value={i.caption}
                          placeholder="사진 설명"
                          onChange={(e) => setCaption(i.id, e.target.value)}
                        />
                        <CharCount>
                          {MAX_CAPTION_LENGTH - i.caption.length}
                        </CharCount>
                      </CaptionArea>
                    </PreviewCard>
                  ))}
                </PreviewGrid>
              </ScrollableArea>
            )}

            <GalleryButton
              onClick={submit}
              disabled={disabled || uploading || items.length === 0}
            >
              업로드
            </GalleryButton>

            {items.length > 0 && !uploading && (
              <ClearText onClick={clearAll}>전체 초기화</ClearText>
            )}

            {items.length === 0 && (
              <SmallText top="middle" onClick={onCancel}>
                돌아가기
              </SmallText>
            )}
          </>
        )}
      </GalleryBox>

      <LightBox />
    </GalleryOuter>
  );
};

export default GalleryUpload;
