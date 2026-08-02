import styled from '@emotion/styled';

const teamAccentColor = (team: 'team1' | 'team2') => (team === 'team1' ? '#92400e' : '#4338ca');

export const PreviewInfoArea = styled.div`
  display: flex;
  flex-direction: column;
`;

export const VotedBonusNote = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  margin-top: 6px;
`;

export const VoteTriggerBtn = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1.5px solid #93c5fd;
  background: #eff6ff;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 4px;
  touch-action: manipulation;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #dbeafe;
      border-color: #60a5fa;
    }
  }
  &:active {
    background: #dbeafe;
    border-color: #60a5fa;
  }
`;

export const AddBonusBtn = styled.button`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  background: #fff;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  margin-bottom: 8px;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: #93c5fd;
      color: #2563eb;
    }
  }
  &:active {
    border-color: #93c5fd;
    color: #2563eb;
  }
`;

export const BonusSummaryChip = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #93c5fd;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  margin-bottom: 8px;
  transition: background 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #dbeafe;
    }
  }
  &:active {
    background: #dbeafe;
  }
`;

export const BonusSummaryEdit = styled.span`
  font-size: 11px;
  color: #2563eb;
  opacity: 0.7;
`;

export const BonusPickPanel = styled.div`
  margin-top: 4px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
`;

export const BonusPickVersusBlock = styled.div`
  margin-bottom: 10px;
`;

export const BonusPickTeamLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  & + & {
    margin-top: 6px;
  }
`;

export const BonusPickTeamTag = styled.span<{ team: 'team1' | 'team2' }>`
  flex-shrink: 0;
  font-weight: 700;
  color: ${({ team }) => teamAccentColor(team)};
`;

export const BonusPickPlayers = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4b5563;
`;

export const RosterCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  margin-bottom: 4px;
`;

export const RevealedRosterGap = styled.div`
  margin-bottom: 10px;
`;

export const RosterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

export const RosterTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: #111827;
`;

export const RosterResultBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  padding: 4px 10px;
  border-radius: 99px;
  background: #dcfce7;
  color: #166534;
`;

export const DiffChip = styled.span<{ level: 'low' | 'mid' | 'high' }>`
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  padding: 4px 10px;
  min-width: 72px;
  text-align: center;
  border-radius: 99px;
  white-space: nowrap;
  ${({ level }) =>
    level === 'low'
      ? 'background: #dcfce7; color: #166534;'
      : level === 'mid'
        ? 'background: #fef3c7; color: #92400e;'
        : 'background: #fee2e2; color: #991b1b;'}
`;

export const RosterTeamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

export const RosterTeamCol = styled.div<{ team: 'team1' | 'team2' }>`
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: ${({ team }) => (team === 'team1' ? '#fffbeb' : '#eef2ff')};
  border-top: 3px solid ${({ team }) => (team === 'team1' ? '#fcd34d' : '#a5b4fc')};
  border-left: ${({ team }) => (team === 'team2' ? '1px solid #e5e7eb' : 'none')};

  @media (min-width: 444px) {
    padding: 12px 16px;
  }
`;

export const RosterTeamLabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const RosterTeamLabel = styled.span<{ team: 'team1' | 'team2' }>`
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  color: ${({ team }) => teamAccentColor(team)};
`;

export const RosterTeamAvg = styled.span`
  font-size: 10.5px;
  line-height: 1.4;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
`;

export const RosterPlayerRow = styled.div<{ isMe?: boolean; clickable?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-height: 28px;
  padding: 3px 2px;
  border-radius: 6px;
  background: ${({ isMe }) => (isMe ? '#fef9c3' : 'transparent')};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
`;

export const RosterPlayerNameGroup = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

export const RosterRivalBadge = styled.span`
  font-size: 12px;
  line-height: 1;
  flex-shrink: 0;
`;

export const RosterPlayerName = styled.span<{ isMe?: boolean }>`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  font-size: 13px;
  line-height: 1.4;
  color: ${({ isMe }) => (isMe ? '#92400e' : '#374151')};
  font-weight: ${({ isMe }) => (isMe ? 700 : 400)};
`;

export const RosterPlayerAvg = styled.span<{ isMe?: boolean; detail?: boolean }>`
  font-size: 12px;
  line-height: 1.4;
  color: ${({ isMe }) => (isMe ? '#92400e' : '#6b7280')};
  font-weight: ${({ isMe, detail }) => (isMe || detail ? 600 : 400)};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const PickRow = styled.div<{ compact?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  margin: ${({ compact }) => (compact ? '0' : '12px 0 10px')};
`;

export const PickBtn = styled.button<{ selected?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  padding: 10px 4px;
  border-radius: 8px;
  border: 1.5px solid ${({ selected }) => (selected ? '#3b82f6' : '#e5e7eb')};
  background: ${({ selected }) => (selected ? '#eff6ff' : '#fff')};
  color: ${({ selected }) => (selected ? '#2563eb' : '#6b7280')};
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ selected }) => (selected ? '#3b82f6' : '#cbd5e1')};
    }
  }
  &:active {
    transform: scale(0.97);
  }
`;

export const BonusCandidateRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition: border-color 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: #cbd5e1;
    }
  }
  &:active {
    border-color: #cbd5e1;
  }
`;

export const BonusCandidateTitle = styled.span`
  font-size: 14px;
  line-height: 1.3;
  font-weight: 700;
  color: #111827;
`;

export const BonusCandidateLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const BonusCandidateCheck = styled.span<{ checked?: boolean }>`
  flex-shrink: 0;
  min-width: 16px;
  text-align: center;
  font-size: 14px;
  line-height: 1.3;
  font-weight: 700;
  color: ${({ checked }) => (checked ? '#2563eb' : '#d1d5db')};
`;
