import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getRatioLabel } from './ProductItem';
import { AnimatePresence, animate, useMotionValue, useDragControls } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

import {
  SheetWrapper,
  Backdrop,
  Sheet,
  DragZone,
  DragHandle,
  HandleBar,
  SheetHeader,
  SheetTitle,
  SheetPinBadge,
  SheetBody,
  ImageWrap,
  ImageFg,
  ShimmerOverlay,
  ImageRatioBadge,
  TextRatioBadge,
  Description,
  NoDescription,
  ImageViewer,
  ImageViewerImg,
} from '../styles/productDetailSheetStyle';

type Product = {
  name: string;
  requiredPins: number;
  description?: string;
  imageUrl?: string;
  raffleCount: number;
  winnersCount: number;
};

type Props = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
};

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];


export const ProductDetailSheet = ({ open, product, onClose }: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const closingRef = useRef(false);
  const decodeTokenRef = useRef(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImgLoaded, setViewerImgLoaded] = useState(false);

  const runClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const height = sheetRef.current?.offsetHeight ?? 600;
    animate(y, height, { duration: 0.28, ease: EASE_OUT, onComplete: onClose });
  }, [onClose, y]);

  const resetPosition = useCallback(() => {
    animate(y, 0, { duration: 0.22, ease: EASE_OUT });
  }, [y]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const scrollTop = contentRef.current?.scrollTop ?? 0;
      if (scrollTop > 5) { resetPosition(); return; }
      if (info.offset.y > 100 || info.velocity.y > 500) runClose();
      else resetPosition();
    },
    [resetPosition, runClose],
  );

  useLayoutEffect(() => {
    if (!open || !product) return;
    decodeTokenRef.current += 1;
    closingRef.current = false;
    setImgLoaded(false);
    setImgError(false);
    setViewerOpen(false);
    setViewerImgLoaded(false);
    y.set(window.innerHeight);
  }, [open, product, y]);

  useEffect(() => {
    if (!open || !product) return;
    animate(y, 0, { duration: 0.32, ease: EASE_OUT });
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open, product, y]);

  if (!product) return null;

  const ratioLabel = getRatioLabel(product.raffleCount, product.winnersCount);

  return (
    <>
      <AnimatePresence>
        {open && (
          <SheetWrapper
            key="detail-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.22 } }}
          >
            <Backdrop onClick={runClose} />

            <Sheet
              ref={sheetRef}
              style={{ y }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
            >
              <DragZone onPointerDown={(e) => dragControls.start(e)}>
                <DragHandle>
                  <HandleBar />
                </DragHandle>
                <SheetHeader>
                  <SheetTitle>{product.name}</SheetTitle>
                  <SheetPinBadge>{product.requiredPins}핀</SheetPinBadge>
                </SheetHeader>
              </DragZone>

              <SheetBody ref={contentRef}>
                {product.imageUrl ? (
                  <ImageWrap onClick={() => imgLoaded && setViewerOpen(true)}>
                    <AnimatePresence>
                      {!imgLoaded && !imgError && (
                        <ShimmerOverlay
                          key="shimmer"
                          exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
                        />
                      )}
                    </AnimatePresence>

                    <ImageFg
                      src={product.imageUrl}
                      alt={product.name}
                      draggable={false}
                      style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.25s ease-out' }}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        const token = decodeTokenRef.current;
                        img.decode()
                          .then(() => { if (decodeTokenRef.current === token) setImgLoaded(true); })
                          .catch(() => { if (decodeTokenRef.current === token) setImgLoaded(true); });
                      }}
                      onError={() => { setImgLoaded(true); setImgError(true); }}
                    />

                    {ratioLabel && imgLoaded && !imgError && (
                      <ImageRatioBadge>{ratioLabel}</ImageRatioBadge>
                    )}
                  </ImageWrap>
                ) : ratioLabel ? (
                  <TextRatioBadge>{ratioLabel}</TextRatioBadge>
                ) : null}

                {product.description
                  ? <Description>{product.description}</Description>
                  : <NoDescription>상세 정보가 없어요.</NoDescription>
                }
              </SheetBody>
            </Sheet>
          </SheetWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewerOpen && product.imageUrl && (
          <ImageViewer
            key="image-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => setViewerOpen(false)}
          >
            <ImageViewerImg
              src={product.imageUrl}
              alt={product.name}
              style={{ opacity: viewerImgLoaded ? 1 : 0 }}
              onLoad={(e) => {
                const img = e.currentTarget;
                img.decode()
                  .then(() => setViewerImgLoaded(true))
                  .catch(() => setViewerImgLoaded(true));
              }}
            />
          </ImageViewer>
        )}
      </AnimatePresence>
    </>
  );
};
