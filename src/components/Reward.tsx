import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import {
  getCurrentUserData,
  getProductBundle,
  setProductData,
  setUserPinData,
  getAppliedProducts,
  applyProduct,
  cancelAppliedProduct,
  removeProductData,
} from '../services/firebase';
import { useActivityDates } from '../hooks/useActivityDates';
import { useLoading } from '../contexts/LoadingContext';
import { useUiStore } from '../stores/useUiStore';
import { SmallText } from '../styles/commonStyle';
import {
  Section,
  PinCount,
  PinNumber,
  UserName,
  SubmitButton,
  LockNotice,
  ClosedSection,
  ClosedIcon,
  ClosedTitle,
  ClosedDesc,
  ClosedButton,
} from '../styles/rewardStyle';
import Layout from './layouts/Layout';
import { ProductItem } from './ProductItem';
import { RewardHistory } from './RewardHistory';
import { ProductDetailSheet } from './ProductDetailSheet';
import { getQuarterEndYm, isBeforeOrOnActivityDate } from '../utils/date';
import { CUR_YEAR, CUR_MONTHN } from '../constants/date';
import type { AppliedProduct } from '../types/UserInfo';

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

  const isCancellingRef = useRef(false);

  const { showLoading, hideLoading } = useLoading();
  const { maps: activityMaps } = useActivityDates();
  const navigate = useNavigate();
  const quarterYm = useMemo(() => getQuarterEndYm(), []);

  const activityYmd = activityMaps[CUR_YEAR]?.[String(CUR_MONTHN)];
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
    const loadData = async () => {
      showLoading();
      try {
        const [bundle, user, applied] = await Promise.all([
          getProductBundle(quarterYm),
          getCurrentUserData(),
          getAppliedProducts(quarterYm),
        ]);

        if (!user) {
          toast.error('회원 정보를 불러오지 못했어요.', { id: 'no-user' });
          return;
        }

        const isDrawDone = bundle.meta?.winnersReady ?? false;

        const prodList: Product[] = (bundle.items ?? [])
          .map((item: any, i: number) => ({
            name: item.name ?? '',
            requiredPins: item.requiredPins ?? 0,
            index: String(item.index ?? i),
            description: item.description,
            imageUrl: item.imageUrl,
            raffleCount: Array.isArray(item.raffle) ? item.raffle.length : 0,
            winnersCount: item.winnersCount ?? 1,
          }))
          .sort((a: Product, b: Product) => b.requiredPins - a.requiredPins || Number(a.index) - Number(b.index));

        if (!isDrawDone) {
          if (prodList.length === 0) {
            toast.warning('이번 분기에 등록된 상품이 없어요.', { id: 'no-products' });
          } else if ((user.pin ?? 0) < 1 && Object.keys(applied).length === 0) {
            toast.warning('핀이 부족해서 신청할 수 있는 상품이 없어요.', { id: 'no-pin' });
          }
        }

        setDrawDone(isDrawDone);
        setProducts(prodList);
        setUserName(user.name);
        setPinCount(user.pin ?? 0);
        setAppliedProducts(applied);
      } catch {
        toast.error('데이터를 불러오지 못했어요.', { id: 'no-data' });
      } finally {
        hideLoading();
      }
    };

    loadData();
  }, []);

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
      next.has(index) ? next.delete(index) : next.add(index);
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

  if (drawDone) {
    return (
      <Layout title="상품 신청" padding="compact">
        <ClosedSection>
          <ClosedIcon>🎁</ClosedIcon>
          <ClosedTitle>이번 분기 신청이 마감됐어요</ClosedTitle>
          <ClosedDesc>결과는 상품 추첨에서 확인해보세요</ClosedDesc>
          <ClosedButton onClick={() => navigate('/draw')}>
            추첨 결과 보러가기
          </ClosedButton>
        </ClosedSection>

        <SmallText
          top="narrow"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={() => navigate('/menu', { replace: true })}
        >
          돌아가기
        </SmallText>
      </Layout>
    );
  }

  return (
    <Layout title="상품 신청" padding="compact">
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

      <SmallText
        top="middle"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onClick={() => navigate('/menu', { replace: true })}
      >
        돌아가기
      </SmallText>
    </Layout>
  );
};

export default Reward;
