import { useEffect, useRef, useState, useCallback } from 'react';
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

  const imageBoxRef = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(0);
  const [stageH, setStageH] = useState(0);

  const loadedRef = useRef<Record<number, boolean>>({});
  const [, force] = useState({});

  const markLoaded = useCallback((i: number) => {
    if (!loadedRef.current[i]) {
      loadedRef.current[i] = true;
      force({});
    }
  }, []);

  const measure = useCallback(() => {
    const el = imageBoxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const h = r.height || window.innerHeight * 0.6;
    setStageW(r.width);
    setStageH(h);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    requestAnimationFrame(() => {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    });
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    loadedRef.current = {};

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
    if (!isOpen) isInitial.current = true;
  }, [isOpen]);

  const onDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const { offset, velocity } = info;

      const DRAG_THRESHOLD = 16;
      const VELOCITY_THRESHOLD = 130;

      const toPrev =
        offset.x > DRAG_THRESHOLD || velocity.x > VELOCITY_THRESHOLD;
      const toNext =
        offset.x < -DRAG_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;

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

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, prev, next, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ lb: true }, '');

    const onPop = () => {
      if (commentOpen) closeComment();
      else onClose();
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [isOpen, commentOpen, onClose, closeComment]);

  if (!isOpen) return null;

  const img = list[current];
  const name = img.empId ? getCachedUserName(img.empId) : '';
  const hasDesc = showCaption && !!img.description?.trim();

  const id = img.id;
  const comments = id ? (commentsState[id] ?? []) : [];
  const commentCount = comments.filter((c) => !c.deleted).length;
  const likeCount = img.likes ?? 0;

  const overlayClick = () => {
    if (commentOpen) closeComment();
  };

  return (
    <>
      <AnimatePresence>
        <Overlay
          key="overlay"
          style={{ pointerEvents: commentOpen ? 'none' : 'auto' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={overlayClick}
        >
          <Header>
            <TopCounter>
              {current + 1} / {list.length}
            </TopCounter>
            <HeaderRight>
              <IconButton onClick={onClose}>
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
                        onLoad={() => markLoaded(i)}
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
              {!isUpload && name && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: hasDesc ? 6 : 12,
                    lineHeight: 1.3,
                  }}
                >
                  {name} 님의 사진
                </div>
              )}

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
                  onClick={(e) => {
                    e.stopPropagation();
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
                  onClick={(e) => {
                    e.stopPropagation();
                    openComment(current);
                  }}
                >
                  <IconButton>
                    <MessageCircle />
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
