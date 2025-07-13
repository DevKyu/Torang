import { AnimatePresence } from 'framer-motion';

import {
  Section,
  HistoryBox,
  HistoryTitle,
  HistoryList,
  HistoryItem,
  ItemLeft,
  Badge,
  RemoveBadge,
} from '../styles/rewardStyle';

type Product = {
  name: string;
  requiredPins: number;
  index: string;
};

type RewardHistoryProps = {
  usedItems: Set<string>;
  products: Product[];
  onCancel: (index: string) => void;
};

export const RewardHistory = ({
  usedItems,
  products,
  onCancel,
}: RewardHistoryProps) => {
  if (usedItems.size === 0) return null;

  return (
    <AnimatePresence>
      <Section>
        <HistoryBox>
          <HistoryTitle>🛍️ 신청 내역</HistoryTitle>
          <HistoryList>
            {[...usedItems].map((index) => {
              const product = products.find((p) => p.index === index);
              return (
                <HistoryItem
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                >
                  <ItemLeft>
                    <span>{product?.name || '알 수 없음'}</span>
                    <Badge>{product?.requiredPins}핀</Badge>
                  </ItemLeft>
                  <RemoveBadge
                    onClick={() => onCancel(index)}
                    title="신청 취소"
                  >
                    ❌
                  </RemoveBadge>
                </HistoryItem>
              );
            })}
          </HistoryList>
        </HistoryBox>
      </Section>
    </AnimatePresence>
  );
};
