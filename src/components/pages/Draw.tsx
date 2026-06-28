import confetti from 'canvas-confetti';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { onValue, ref } from 'firebase/database';
import { ClipLoader } from 'react-spinners';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { SmallText } from '../../styles/global/commonStyle';
import {
  DrawGridContainer,
  CardContainer,
  ScrollableCardGridWrapper,
  StickyHeader,
  CompletionMessage,
  HeaderWrapper,
  DrawButton,
  DrawLoadingBox,
  PrepareSection,
  PrepareIcon,
  PrepareTitle,
  PrepareDesc,
  ContentArea,
} from '../../styles/pages/drawStyle';

import {
  db,
  parseProductBundle,
  waitForAuthUser,
  empIdFromEmail,
  preloadAllNames,
} from '../../services/firebase';
import { ProductCard } from '../products/ProductCard';
import Layout from '../layouts/Layout';
import { getQuarterEndYm } from '../../utils/date';
import type { ProductItem } from '../../types/Product';

const orderProducts = (items: ProductItem[], drawOrder?: number[]): ProductItem[] => {
  if (drawOrder?.length) {
    const map = new Map(items.map((p) => [p.index, p]));
    return drawOrder.map((idx) => map.get(idx)).filter(Boolean) as ProductItem[];
  }
  return [...items].sort((a, b) => b.requiredPins - a.requiredPins || a.index - b.index);
};

type DrawState = 'waiting' | 'drawing' | 'done';
type SupplementMap = Record<string, string[]>;

