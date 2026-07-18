import { useState, useEffect, useRef, useMemo } from 'react';
import type { ProductItem as ProductItemType } from '../../types/Product';
import { useNavigate } from 'react-router-dom';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { toast } from 'sonner';
import { onValue, ref } from 'firebase/database';

import {
  db,
  parseProductBundle,
  getCurrentUserData,
  setProductData,
  setUserPinData,
  getAppliedProducts,
  applyProduct,
  cancelAppliedProduct,
  removeProductData,
  waitForAuthUser,
} from '../../services/firebase';
import { useActivityDates } from '../../hooks/useActivityDates';
import { useLoading } from '../../contexts/LoadingContext';
import { useUiStore } from '../../stores/useUiStore';
import { SmallText } from '../../styles/global/commonStyle';
import {
  Section,
  PinCount,
  PinNumber,
  UserName,
  SubmitButton,
  LockNotice,
  GuideSection,
  GuideIcon,
  GuideTitle,
  GuideDesc,
  GuideButton,
  LoadingBox,
  ContentArea,
} from '../../styles/pages/rewardStyle';
import Layout from '../layouts/Layout';
import { ProductItem } from '../products/ProductItem';
import { RewardHistory } from '../shared/RewardHistory';
import { ProductDetailSheet } from '../products/ProductDetailSheet';
import { getQuarterEndYm, isBeforeOrOnActivityDate } from '../../utils/date';
import type { AppliedProduct } from '../../types/UserInfo';

type Product = {
  name: string;
  requiredPins: number;
  index: string;
  description?: string;
  imageUrl?: string;
  raffleCount: number;
  winnersCount: number;
};

