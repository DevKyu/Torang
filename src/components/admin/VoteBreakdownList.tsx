import { EmptyMsg, VoteStatList, VoteStatRow, VoteBar, VoteStatLabel, VoteStatCount } from '../../styles/admin/AdminMissionStyle';

type Entry = { empId: string; label: string; count: number; color?: string };

type Props = {
  total: number;
  entries: Entry[];
  emptyLabel: string;
  totalLabel: string;
};

const VoteBreakdownList = ({ total, entries, emptyLabel, totalLabel }: Props) => {
  if (total === 0) return <EmptyMsg>{emptyLabel}</EmptyMsg>;
  return (
    <VoteStatList>
      {entries.map(({ empId, label, count, color }) => (
        <VoteStatRow key={empId}>
          <VoteStatLabel>{label}</VoteStatLabel>
          <VoteBar pct={Math.round((count / total) * 100)} color={color ?? '#10b981'} />
          <VoteStatCount>{count}표</VoteStatCount>
        </VoteStatRow>
      ))}
      <VoteStatRow>
        <VoteStatLabel style={{ color: '#6b7280' }}>{totalLabel}</VoteStatLabel>
        <VoteStatCount style={{ color: '#6b7280', marginLeft: 'auto' }}>{total}명</VoteStatCount>
      </VoteStatRow>
    </VoteStatList>
  );
};

export default VoteBreakdownList;
