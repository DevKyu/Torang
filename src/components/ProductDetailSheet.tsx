import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, useMotionValue, useDragControls } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

import {
  SheetWrapper,
  Backdrop,
  Sheet,
  DragHandle,
  HandleBar,
  SheetHeader,
  SheetTitle,
  SheetPinBadge,
  SheetBody,
  ImageWrap,
  ImageFg,
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

const getRatioLabel = (raffleCount: number, winnersCount: number): string | null => {
  if (raffleCount === 0) return null;
  const ratio = Math.round(raffleCount / winnersCount);
  if (ratio <= 1) return '경쟁률 낮음';
  return `경쟁률 ${ratio}:1`;
};

export const ProductDetailSheet = ({ open, product, onClose }: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const closingRef = useRef(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

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
    (_: any, info: PanInfo) => {
      const scrollTop = contentRef.current?.scrollTop ?? 0;
      if (scrollTop > 5) { resetPosition(); return; }
      if (info.offset.y > 100 || info.velocity.y > 500) runClose();
      else resetPosition();
    },
    [resetPosition, runClose],
  );

  useEffect(() => {
    if (!open || !product) return;
    closingRef.current = false;
    setImgLoaded(false);
    setViewerOpen(false);
    y.set(window.innerHeight);
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
              <DragHandle onPointerDown={(e) => dragControls.start(e)}>
                <HandleBar />
              </DragHandle>

              <SheetHeader onPointerDown={(e) => dragControls.start(e)}>
                <SheetTitle>{product.name}</SheetTitle>
                <SheetPinBadge>{product.requiredPins}핀</SheetPinBadge>
              </SheetHeader>

              <SheetBody ref={contentRef}>
                {product.imageUrl ? (
                  <ImageWrap onClick={() => imgLoaded && setViewerOpen(true)}>
                    <ImageFg
                      src={product.imageUrl}
                      alt={product.name}
                      $loaded={imgLoaded}
                      onLoad={() => setImgLoaded(true)}
                      onError={(e) => {
                        const wrap = (e.target as HTMLImageElement).parentElement;
                        if (wrap) wrap.style.display = 'none';
                      }}
                    />
                    {ratioLabel && imgLoaded && (
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
        {viewerOpen && (
          <ImageViewer
            key="image-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            onClick={() => setViewerOpen(false)}
          >
            <ImageViewerImg src={product.imageUrl} alt={product.name} />
          </ImageViewer>
        )}
      </AnimatePresence>
    </>
  );
};
