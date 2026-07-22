import { VoterCard, VoteCheckmark } from '../../styles/mission/MissionStyle';

type Props = {
  id: string;
  index: number;
  name: string;
  selected: boolean;
  onSelect: (id: string) => void;
};

const VoterCardItem = ({ id, index, name, selected, onSelect }: Props) => {
  return (
    <VoterCard
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ opacity: { duration: 0.2, delay: index * 0.06, ease: 'easeOut' } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.08 } }}
      selected={selected}
      onClick={() => onSelect(id)}
    >
      {name}
      <VoteCheckmark style={{ opacity: selected ? 1 : 0 }}>✓</VoteCheckmark>
    </VoterCard>
  );
};

export default VoterCardItem;
