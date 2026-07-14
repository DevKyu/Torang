import styled from '@emotion/styled';

export {
  PageWrap,
  TopSection,
  SearchRow,
  MonthSelect,
  SearchInput,
  SummarySection,
  SummaryCard,
  SummaryValue,
  SummaryLabel,
  ListSection,
  ListHeader,
  ListCount,
  ListSubText,
  UserList,
  UserInfoWrap,
  UserName,
  UserMeta,
  UserTypeBadge,
  CheckCircle,
  BottomSection,
  EmptyText,
} from './AdminActivityParticipantsStyle';

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  min-height: 52px;

  padding: 10px 14px;

  border: 1px solid rgba(235, 235, 235, 0.95);
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.88);

  &:not(:last-of-type) {
    margin-bottom: 6px;
  }
`;

export const ToggleButton = styled.button<{ active?: boolean }>`
  height: 32px;

  border-radius: 8px;
  border: 1px solid ${({ active }) => (active ? '#d6b089' : '#ece7df')};

  background: ${({ active }) =>
    active ? '#fffaf4' : 'rgba(255, 255, 255, 0.92)'};

  font-size: 0.76rem;
  font-weight: 700;

  color: ${({ active }) => (active ? '#b17837' : '#5c5c5c')};

  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;

  transition:
    transform 0.1s ease,
    background 0.18s ease,
    border-color 0.18s ease;

  &:active {
    transform: scale(0.98);
  }
`;

export const ChecksWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  margin-left: 8px;
  flex-shrink: 0;
`;

export const CheckItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 4px;
`;

export const CheckLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 700;

  color: #a0a0a0;
  white-space: nowrap;
`;
