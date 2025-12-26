import confetti from 'canvas-confetti';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  ContentBox,
  Title,
  Button,
  SmallText,
} from '../styles/commonStyle';
import {
  DrawGridContainer,
  CardContainer,
  ScrollableCardGridWrapper,
  StickyHeader,
  CompletionMessage,
  FooterWrapper,
  HeaderWrapper,
} from '../styles/drawStyle';

import {
  getProductBundle,
  getCurrentUserId,
  preloadAllNames,
} from '../services/firebase';
import { useLoading } from '../contexts/LoadingContext';
import { ProductCard } from './ProductCard';
import { ensureBatchWinners } from '../utils/ensureBatchWinners';
import { useUiStore } from '../stores/useUiStore';

type DrawState = 'waiting' | 'drawing' | 'done';

type Product = {
  name: string;
  requiredPins: number;
  index: number;
  raffle?: string[];
  winners?: string[];
};

type SupplementMap = Record<number, string[]>;

const Draw = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [supplement, setSupplement] = useState<SupplementMap>({});
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const [drawState, setDrawState] = useState<DrawState>('waiting');
  const [currentEmpId, setCurrentEmpId] = useState<string>('');
  const [isScrollable, setIsScrollable] = useState(false);

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const { showLoadingWithTimeout, hideLoading } = useLoading();
  const { formatServerDate } = useUiStore();
  const navigate = useNavigate();

  const yyyymm = useMemo(() => formatServerDate('ym'), [formatServerDate]);

  useEffect(() => {
    const el = scrollWrapperRef.current;
    if (!el) return;

    const update = () => {
      setIsScrollable(el.scrollHeight > el.clientHeight + 4);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [products]);

  useEffect(() => {
    const init = async () => {
      showLoadingWithTimeout();

      try {
        await ensureBatchWinners(yyyymm, navigate);

        const userId = await getCurrentUserId();
        const bundle = await getProductBundle(yyyymm);
        if (!bundle) return;

        await preloadAllNames();
        setProducts(bundle.items);
        setSupplement(bundle.meta?.supplement ?? {});
        setCurrentEmpId(userId ?? '');
      } catch {
        navigate('/', { replace: true });
      } finally {
        hideLoading();
      }
    };

    init();
  }, [yyyymm]);

  const scrollToCard = (index: number) => {
    const el = cardRefs.current[index];
    const wrapper = scrollWrapperRef.current;
    if (!el || !wrapper) return;

    const targetOffset = el.offsetTop + el.offsetHeight / 2;
    const scrollPosition = targetOffset - wrapper.clientHeight / 2;
    wrapper.scrollTo({ top: scrollPosition, behavior: 'smooth' });
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

  const handleFlip = async (index: number) => {
    if (flippedSet.has(index)) return;

    const product = products.find((p) => p.index === index);
    if (!product) return;

    const winnerIds = product.winners ?? [];
    const supIds = supplement[product.index] ?? [];

    setFlippedSet((prev) => {
      const next = new Set(prev);
      next.add(index);
      if (next.size === products.length) setDrawState('done');
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
      await handleFlip(p.index);
      await new Promise((r) => setTimeout(r, 800));
    }

    setDrawState('done');
  };

  return (
    <Container>
      <ContentBox padding="draw">
        <Title size="medium">상품 추첨</Title>

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
            🎉 당첨을 축하드립니다!
          </CompletionMessage>
        </HeaderWrapper>

        <ScrollableCardGridWrapper
          ref={scrollWrapperRef}
          scrollable={isScrollable}
        >
          <DrawGridContainer>
            {products.map((product) => {
              const supIds = supplement[product.index] ?? [];
              return (
                <CardContainer
                  key={product.index}
                  ref={(el) => {
                    cardRefs.current[product.index] = el;
                  }}
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

        <FooterWrapper>
          <Button
            onClick={handleSequentialReveal}
            disabled={drawState !== 'waiting'}
          >
            {drawState === 'drawing'
              ? '결과 공개 중'
              : drawState === 'done'
                ? '추첨 완료'
                : '전체 결과 공개'}
          </Button>
          <SmallText
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onClick={() => navigate('/menu', { replace: true })}
          >
            돌아가기
          </SmallText>
        </FooterWrapper>
      </ContentBox>
    </Container>
  );
};

export default Draw;
