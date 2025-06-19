import React from 'react';
import { motion } from 'framer-motion';
import {
  ItemLabel,
  ItemInput,
  ItemWrapper,
  Badge,
  ItemContent,
} from '../styles/productItem';
import type { Product } from '../data/products';

interface ProductItemProps {
  product: Product;
  selected: Set<string>;
  usedItems: Set<string>;
  toggleSelect: (name: string) => void;
  pinCount: number;
}

export const ProductItem: React.FC<ProductItemProps> = ({
  product,
  selected,
  usedItems,
  toggleSelect,
  pinCount,
}) => {
  const selectedThis = selected.has(product.name);
  const alreadyUsed = usedItems.has(product.name);
  const totalRequired = Array.from(selected).reduce((sum, name) => {
    return name === product.name
      ? sum
      : sum + (product.name === name ? product.requiredPins : 0);
  }, 0);
  const wouldExceed =
    totalRequired + product.requiredPins > pinCount && !selectedThis;

  return (
    <motion.div
      key={product.name}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <ItemLabel disabled={wouldExceed || alreadyUsed}>
        <ItemWrapper>
          <ItemInput
            type="checkbox"
            checked={selectedThis}
            disabled={wouldExceed || alreadyUsed}
            onChange={() => toggleSelect(product.name)}
          />
          <ItemContent>
            <span>{product.name}</span>
            <Badge>{product.requiredPins}핀</Badge>
          </ItemContent>
        </ItemWrapper>
      </ItemLabel>
    </motion.div>
  );
};
