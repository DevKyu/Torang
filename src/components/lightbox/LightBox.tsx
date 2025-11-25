import { useEffect, useRef, useState } from 'react';
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

  const [isReady, setIsReady] = useState(false);
  const loadedRef = useRef(false);

  const measureStage = () => {
    const el = imageBoxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setStageW(rect.width);
    setStageH(rect.height);
  };

  useEffect(() => {
    if (!isOpen) return;
    loadedRef.current = false;
    setIsReady(false);
    measureStage();
    const resize = () => measureStage();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || stageW === 0) return;

    if (isInitial.current) {
      x.set(-stageW * current);
      requestAnimationFrame(() => (isInitial.current = false));
      return;
    }

    animate(x, -stageW * current, {
      type: 'spring',
      stiffness: 300,
      damping: 32,
    });
  }, [current, stageW, isOpen]);

  useEffect(() => {
    if (!isOpen) isInitial.current = true;
  }, [isOpen]);

  const onDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;

    if (current === 0 && offset.x > 0) {
      return animate(x, -stageW * current, {
        type: 'spring',
        stiffness: 300,
        damping: 32,
      });
    }

    if (offset.x > 80 || velocity.x > 500) return prev();
    if (offset.x < -80 || velocity.x < -500) return next();

    animate(x, -stageW * current, {
      type: 'spring',
      stiffness: 300,
      damping: 32,
    });
  };

  const handleImageReady = (node: HTMLImageElement | null, idx: number) => {
    if (!node || idx !== current || loadedRef.current) return;
    loadedRef.current = true;
    requestAnimationFrame(() => setIsReady(true));
  };

  useEffect(() => {
    if (!isOpen) return;
    const temp = new Image();
    temp.src = list[current]?.preview || '';
  }, [current, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, current]);

  if (!isOpen) return null;

  const currentImg = list[current];
  const hasDescription = showCaption && !!currentImg?.description?.trim();

  const cid = currentImg?.id;
  const commentList = cid ? (commentsState[cid] ?? []) : [];
  const commentCount = commentList.filter((c) => !c.deleted).length;

  const likeCount = currentImg.likes ?? 0;

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
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <motion.div
              style={{ display: 'flex', height: '100%', x }}
              drag="x"
              dragElastic={0.2}
              dragMomentum={false}
              onDragEnd={onDragEnd}
            >
              {list.map((img, idx) => {
                const isCurrent = idx === current;
                return (
                  <Slide key={img.id} style={{ width: stageW, height: stageH }}>
                    {!isReady && isCurrent && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.32)',
                          backdropFilter: 'blur(10px)',
                          pointerEvents: 'none',
                          opacity: isReady ? 0 : 1,
                          transition: 'opacity 160ms ease-out',
                        }}
                      />
                    )}

                    <ViewerImage
                      src={img.preview}
                      draggable={false}
                      ref={(node) => {
                        if (node && idx === current && node.complete)
                          handleImageReady(node, idx);
                      }}
                      onLoad={(e) => handleImageReady(e.currentTarget, idx)}
                      style={{
                        opacity: isReady ? 1 : 0,
                        transition:
                          isInitial.current || !isReady
                            ? 'opacity 200ms ease-out'
                            : 'none',
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

        {hasDescription && (
          <DescriptionWrap showIcon={showIcon}>
            <Description
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0 }}
            >
              {currentImg.description}
            </Description>
          </DescriptionWrap>
        )}

        <Footer showIcon={showIcon}>
          <FooterIcons>
            <IconRow>
              <IconButton onClick={toggleLike}>
                <Heart
                  fill={currentImg.liked ? '#ff4d6d' : 'none'}
                  color={currentImg.liked ? '#ff4d6d' : '#eee'}
                />
              </IconButton>

              <CountBox>
                <Count
                  initial={false}
                  animate={{ opacity: likeCount > 0 ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {likeCount > 0 ? likeCount : ''}
                </Count>
              </CountBox>
            </IconRow>

            <IconRow>
              <IconButton onClick={() => openComment(current)}>
                <MessageCircle />
              </IconButton>

              <CountBox>
                <Count
                  initial={false}
                  animate={{ opacity: commentCount > 0 ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {commentCount > 0 ? commentCount : ''}
                </Count>
              </CountBox>
            </IconRow>
          </FooterIcons>
        </Footer>
      </Overlay>
    </AnimatePresence>
  );
};

export default LightBox;