const Draw = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [supplement, setSupplement] = useState<SupplementMap>({});
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const [drawState, setDrawState] = useState<DrawState>('waiting');
  const [currentEmpId, setCurrentEmpId] = useState<string>('');
  const [isScrollable, setIsScrollable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [winnersReady, setWinnersReady] = useState(false);

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const goBack = useNavigateBack();

  const ym = useMemo(() => getQuarterEndYm(), []);

  useEffect(() => {
    const el = scrollWrapperRef.current;
    if (!el) return;

    const update = () => setIsScrollable(el.scrollHeight > el.clientHeight + 4);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [products]);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    const init = async () => {
      try {
        const [user] = await Promise.all([waitForAuthUser(), preloadAllNames()]);
        if (cancelled) return;
        setCurrentEmpId(empIdFromEmail(user?.email));

        unsub = onValue(
          ref(db, `products/${ym}`),
          (snap) => {
            if (cancelled) return;
            const bundle = parseProductBundle(snap);
            setProducts(orderProducts(bundle.items, bundle.meta?.drawOrder));
            setSupplement(bundle.meta?.supplement ?? {});
            setWinnersReady(bundle.meta?.winnersReady ?? false);
            setLoading(false);
          },
          () => {
            if (cancelled) return;
            toast.error('데이터를 불러오지 못했어요.', { id: 'draw-load-error' });
            setLoading(false);
          },
        );
      } catch {
        if (!cancelled) {
          toast.error('데이터를 불러오지 못했어요.', { id: 'draw-load-error' });
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [ym]);

  useEffect(() => {
    if (products.length > 0 && flippedSet.size === products.length) {
      setDrawState('done');
    }
  }, [flippedSet, products.length]);

  const hasSelfWon = useMemo(
    () =>
      products.some((p) => {
        const supIds = supplement[String(p.index)] ?? [];
        return (p.winners ?? []).includes(currentEmpId) || supIds.includes(currentEmpId);
      }),
    [products, supplement, currentEmpId],
  );

  const scrollToCard = (index: number) => {
    const el = cardRefs.current[index];
    const wrapper = scrollWrapperRef.current;
    if (!el || !wrapper) return;

    const elRect = el.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const scrollTarget =
      wrapper.scrollTop + (elRect.top - wrapperRect.top) + elRect.height / 2 - wrapper.clientHeight / 2;
    wrapper.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  };

  const fireConfettiAtCard = (index: number) => {
    const el = cardRefs.current[index];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    confetti({
      particleCount: 120,
      spread: 100,
      startVelocity: 35,
      decay: 0.9,
      scalar: 1.1,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#facc15', '#3b82f6', '#ef4444', '#10b981'],
      shapes: ['circle', 'square'],
    });
  };

  const handleFlip = (index: number) => {
    if (flippedSet.has(index)) return;

    const product = products.find((p) => p.index === index);
    if (!product) return;

    const winnerIds = product.winners ?? [];
    const supIds = supplement[String(index)] ?? [];

    setFlippedSet((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });

    scrollToCard(index);

    if (winnerIds.includes(currentEmpId) || supIds.includes(currentEmpId)) {
      fireConfettiAtCard(index);
    }
  };

  const handleSequentialReveal = async () => {
    if (drawState !== 'waiting') return;
    setDrawState('drawing');

    const toReveal = products.filter((p) => !flippedSet.has(p.index));
    for (const p of toReveal) {
      handleFlip(p.index);
      await new Promise((r) => setTimeout(r, 800));
    }
  };

  const screenKey = loading
    ? 'loading'
    : products.length === 0
      ? 'empty'
      : !winnersReady
        ? 'prepare'
        : 'ready';

  return (
    <Layout title="추첨 결과" padding="draw">
      <ContentArea>
        <AnimatePresence mode="wait" initial={false}>
          {screenKey === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <DrawLoadingBox>
                <ClipLoader size={24} color="#9ca3af" />
              </DrawLoadingBox>
            </motion.div>
          )}

          {screenKey === 'empty' && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PrepareSection>
                <PrepareIcon>🎁</PrepareIcon>
                <PrepareTitle>상품을 준비하고 있어요</PrepareTitle>
                <PrepareDesc>추첨이 곧 시작될 예정이에요 ✨</PrepareDesc>
              </PrepareSection>
            </motion.div>
          )}

          {screenKey === 'prepare' && (
            <motion.div
              key="prepare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PrepareSection>
                <PrepareIcon>🎁</PrepareIcon>
                <PrepareTitle>추첨 결과를 준비 중이에요</PrepareTitle>
                <PrepareDesc>결과가 곧 공개될 예정이에요 ✨</PrepareDesc>
              </PrepareSection>
            </motion.div>
          )}

          {screenKey === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <HeaderWrapper>
                <StickyHeader
                  initial={false}
                  animate={{
                    opacity: drawState !== 'done' ? 1 : 0,
                    y: drawState !== 'done' ? 0 : -8,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  💳 추첨 카드 ({flippedSet.size} / {products.length})
                </StickyHeader>

                <CompletionMessage
                  initial={false}
                  animate={{
                    opacity: drawState === 'done' ? 1 : 0,
                    scale: drawState === 'done' ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  {hasSelfWon ? '🎉 당첨을 축하드립니다!' : '아쉽지만 다음 기회에 🍀'}
                </CompletionMessage>
              </HeaderWrapper>

              <ScrollableCardGridWrapper ref={scrollWrapperRef} scrollable={isScrollable}>
                <DrawGridContainer>
                  {products.map((product, index) => {
                    const supIds = supplement[String(product.index)] ?? [];
                    return (
                      <CardContainer
                        key={product.index}
                        ref={(el) => { cardRefs.current[product.index] = el; }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
                        onClick={() => {
                          if (drawState !== 'waiting') return;
                          handleFlip(product.index);
                        }}
                      >
                        <ProductCard
                          productName={product.name}
                          winners={product.winners ?? []}
                          supplement={supIds}
                          flipped={flippedSet.has(product.index)}
                          isWinner={product.winners?.includes(currentEmpId)}
                          raffle={product.raffle}
                          currentEmpId={currentEmpId}
                          isBonus={product.requiredPins === 0}
                        />
                      </CardContainer>
                    );
                  })}
                </DrawGridContainer>
              </ScrollableCardGridWrapper>

              <DrawButton
                onClick={handleSequentialReveal}
                disabled={drawState !== 'waiting'}
              >
                {drawState === 'drawing'
                  ? '결과 공개 중'
                  : drawState === 'done'
                    ? '추첨 완료'
                    : '전체 결과 공개'}
              </DrawButton>
            </motion.div>
          )}
        </AnimatePresence>
      </ContentArea>

      <SmallText
        top="middle"
        onClick={() => {
          if (loading) return;
          goBack();
        }}
      >
        돌아가기
      </SmallText>
    </Layout>
  );
};

export default Draw;
