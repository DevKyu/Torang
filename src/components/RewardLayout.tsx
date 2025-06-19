import React, { useState } from 'react';
import {
  Container,
  ContentBox,
  Section,
  Title,
  PinCount,
  Button,
} from '../styles/rewardLayout';
import { CategoryGroup, CategoryButton } from '../styles/categoryButton';
import { ProductItem } from '../components/ProductItem';
import { products, categories } from '../data/products';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RewardLayout: React.FC = () => {
  const [pinCount, setPinCount] = useState(5);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<'전체' | '생활' | '굿즈'>('전체');

  const filteredProducts =
    category === '전체'
      ? products
      : products.filter((p) => p.category === category);

  const toggleSelect = (name: string) => {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelected(next);
  };

  const totalRequired = Array.from(selected).reduce((sum, name) => {
    const p = products.find((item) => item.name === name);
    return sum + (p?.requiredPins || 0);
  }, 0);

  const isValid = totalRequired <= pinCount;

  const handleSubmit = () => {
    if (!selected.size) return toast.warning('상품을 선택해주세요!');
    if (!isValid) return toast.error('핀 개수가 부족합니다.');

    const totalUsed = totalRequired;
    setPinCount((prev) => prev - totalUsed);
    setUsedItems((prev) => new Set([...prev, ...selected]));
    setSelected(new Set());
    toast.success('신청 완료!');
  };

  return (
    <Container>
      <ContentBox>
        <Section>
          <Title>또랑핀 교환</Title>
          <PinCount>보유한 또랑핀: {pinCount}개</PinCount>
        </Section>

        <CategoryGroup>
          {categories.map((cat) => (
            <CategoryButton
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </CategoryButton>
          ))}
        </CategoryGroup>

        <Section>
          <AnimatePresence mode="popLayout">
            {filteredProducts
              .filter((product) => !usedItems.has(product.name))
              .map((product) => (
                <ProductItem
                  key={product.name}
                  product={product}
                  selected={selected}
                  usedItems={usedItems}
                  toggleSelect={toggleSelect}
                  pinCount={pinCount}
                />
              ))}
          </AnimatePresence>
        </Section>

        <Section>
          <Button onClick={handleSubmit} disabled={!selected.size || !isValid}>
            신청하기
          </Button>
        </Section>
      </ContentBox>
    </Container>
  );
};

export default RewardLayout;
