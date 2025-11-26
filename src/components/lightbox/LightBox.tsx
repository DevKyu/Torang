import { useEffect, useRef, useState, useCallback } from 'react';
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
  Count,
  IconRow,
  CountBox,
} from '../../styles/lightBoxStyle';

import { useLightBoxStore } from '../../stores/lightBoxStore';
import { getCachedUserName } from '../../services/firebase';

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
  const [isAnimating, setIsAnimating] = useState(false);

  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const markLoaded = useCallback(
    (i: number) => setLoadedMap((p) => (p[i] ? p : { ...p, [i]: true })),
    [],
  );

  const measure = useCallback(() => {
    const el = imageBoxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setStageW(r.width);
    setStageH(r.height);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setLoadedMap({});
    measure();
    const h = () => measure();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [isOpen, measure]);

  const animateToIndex = useCallback(
    (i: number) => {
      setIsAnimating(true);
      animate(x, -stageW * i, {
        type: 'spring',
        stiffness: 300,
        damping: 32,
        onComplete: () => setIsAnimating(false),
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
      if (isInitial.current) return;
      if (isAnimating) return animateToIndex(current);

      const { offset, velocity } = info;

      if (current === 0 && offset.x > 0) return animateToIndex(current);
      if (current === list.length - 1 && offset.x < 0)
        return animateToIndex(current);

      if (offset.x > 80 || velocity.x > 500) return prev();
      if (offset.x < -80 || velocity.x < -500) return next();

      animateToIndex(current);
    },
    [current, list.length, isAnimating, animateToIndex, prev, next],
  );

  useEffect(() => {
    if (isOpen) new Image().src = list[current]?.preview || '';
  }, [current, isOpen, list]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, prev, next, onClose]);

  if (!isOpen) return null;

  const img = list[current];
  const name = img.empId ? getCachedUserName(img.empId) : '';
  const hasDesc = showCaption && !!img.description?.trim();

  const cid = img.id;
  const comments = cid ? (commentsState[cid] ?? []) : [];
  const commentCount = comments.filter((c) => !c.deleted).length;
  const likeCount = img.likes ?? 0;

  return (
    <AnimatePresence>
      <Overlay
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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

        <ImageBox ref={imageBoxRef} showIcon={showIcon}>
          <div
            style={{
              width: stageW * list.length,
              height: '100%',
              display: 'flex',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                display: 'flex',
                height: '100%',
                x,
                pointerEvents: isAnimating ? 'none' : 'auto',
              }}
              drag="x"
              dragElastic={0.2}
              dragMomentum={false}
              onDragEnd={onDragEnd}
            >
              {list.map((img, i) => {
                const isCurrent = i === current;

                return (
                  <Slide key={img.id} style={{ width: stageW, height: stageH }}>
                    {!loadedMap[i] && isCurrent && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
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
                        opacity: loadedMap[i] ? 1 : 0,
                        transition: 'opacity 200ms ease-out',
                      }}
                    />
                  </Slide>
                );
              })}
            </motion.div>
          </div>

          {current > 0 && (
            <IconButton
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
              onClick={prev}
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
              onClick={next}
            >
              <ChevronRight />
            </IconButton>
          )}
        </ImageBox>

        {(name || hasDesc) && (
          <DescriptionWrap showIcon={showIcon}>
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
              <Description initial={false} animate={{ opacity: 1 }}>
                {img.description}
              </Description>
            )}
          </DescriptionWrap>
        )}

        {!isUpload && (
          <Footer showIcon={showIcon}>
            <FooterIcons>
              <IconRow>
                <IconButton onClick={toggleLike}>
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

              <IconRow>
                <IconButton onClick={() => openComment(current)}>
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
  );
};

export default LightBox;
