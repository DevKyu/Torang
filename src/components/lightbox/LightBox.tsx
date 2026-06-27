import { useEffect, useRef, useState, useCallback } from 'react';
import { useBackClose } from '../../hooks/useBackClose';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  type PanInfo,
} from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
} from 'lucide-react';

import {
  Overlay,
  Header,
  TopCounter,
  HeaderRight,
  ImageBox,
  Slide,
  ViewerImage,
  DescriptionWrap,
  Description,
  Footer,
  FooterIcons,
  IconButton,
  IconRow,
  Count,
  CountBox,
  NameBox,
} from '../../styles/lightBoxStyle';

import { useLightBoxStore } from '../../stores/lightBoxStore';
import { getCachedUserName } from '../../services/firebase';
import CommentSheet from '../lightbox/CommentSheet';

export const LightBox = () => {
  const {
    open,
    images,
    index,
    goPrev,
    goNext,
    uploadOpen,
    uploadImages,
    uploadIndex,
    prevUpload,
    nextUpload,
    showIcon,
    showCaption,
    closeLightBox,
    closeUploadLightBox,
    toggleLike,
    openComment,
    comments: commentsState,
    commentOpen,
    closeComment,
  } = useLightBoxStore();

  const isUpload = uploadOpen;
  const isOpen = isUpload ? uploadOpen : open;

  const list = isUpload ? uploadImages : images;
  const current = isUpload ? uploadIndex : index;

  const prev = isUpload ? prevUpload : goPrev;
  const next = isUpload ? nextUpload : goNext;
  const onClose = isUpload ? closeUploadLightBox : closeLightBox;

  const x = useMotionValue(0);
  const isInitial = useRef(true);

  const overlayOpacity = useMotionValue(0);
  const lightboxClosingRef = useRef(false);
  const imageBoxRef = useRef<HTMLDivElement>(null);

  const [stageW, setStageW] = useState(0);
  const [stageH, setStageH] = useState(0);

  const loadedRef = useRef<Record<number, boolean>>({});
  const [, force] = useState({});
  const decodeTokenRef = useRef(0);

  const markLoaded = useCallback((i: number, token: number) => {
    if (decodeTokenRef.current !== token) return;
    if (!loadedRef.current[i]) {
      loadedRef.current[i] = true;
      force({});
    }
  }, []);

  const measure = useCallback(() => {
    const el = imageBoxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setStageW(r.width);
    setStageH(r.height || window.innerHeight * 0.6);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const y = window.scrollY;
    requestAnimationFrame(() => {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    });

    return () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.style.position = '';
          document.body.style.top = '';
          window.scrollTo(0, y);
        });
      });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    loadedRef.current = {};
    decodeTokenRef.current += 1;

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(measure);
      return () => cancelAnimationFrame(raf2);
    });

    const resizeHandler = () => requestAnimationFrame(measure);
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(raf1);
    };
  }, [isOpen, measure]);

  const animateToIndex = useCallback(
    (i: number) => {
      animate(x, -stageW * i, {
        type: 'spring',
        stiffness: 360,
        damping: 32,
      });
    },
    [stageW, x],
  );

  useEffect(() => {
    if (!isOpen || stageW === 0) return;

    if (isInitial.current) {
      x.set(-stageW * current);
      requestAnimationFrame(() => (isInitial.current = false));
      return;
    }
    animateToIndex(current);
  }, [current, stageW, isOpen, animateToIndex, x]);

  useEffect(() => {
    if (!isOpen) {
      isInitial.current = true;
    } else {
      lightboxClosingRef.current = false;
      animate(overlayOpacity, 1, { duration: 0.22 });
    }
  }, [isOpen, overlayOpacity]);

  const onDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const { offset, velocity } = info;
      const T = 16;
      const V = 130;

      const toPrev = offset.x > T || velocity.x > V;
      const toNext = offset.x < -T || velocity.x < -V;

      if (toPrev && current > 0) return prev();
      if (toNext && current < list.length - 1) return next();

      animateToIndex(current);
    },
    [current, list.length, animateToIndex, prev, next],
  );

  useEffect(() => {
    if (!isOpen) return;

    const preload = (i: number) => {
      const t = list[i];
      if (!t) return;
      const img = new Image();
      img.src = t.preview;
    };

    preload(current);
    preload(current - 1);
    preload(current + 1);
  }, [current, isOpen, list]);

  const runClose = useCallback(async () => {
    if (lightboxClosingRef.current) return;
    lightboxClosingRef.current = true;
    await animate(overlayOpacity, 0, { duration: 0.22 });
    onClose();
  }, [overlayOpacity, onClose]);

  useBackClose(isOpen, runClose);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (commentOpen) closeComment();
        else runClose();
      }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, commentOpen, prev, next, closeComment, runClose]);

  if (!isOpen) return null;

  const img = list[current];
  const name = img.empId ? getCachedUserName(img.empId) : '';
  const hasDesc = showCaption && !!img.description?.trim();

  const id = img.id;
  const comments = id ? (commentsState[id] ?? []) : [];
  const rootIds = new Set(comments.filter((c) => !c.deleted && !c.parentId).map((c) => c.id));
  const commentCount = comments.filter((c) => !c.deleted && (!c.parentId || rootIds.has(c.parentId))).length;
  const likeCount = img.likes ?? 0;

  const overlayClick = () => {
    if (commentOpen) closeComment();
  };

  return (
    <>
      <AnimatePresence>
        <Overlay
          key="overlay"
          style={{ opacity: overlayOpacity }}
          onClick={overlayClick}
        >
          <Header>
            <TopCounter>
              {current + 1} / {list.length}
            </TopCounter>
            <HeaderRight>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  runClose();
                }}
              >
                <X />
              </IconButton>
            </HeaderRight>
          </Header>

          <ImageBox
            ref={imageBoxRef}
            showIcon={showIcon}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              style={{
                width: stageW * list.length,
                height: '100%',
                display: 'flex',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{ display: 'flex', height: '100%', x }}
                drag="x"
                dragElastic={0.05}
                dragMomentum={false}
                onDragEnd={onDragEnd}
              >
                {list.map((img, i) => {
                  const isCurrent = i === current;

                  return (
                    <Slide
                      key={`${img.id}-${i}`}
                      style={{ width: stageW, height: stageH }}
                    >
                      {!loadedRef.current[i] && isCurrent && (
                        <motion.div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            maxHeight: '100%',
                            background: 'rgba(0,0,0,0.32)',
                            backdropFilter: 'blur(10px)',
                          }}
                        />
                      )}

                      <ViewerImage
                        src={img.preview}
                        draggable={false}
                        onLoad={(e) => {
                          const imgEl = e.currentTarget;
                          const token = decodeTokenRef.current;
                          const commit = () => markLoaded(i, token);

                          if (imgEl.decode) imgEl.decode().then(commit).catch(commit);
                          else commit();
                        }}
                        style={{
                          opacity: loadedRef.current[i] ? 1 : 0,
                          transition:
                            'opacity 180ms cubic-bezier(.25,.8,.25,1)',
                        }}
                      />
                    </Slide>
                  );
                })}
              </motion.div>
            </motion.div>

            {current > 0 && (
              <IconButton
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
              >
                <ChevronLeft />
              </IconButton>
            )}

            {current < list.length - 1 && (
              <IconButton
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
              >
                <ChevronRight />
              </IconButton>
            )}
          </ImageBox>

          {(name || hasDesc) && (
            <DescriptionWrap
              showIcon={showIcon}
              onClick={(e) => e.stopPropagation()}
            >
              {!isUpload && name && <NameBox>{name} 님의 사진</NameBox>}

              {hasDesc && (
                <Description animate={{ opacity: 1 }}>
                  {img.description}
                </Description>
              )}
            </DescriptionWrap>
          )}

          {!isUpload && (
            <Footer showIcon={showIcon} onClick={(e) => e.stopPropagation()}>
              <FooterIcons>
                <IconRow
                  whileTap={{ scale: 0.80 }}
                  transition={{ duration: 0.1 }}
                  onPointerUp={(e) => {
                    if (!e.isPrimary) return;
                    toggleLike();
                  }}
                >
                  <IconButton>
                    <Heart
                      fill={img.liked ? '#ff4d6d' : 'none'}
                      color={img.liked ? '#ff4d6d' : '#eee'}
                    />
                  </IconButton>
                  <CountBox>
                    <Count
                      key={likeCount}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18 }}
                    >
                      {likeCount}
                    </Count>
                  </CountBox>
                </IconRow>

                <IconRow
                  whileTap={{ scale: 0.80 }}
                  transition={{ duration: 0.1 }}
                  onPointerUp={(e) => {
                    if (!e.isPrimary) return;
                    openComment(current);
                  }}
                >
                  <IconButton>
                    <MessageCircle color="#eee" />
                  </IconButton>
                  <CountBox>
                    <Count
                      key={commentCount}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18 }}
                    >
                      {commentCount}
                    </Count>
                  </CountBox>
                </IconRow>
              </FooterIcons>
            </Footer>
          )}
        </Overlay>
      </AnimatePresence>

      {commentOpen &&
        createPortal(
          <CommentSheet />,
          document.getElementById('comment-portal')!,
        )}
    </>
  );
};

export default LightBox;
