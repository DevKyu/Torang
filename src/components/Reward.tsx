import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Section,
  PinCount,
  PinNumber,
  UserName,
} from '../styles/commonStyle';
import {
  getCurrentUserData,
  getProductData,
  setProductData,
  setUserPinData,
  getUsedItems,
  saveUsedItems,
  removeProductData,
} from '../services/firebase';
import { ProductItem } from './ProductItem';
import { RewardHistory } from './RewardHistory';
import Layout from './layouts/Layout';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

type Product = {
  name: string;
  requiredPins: number;
  index: string;
};

const RewardLayout = () => {
  const [pinCount, setPinCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prod, user, savedUsedItems] = await Promise.all([
          getProductData(),
          getCurrentUserData(),
          getUsedItems(),
        ]);
        setProducts(prod);
        setUserName(user.name);
        setUsedItems(savedUsedItems);
        if (!user || !user.pin) {
          toast.error('또랑핀이 없습니다.');
          return;
        } else if (user.pin < 1) {
          toast.warning('선택 가능한 상품이 없습니다.');
        }
        setPinCount(user.pin);
      } catch (err) {
        toast.error('데이터를 불러오지 못했습니다.');
      }
    };
    loadData();
  }, []);

  const toggleSelect = (index: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const totalRequired = useMemo(() => {
    return Array.from(selected).reduce((sum, index) => {
      const p = products.find((item) => item.index === index);
      return sum + (p?.requiredPins || 0);
    }, 0);
  }, [selected, products]);

  const isValid = totalRequired <= pinCount;

  const handleCancel = async (index: string) => {
    const product = products.find((p) => p.index === index);
    if (!product) return;

    try {
      const newUsed = new Set(usedItems);
      newUsed.delete(index);
      setUsedItems(newUsed);

      const restoredPin = pinCount + product.requiredPins;
      setPinCount(restoredPin);

      await saveUsedItems(newUsed);
      await setUserPinData(product.requiredPins);
      await removeProductData(new Set([product.index]));

      toast.info(`'${product.name}' 신청이 취소되었습니다.`);
    } catch {
      toast.error('신청 취소 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (selected.size === 0) return toast.warning('상품을 선택해주세요!');
    if (!isValid) return toast.error('핀 개수가 부족합니다.');

    setIsSubmitting(true);
    try {
      await setProductData(selected);
      await setUserPinData(totalRequired * -1);
      await saveUsedItems(new Set([...usedItems, ...selected]));
      setPinCount((prev) => prev - totalRequired);
      setUsedItems((prev) => new Set([...prev, ...selected]));
      setSelected(new Set());
      toast.success('신청이 완료되었습니다!');
    } catch (error) {
      toast.error('신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableProducts = useMemo(
    () => products.filter((p) => !usedItems.has(p.index)),
    [products, usedItems],
  );

  return (
    <Layout title="🎳또랑핀 교환🎳">
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

      <Section>
        <Button
          onClick={handleSubmit}
          disabled={!selected.size || !isValid || isSubmitting}
        >
          신청하기
        </Button>
      </Section>
    </Layout>
  );
};

export default RewardLayout;
