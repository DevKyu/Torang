import { motion } from 'framer-motion';
import {
  ItemLabel,
  ItemInput,
  ItemWrapper,
  NameGroup,
  ItemName,
  Badge,
  RatioBadge,
  InfoButton,
} from '../styles/rewardStyle';

type Product = {
  name: string;
  requiredPins: number;
  index: string;
  description?: string;
  imageUrl?: string;
  raffleCount: number;
  winnersCount: number;
};

type ProductItemProps = {
  product: Product;
  selected: Set<string>;
  toggleSelect: (index: string) => void;
  onInfo: (product: Product) => void;
  willExceed: boolean;
  disabled?: boolean;
};

const getRatioLabel = (raffleCount: number, winnersCount: number): string | null => {
  if (raffleCount === 0) return null;
  const ratio = Math.round(raffleCount / winnersCount);
  if (ratio <= 1) return '경쟁률 낮음';
  return `경쟁률 ${ratio}:1`;
};

export const ProductItem = ({
  product,
  selected,
  toggleSelect,
  onInfo,
  willExceed,
  disabled = false,
}: ProductItemProps) => {
  const isSelected = selected.has(product.index);
  const isDisabled = disabled || willExceed;
  const ratioLabel = getRatioLabel(product.raffleCount, product.winnersCount);
  const hasDetail = !!(product.description || product.imageUrl);

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
          <NameGroup>
            <ItemName>{product.name}</ItemName>
            {hasDetail && (
              <InfoButton
                onClick={(e) => {
                  e.stopPropagation();
                  onInfo(product);
                }}
                title="상품 상세 정보"
              >
                i
              </InfoButton>
            )}
          </NameGroup>
        </ItemWrapper>

        {ratioLabel && <RatioBadge>{ratioLabel}</RatioBadge>}
        <Badge>{product.requiredPins}핀</Badge>
      </ItemLabel>
    </motion.div>
  );
};