const Reward = () => {
  const [pinCount, setPinCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [appliedProducts, setAppliedProducts] = useState<Record<string, AppliedProduct>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [drawDone, setDrawDone] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isCancellingRef = useRef(false);
  const resolvedRef = useRef({ products: false, profile: false });
  const noPinWarnedRef = useRef(false);

  const { showLoading, hideLoading } = useLoading();
  const { maps: activityMaps } = useActivityDates();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const quarterYm = useMemo(() => getQuarterEndYm(), []);

  const { formatServerDate } = useUiStore.getState();
  const serverYear = formatServerDate('year');
  const serverMonth = formatServerDate('month');
  const activityYmd = activityMaps[serverYear]?.[serverMonth];
  const isLocked = useMemo(
    () => isBeforeOrOnActivityDate(activityYmd, useUiStore.getState().getServerNow()),
    [activityYmd],
  );
  const lockNoticeText = useMemo(() => {
    const ymd = activityYmd ? String(activityYmd) : '';
    if (ymd.length !== 8) return null;
    const unlockDate = new Date(
      Number(ymd.slice(0, 4)),
      Number(ymd.slice(4, 6)) - 1,
      Number(ymd.slice(6, 8)) + 1,
    );
    return `${unlockDate.getMonth() + 1}월 ${unlockDate.getDate()}일부터 신청할 수 있어요`;
  }, [activityYmd]);

  useEffect(() => {
    let cancelled = false;
    resolvedRef.current = { products: false, profile: false };
    noPinWarnedRef.current = false;

    const tryFinish = () => {
      if (resolvedRef.current.products && resolvedRef.current.profile) {
        setIsReady(true);
      }
    };

    const unsubProducts = onValue(
      ref(db, `products/${quarterYm}`),
      (snap) => {
        if (cancelled) return;
        const bundle = parseProductBundle(snap);
        const isDrawDone = bundle.meta?.winnersReady ?? false;

        const prodList: Product[] = (bundle.items ?? [])
          .map((item: ProductItemType, i: number) => ({
            name: item.name ?? '',
            requiredPins: item.requiredPins ?? 0,
            index: String(item.index ?? i),
            description: item.description,
            imageUrl: item.imageUrl,
            raffleCount: Array.isArray(item.raffle) ? item.raffle.length : 0,
            winnersCount: item.winnersCount ?? 1,
          }))
          .sort((a: Product, b: Product) => b.requiredPins - a.requiredPins || Number(a.index) - Number(b.index));

        setDrawDone(isDrawDone);
        setProducts(prodList);
        resolvedRef.current.products = true;
        tryFinish();
      },
      () => {
        if (cancelled) return;
        toast.error('데이터를 불러오지 못했어요.', { id: 'no-data' });
        resolvedRef.current.products = true;
        tryFinish();
      },
    );

    const loadProfile = async () => {
      try {
        await waitForAuthUser();
        const [user, applied] = await Promise.all([
          getCurrentUserData(),
          getAppliedProducts(quarterYm),
        ]);
        if (cancelled) return;

        if (!user) {
          toast.error('회원 정보를 불러오지 못했어요.', { id: 'no-user' });
          return;
        }

        setUserName(user.name);
        setPinCount(user.pin ?? 0);
        setAppliedProducts(applied);
      } catch {
        if (!cancelled) toast.error('데이터를 불러오지 못했어요.', { id: 'no-data' });
      } finally {
        if (!cancelled) {
          resolvedRef.current.profile = true;
          tryFinish();
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
      unsubProducts();
    };
  }, [quarterYm]);

  useEffect(() => {
    if (!isReady || noPinWarnedRef.current) return;
    noPinWarnedRef.current = true;

    if (!drawDone && products.length > 0 && pinCount < 1 && Object.keys(appliedProducts).length === 0) {
      toast.warning('핀이 부족해서 신청할 수 있는 상품이 없어요.', { id: 'no-pin' });
    }
  }, [isReady, drawDone, products, pinCount, appliedProducts]);

  const totalRequired = useMemo(
    () =>
      Array.from(selected).reduce((sum, index) => {
        const product = products.find((p) => p.index === index);
        return sum + (product?.requiredPins || 0);
      }, 0),
    [selected, products],
  );

  const isValid = totalRequired <= pinCount;

  const availableProducts = useMemo(
    () => products.filter((p) => !(p.index in appliedProducts)),
    [products, appliedProducts],
  );

  const toggleSelect = (index: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) { next.delete(index); } else { next.add(index); }
      return next;
    });
  };

  const handleCancel = async (index: string) => {
    if (isCancellingRef.current) return;
    const applied = appliedProducts[index];
    if (!applied) return;

    isCancellingRef.current = true;
    showLoading();

    const prevApplied = { ...appliedProducts };
    const prevRaffleCount = products.find((p) => p.index === index)?.raffleCount ?? 0;

    const next = { ...appliedProducts };
    delete next[index];
    setAppliedProducts(next);
    setPinCount((prev) => prev + applied.requiredPins);
    setProducts((prev) =>
      prev.map((p) =>
        p.index === index ? { ...p, raffleCount: Math.max(0, p.raffleCount - 1) } : p,
      ),
    );

    try {
      await Promise.all([
        cancelAppliedProduct(quarterYm, index),
        setUserPinData(applied.requiredPins),
        removeProductData(quarterYm, new Set([index])),
      ]);
      toast.info(`${applied.name} 신청을 취소했어요.`);
    } catch {
      setAppliedProducts(prevApplied);
      setPinCount((prev) => prev - applied.requiredPins);
      setProducts((prev) =>
        prev.map((p) => (p.index === index ? { ...p, raffleCount: prevRaffleCount } : p)),
      );
      toast.error('신청 취소에 실패했어요.');
    } finally {
      isCancellingRef.current = false;
      hideLoading();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || selected.size === 0) return;
    if (!isValid) {
      toast.error('핀 개수가 부족해요.');
      return;
    }

    setIsSubmitting(true);
    showLoading();

    try {
      const now = useUiStore.getState().getServerNow().getTime();

      const newEntries: Record<string, AppliedProduct> = {};
      for (const index of selected) {
        const product = products.find((p) => p.index === index);
        if (!product) continue;
        newEntries[index] = { name: product.name, requiredPins: product.requiredPins, appliedAt: now };
      }

      await Promise.all([
        setProductData(quarterYm, selected),
        setUserPinData(-totalRequired),
        ...Object.entries(newEntries).map(([index, data]) => applyProduct(quarterYm, index, data)),
      ]);

      setPinCount((prev) => prev - totalRequired);
      setAppliedProducts((prev) => ({ ...prev, ...newEntries }));
      setProducts((prev) =>
        prev.map((p) =>
          selected.has(p.index) ? { ...p, raffleCount: p.raffleCount + 1 } : p,
        ),
      );
      setSelected(new Set());

      toast.success('신청이 완료됐어요.');
    } catch {
      toast.error('신청에 실패했어요.');
    } finally {
      setIsSubmitting(false);
      hideLoading();
    }
  };

  const screenKey = !isReady
    ? 'loading'
    : drawDone
      ? 'closed'
      : products.length === 0
        ? 'empty'
        : 'list';

  return (
    <Layout title="상품 신청" padding="compact">
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
              <LoadingBox>
                <ClipLoader size={24} color="#9ca3af" />
              </LoadingBox>
            </motion.div>
          )}

          {screenKey === 'closed' && (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <GuideSection>
                <GuideIcon>🎁</GuideIcon>
                <GuideTitle>이번 분기 신청이 마감됐어요</GuideTitle>
                <GuideDesc>결과를 확인해보세요</GuideDesc>
                <GuideButton onClick={() => navigate('/draw')}>
                  추첨 결과 보러가기
                </GuideButton>
              </GuideSection>
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
              <GuideSection>
                <GuideIcon>🎁</GuideIcon>
                <GuideTitle>상품을 준비하고 있어요</GuideTitle>
                <GuideDesc>신청 가능한 상품이 곧 등록될 예정이에요 ✨</GuideDesc>
              </GuideSection>
            </motion.div>
          )}

          {screenKey === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Section>
                <PinCount>
                  <UserName>{userName}</UserName>님 🎳 보유 또랑핀
                  <PinNumber>{pinCount}개</PinNumber>
                </PinCount>
              </Section>

              {Object.keys(appliedProducts).length > 0 && (
                <RewardHistory
                  appliedProducts={appliedProducts}
                  onCancel={handleCancel}
                />
              )}

              {isLocked && lockNoticeText && <LockNotice>🔒 {lockNoticeText}</LockNotice>}

              <Section>
                <AnimatePresence mode="popLayout">
                  {availableProducts.map((product) => {
                    const isSelected = selected.has(product.index);
                    const willExceed =
                      !isSelected && totalRequired + product.requiredPins > pinCount;

                    return (
                      <ProductItem
                        key={product.index}
                        product={product}
                        selected={selected}
                        toggleSelect={toggleSelect}
                        onInfo={setDetailProduct}
                        willExceed={willExceed}
                        disabled={isLocked}
                      />
                    );
                  })}
                </AnimatePresence>
              </Section>

              <SubmitButton
                onClick={handleSubmit}
                disabled={!selected.size || !isValid || isSubmitting || isLocked}
              >
                신청하기
              </SubmitButton>

              <ProductDetailSheet
                open={detailProduct !== null}
                product={detailProduct}
                onClose={() => setDetailProduct(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ContentArea>

      <SmallText
        top="middle"
        onClick={() => {
          if (!isReady) return;
          goBack();
        }}
      >
        돌아가기
      </SmallText>
    </Layout>
  );
};

export default Reward;
