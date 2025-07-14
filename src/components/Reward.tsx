import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

import {
  getCurrentUserData,
  getProductData,
  setProductData,
  setUserPinData,
  getUsedItems,
  saveUsedItems,
  removeProductData,
  logOut,
} from '../services/firebase';
import { useLoading } from '../contexts/LoadingContext';
import { Button, SmallText } from '../styles/commonStyle';
import { Section, PinCount, PinNumber, UserName } from '../styles/rewardStyle';
import Layout from './layouts/Layout';
import { ProductItem } from './ProductItem';
import { RewardHistory } from './RewardHistory';

type Product = {
  name: string;
  requiredPins: number;
  index: string;
};

const Reward = () => {
  const [pinCount, setPinCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showLoading, showLoadingWithTimeout, hideLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      showLoadingWithTimeout();
      try {
        const [prod, user, savedUsedItems] = await Promise.all([
          getProductData('202506'),
          getCurrentUserData(),
          getUsedItems(),
        ]);

        if (!user) {
          toast.error('회원 정보를 불러오지 못했어요.');
          return;
        }
        if (!user.pin || (user.pin < 1 && saveUsedItems.length == 0)) {
          toast.warning('선택할 수 있는 상품이 없어요.');
        }

        setProducts(prod);
        setUserName(user.name);
        setPinCount(user.pin ?? 0);
        setUsedItems(savedUsedItems);
      } catch {
        toast.error('데이터를 불러오지 못했어요.');
        logOut();
        navigate('/', { replace: true });
      }
    };

    loadData();
  }, []);

  const totalRequired = useMemo(() => {
    return Array.from(selected).reduce((sum, index) => {
      const product = products.find((p) => p.index === index);
      return sum + (product?.requiredPins || 0);
    }, 0);
  }, [selected, products]);

  const isValid = totalRequired <= pinCount;

  const availableProducts = useMemo(
    () => products.filter((p) => !usedItems.has(p.index)),
    [products, usedItems],
  );

  const toggleSelect = (index: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const handleCancel = async (index: string) => {
    const product = products.find((p) => p.index === index);
    if (!product) return;

    showLoading();
    try {
      const updatedUsedItems = new Set(usedItems);
      updatedUsedItems.delete(index);

      setUsedItems(updatedUsedItems);
      setPinCount((prev) => prev + product.requiredPins);

      await saveUsedItems(updatedUsedItems);
      await setUserPinData(product.requiredPins);
      await removeProductData('202506', new Set([index]));

      toast.info(`${product.name} 신청을 취소했어요.`);
    } catch {
      toast.error('신청 취소에 실패했어요.');
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || selected.size === 0) return;
    if (!isValid) return toast.error('핀 개수가 부족해요.');

    setIsSubmitting(true);
    showLoading();

    try {
      await setProductData('202506', selected);
      await setUserPinData(-totalRequired);
      await saveUsedItems(new Set([...usedItems, ...selected]));

      setPinCount((prev) => prev - totalRequired);
      setUsedItems((prev) => new Set([...prev, ...selected]));
      setSelected(new Set());

      toast.success('신청이 완료되었어요.');
    } catch {
      toast.error('신청에 실패했어요.');
    } finally {
      setIsSubmitting(false);
      hideLoading();
    }
  };

  return (
    <Layout title="🎳또랑핀 교환🎳" padding="compact">
      <Section>
        <PinCount>
          <UserName>{userName}</UserName>님이 보유한 또랑핀 :{' '}
          <PinNumber>{pinCount}개</PinNumber>
        </PinCount>
      </Section>

      {usedItems.size > 0 && (
        <RewardHistory
          usedItems={usedItems}
          products={products}
          onCancel={handleCancel}
        />
      )}

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
                usedItems={usedItems}
                toggleSelect={toggleSelect}
                willExceed={willExceed}
              />
            );
          })}
        </AnimatePresence>
      </Section>

      <Button
        onClick={handleSubmit}
        disabled={!selected.size || !isValid || isSubmitting}
      >
        신청하기
      </Button>
      <SmallText
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onClick={() => {
          logOut();
          navigate('/menu', { replace: true });
        }}
      >
        돌아가기
      </SmallText>
    </Layout>
  );
};

export default Reward;
