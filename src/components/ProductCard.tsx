import toast from 'react-hot-toast';
import {
  CardInner,
  CardBadge,
  Name,
  WinnerName,
  HintText,
  Front,
  Back,
  SupporterCount,
  SupporterBadge,
  SupporterList,
  MoreText,
} from '../styles/commonStyle';

import { getCachedUserName } from '../services/firebase';

type Props = {
  productName: string;
  winnerName?: string;
  flipped: boolean;
  isWinner?: boolean;
  raffle?: string[];
  currentEmpId: string;
};

export const ProductCard = ({
  productName,
  winnerName,
  flipped,
  isWinner,
  raffle,
  currentEmpId,
}: Props) => {
  const MAX_BADGES = 3;
  const visibleRaffle = (raffle ?? []).slice(0, MAX_BADGES);
  const hiddenCount = raffle ? Math.max(raffle.length - MAX_BADGES, 0) : 0;
  const handleShowHiddenNames = () => {
    toast.dismiss();
    const names = raffle?.slice(MAX_BADGES).map(getCachedUserName).join(', ');
    toast(names || '없음');
  };

  const winnerAnimation = flipped
    ? {
        opacity: 1,
        scale: [0.9, 1.3, 1],
        rotate: [0, 2, 0],
      }
    : { opacity: 0, scale: 0.9 };

  return (
    <CardInner
      animate={{ rotateY: flipped ? 180 : 0 }}
      initial={{ rotateY: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0.2, 0.2, 1] }}
      whileTap={{ scale: 0.97 }}
    >
      <Front style={{ backfaceVisibility: 'hidden' }}>
        <div>
          <Name>{productName}</Name>
          <HintText
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            클릭하여 결과 보기
          </HintText>

          <SupporterCount>총 {raffle?.length}명 신청</SupporterCount>
        </div>
      </Front>

      <Back isWinner={isWinner}>
        <CardBadge>🎉 {productName}</CardBadge>
        <WinnerName
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={winnerAnimation}
          transition={{
            duration: 0.7,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'mirror',
          }}
        >
          {winnerName || '없음'}
        </WinnerName>

        <SupporterList>
          {visibleRaffle?.map((id) => (
            <SupporterBadge key={id} isSelf={id === currentEmpId}>
              {getCachedUserName(id)}
            </SupporterBadge>
          ))}
          {hiddenCount > 0 && (
            <MoreText
              onClick={handleShowHiddenNames}
            >{`+${hiddenCount}명`}</MoreText>
          )}
        </SupporterList>
      </Back>
    </CardInner>
  );
};

export default ProductCard;
