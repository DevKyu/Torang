import {
  VotedStateArea,
  AlreadyVotedBox,
  VotedEmoji,
  VotedHeadline,
  VotedSub,
} from '../../styles/mission/MissionStyle';

type Props = {
  emoji: string;
  headline: string;
  sub: string;
};

const StatusCard = ({ emoji, headline, sub }: Props) => (
  <VotedStateArea>
    <AlreadyVotedBox>
      <VotedEmoji>{emoji}</VotedEmoji>
      <VotedHeadline>{headline}</VotedHeadline>
      <VotedSub>{sub}</VotedSub>
    </AlreadyVotedBox>
  </VotedStateArea>
);

export default StatusCard;
