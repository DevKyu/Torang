import confetti from 'canvas-confetti';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  ContentBox,
  Title,
  Button,
  DrawFlexGrid,
  CardContainer,
  CardGridWrapper,
  FooterWrapper,
  ScrollableCardGridWrapper,
  StickyHeader,
  CompletionMessage,
  SmallText,
} from '../styles/commonStyle';

import {
  getProductDataWithRaffle,
  getCurrentUserId,
  drawWinnerIfNotExists,
  preloadAllNames,
  getCachedUserName,
  logOut,
} from '../services/firebase';
import { useLoading } from '../contexts/LoadingContext';
import { ProductCard } from './ProductCard';

type DrawState = 'waiting' | 'drawing' | 'done';
type Product = {
  name: string;
  requiredPins: number;
  index: number;
  raffle?: string[];
  winner?: string;
};

const Draw = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const [drawState, setDrawState] = useState<DrawState>('waiting');
  const [currentEmpId, setCurrentEmpId] = useState<string>('');
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const { showLoadingWithTimeout } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndCache = async () => {
      showLoadingWithTimeout();
      try {
        const userId = await getCurrentUserId();
        const raffleProduct = await getProductDataWithRaffle();
        if (!raffleProduct) return;

        await preloadAllNames();

        setProducts(raffleProduct);
        setCurrentEmpId(userId ?? '');
      } catch {
        logOut();
        navigate('/');
      }
    };

    fetchAndCache();
  }, []);

  const scrollToCard = (index: number) => {
    const el = cardRefs.current[index];
    const wrapper = scrollWrapperRef.current;

    if (!el || !wrapper) return;

    const targetOffset = el.offsetTop + el.offsetHeight / 2;
    const scrollPosition = targetOffset - wrapper.clientHeight / 2;

    wrapper.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    });
  };

  const fireConfettiAtCard = (index: number) => {
    const el = cardRefs.current[index];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 120,
      spread: 100,
      startVelocity: 35,
      decay: 0.9,
      scalar: 1.1,
      origin: { x, y },
      colors: ['#facc15', '#3b82f6', '#ef4444', '#10b981'],
      shapes: ['circle', 'square'],
    });
  };

  const revealProduct = async (
    product: Product,
  ): Promise<string | undefined> => {
    if (product.winner) return product.winner;

    if (product.raffle?.length) {
      return await drawWinnerIfNotExists(product.index, product.raffle);
    }

    return undefined;
  };

  const handleFlip = async (index: number): Promise<void> => {
    if (flippedSet.has(index)) return;

    const product = products.find((p) => p.index === index);
    if (!product) return;

    const winnerEmpId = await revealProduct(product);

    setProducts((prev) =>
      prev.map((p) => (p.index === index ? { ...p, winner: winnerEmpId } : p)),
    );
    setFlippedSet((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);

      if (newSet.size === products.length) {
        setDrawState('done');
      }

      return newSet;
    });

    scrollToCard(index);

    if (winnerEmpId === currentEmpId) {
      fireConfettiAtCard(index);
    }
  };

  const handleSequentialReveal = async () => {
    if (drawState !== 'waiting') return;
    setDrawState('drawing');

    const toReveal = products.filter((p) => !flippedSet.has(p.index));
    for (const product of toReveal) {
      await handleFlip(product.index);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setDrawState('done');
  };

  const renderCards = () =>
    products.map((product) => (
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
          winnerName={getCachedUserName(product.winner || '')}
          flipped={flippedSet.has(product.index)}
          isWinner={product.winner === currentEmpId}
          raffle={product.raffle}
          currentEmpId={currentEmpId ?? ''}
        />
      </CardContainer>
    ));

  return (
    <Container>
      <ContentBox maxWidth="399px">
        <Title size="medium">🎯 상품 추첨</Title>

        <AnimatePresence mode="wait">
          {drawState !== 'done' ? (
            <StickyHeader
              key="progress"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              💳 추첨 카드 (
              <motion.span
                key={flippedSet.size}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 6, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'inline-block', fontWeight: 'bold' }}
              >
                {flippedSet.size}
              </motion.span>{' '}
              / {products.length})
            </StickyHeader>
          ) : (
            <CompletionMessage
              key="done"
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: [0.8, 1.1, 1], rotate: [0, 2, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.4 }}
            >
              🎉 당첨을 축하드립니다!
            </CompletionMessage>
          )}
        </AnimatePresence>
        <ScrollableCardGridWrapper ref={scrollWrapperRef}>
          <CardGridWrapper>
            <DrawFlexGrid>{renderCards()}</DrawFlexGrid>
          </CardGridWrapper>
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
          {drawState === 'done' && (
            <SmallText
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onClick={() => {
                navigate('/menu', { replace: true });
              }}
            >
              돌아가기
            </SmallText>
          )}
        </FooterWrapper>
      </ContentBox>
    </Container>
  );
};

export default Draw;
