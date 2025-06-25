import { motion } from 'framer-motion';
import {
  ItemLabel,
  ItemInput,
  ItemWrapper,
  Badge,
  ItemContent,
} from '../styles/commonStyle';

export type Product = {
  name: string;
  requiredPins: number;
  index: string;
};

type ProductItemProps = {
  product: Product;
  selected: Set<string>;
  usedItems: Set<string>;
  toggleSelect: (index: string) => void;
  willExceed: boolean;
};

export const ProductItem = ({
  product,
  selected,
  usedItems,
  toggleSelect,
  willExceed,
}: ProductItemProps) => {
  const isSelected = selected.has(product.index);
  const isUsed = usedItems.has(product.index);
  const isDisabled = isUsed || willExceed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <ItemLabel disabled={isDisabled}>
        <ItemWrapper>
          <ItemInput
            type="checkbox"
            checked={isSelected}
            disabled={isDisabled}
            onChange={() => toggleSelect(product.index)}
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
