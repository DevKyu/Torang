import {
  CardInner,
  CardBadge,
  Name,
  WinnerNames,
  HintText,
  Front,
  Back,
  SupporterCount,
  SupporterBadge,
  SupporterList,
  MoreText,
  WinnerNameItem,
} from '../styles/drawStyle';

import { getCachedUserName } from '../services/firebase';
import { showHiddenNamesToast } from '../utils/toast';

const MAX_BADGES = 0;

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
  raffle,
  currentEmpId,
  isBonus,
}: Props) => {
  const visibleRaffle = (raffle ?? []).slice(0, MAX_BADGES);
  const hiddenCount = raffle ? Math.max(raffle.length - MAX_BADGES, 0) : 0;

  const handleShowHiddenNames = () => {
    const names = raffle?.slice(MAX_BADGES).map(getCachedUserName);
    showHiddenNamesToast(productName, names);
  };

  return (
    <CardInner
      animate={{ rotateY: flipped ? 180 : 0 }}
      initial={{ rotateY: 0 }}
      transition={{
        duration: 0.55,
        ease: [0.25, 0.1, 0.25, 1],
      }}
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
          <SupporterCount>총 {raffle?.length ?? 0}명 신청</SupporterCount>
        )}
      </Front>

      <Back isWinner={isWinner}>
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

        <SupporterList>
          {visibleRaffle.map((id) => (
            <SupporterBadge key={id} isSelf={id === currentEmpId}>
              {getCachedUserName(id)}
            </SupporterBadge>
          ))}
          {hiddenCount > 0 && (
            <MoreText onClick={handleShowHiddenNames}>신청자 보기</MoreText>
          )}
        </SupporterList>
      </Back>
    </CardInner>
  );
};
