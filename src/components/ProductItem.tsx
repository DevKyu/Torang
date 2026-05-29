import { motion } from 'framer-motion';
import {
  ItemLabel,
  ItemInput,
  ItemWrapper,
  ItemName,
  Badge,
} from '../styles/rewardStyle';

type Product = {
  name: string;
  requiredPins: number;
  index: string;
};

type ProductItemProps = {
  product: Product;
  selected: Set<string>;
  toggleSelect: (index: string) => void;
  willExceed: boolean;
  disabled?: boolean;
};

export const ProductItem = ({
  product,
  selected,
  toggleSelect,
  willExceed,
  disabled = false,
}: ProductItemProps) => {
  const isSelected = selected.has(product.index);
  const isDisabled = disabled || willExceed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
    >
      <ItemLabel disabled={isDisabled} selected={isSelected}>
        <ItemWrapper>
          <ItemInput
            type="checkbox"
            checked={isSelected}
            disabled={isDisabled}
            onChange={() => toggleSelect(product.index)}
          />
          <ItemName>{product.name}</ItemName>
        </ItemWrapper>
        <Badge>{product.requiredPins}핀</Badge>
      </ItemLabel>
    </motion.div>
  );
};
