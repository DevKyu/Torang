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
import type { AppliedProduct } from '../types/UserInfo';

type RewardHistoryProps = {
  appliedProducts: Record<string, AppliedProduct>;
  onCancel: (index: string) => void;
};

export const RewardHistory = ({ appliedProducts, onCancel }: RewardHistoryProps) => {
  const entries = Object.entries(appliedProducts);
  if (entries.length === 0) return null;

  return (
    <Section>
      <HistoryBox>
        <HistoryTitle>🛍️ 신청 내역</HistoryTitle>
        <HistoryList>
          <AnimatePresence initial={false}>
            {entries.map(([index, ap]) => (
              <HistoryItem
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.18 }}
              >
                <ItemLeft>
                  <span>{ap.name}</span>
                  <Badge>{ap.requiredPins}핀</Badge>
                </ItemLeft>
                <RemoveBadge onClick={() => onCancel(index)} title="신청 취소">
                  ❌
                </RemoveBadge>
              </HistoryItem>
            ))}
          </AnimatePresence>
        </HistoryList>
      </HistoryBox>
    </Section>
  );
};
