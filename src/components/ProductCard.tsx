import { useCallback, useMemo } from 'react';

import {
  CardInner,
  CardBadge,
  Name,
  WinnerNames,
  HintText,
  Front,
  Back,
  SupporterCount,
  SupporterList,
  MoreText,
  WinnerNameItem,
} from '../styles/drawStyle';

import { getCachedUserName } from '../services/firebase';
import { showHiddenNamesToast } from '../utils/toast';

type Props = {
  productName: string;
  winners?: string[];
  supplement?: string[];
  flipped: boolean;
  isWinner?: boolean;
  raffle?: string[];
  currentEmpId: string;
  isBonus: boolean;
};

export const ProductCard = ({
  productName,
  winners = [],
  supplement = [],
  flipped,
  isWinner,
  raffle = [],
  currentEmpId,
  isBonus,
}: Props) => {
  const raffleCount = raffle.length;

  const isSelfWinner = Boolean(
    flipped && (isWinner || supplement.includes(currentEmpId)),
  );

  const raffleNames = useMemo(() => {
    if (raffleCount === 0) return [];
    return raffle.map(getCachedUserName);
  }, [raffle, raffleCount]);

  const handleShowHiddenNames = useCallback(() => {
    if (raffleNames.length === 0) return;
    showHiddenNamesToast(productName, raffleNames);
  }, [productName, raffleNames]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      handleShowHiddenNames();
    },
    [handleShowHiddenNames],
  );

  return (
    <CardInner
      animate={{ rotateY: flipped ? 180 : 0 }}
      initial={{ rotateY: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Front>
        <Name>{productName}</Name>

        <HintText
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          클릭하여 결과 보기
        </HintText>

        {isBonus ? (
          <SupporterCount>미당첨자 중 추첨</SupporterCount>
        ) : (
          <SupporterCount>총 {raffleCount}명 신청</SupporterCount>
        )}
      </Front>

      <Back isWinner={isSelfWinner} winnerCount={winners.length}>
        <CardBadge>🎉 {productName}</CardBadge>

        <WinnerNames count={winners.length}>
          {winners.length === 0 ? (
            <WinnerNameItem
              className="empty"
              count={0}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              없음
            </WinnerNameItem>
          ) : (
            winners.map((id) => (
              <WinnerNameItem
                key={id}
                count={winners.length}
                isSupplement={supplement.includes(id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  flipped
                    ? { opacity: 1, scale: [0.9, 1.2, 1] }
                    : { opacity: 0, scale: 0.9 }
                }
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {getCachedUserName(id)}
              </WinnerNameItem>
            ))
          )}
        </WinnerNames>

        {flipped && raffleCount > 0 && (
          <SupporterList>
            <MoreText
              role="button"
              tabIndex={0}
              onClick={handleShowHiddenNames}
              onKeyDown={handleKeyDown}
            >
              신청자 보기
            </MoreText>
          </SupporterList>
        )}
      </Back>
    </CardInner>
  );
};
