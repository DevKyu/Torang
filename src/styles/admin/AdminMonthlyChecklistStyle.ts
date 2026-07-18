import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { CheckCircle as BaseCheckCircle } from './AdminActivityParticipantsStyle';

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
  BottomSection,
  EmptyText,
} from './AdminActivityParticipantsStyle';

export const CheckCircle = styled(BaseCheckCircle)`
  margin-left: 0;
`;

export const StatusRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  gap: 8px;

  width: 100%;

  padding: 10px 14px;

  border: 1px solid rgba(235, 235, 235, 0.95);
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.88);

  &:not(:last-of-type) {
    margin-bottom: 6px;
  }

  @media (min-width: 769px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    gap: 0;
    min-height: 52px;
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
  gap: 10px;

  @media (min-width: 769px) {
    margin-left: 12px;
    flex-shrink: 0;
  }
`;

export const CheckItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 4px;

  width: 44px;
`;

export const CheckLabel = styled.div`
  width: 100%;
  text-align: center;

  font-size: 0.6rem;
  font-weight: 700;

  color: #a0a0a0;
  white-space: nowrap;
`;

export const TabRow = styled.div`
  display: flex;
  gap: 6px;
`;

export const TabButton = styled.button<{ active?: boolean }>`
  flex: 1;

  height: 34px;

  border-radius: 10px;
  border: 1px solid ${({ active }) => (active ? '#d6b089' : '#ece7df')};

  background: ${({ active }) =>
    active ? '#fffaf4' : 'rgba(255, 255, 255, 0.92)'};

  font-size: 0.8rem;
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

export const StatusCircle = styled.div<{ state: 'done' | 'pending' | 'na' }>`
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  border-radius: 999px;

  font-size: 0.7rem;
  font-weight: 800;

  transition: 0.15s ease;

  ${({ state }) =>
    state === 'done'
      ? css`
          border: 1.5px solid #d6b089;
          background: #d6b089;
          color: white;
        `
      : state === 'na'
        ? css`
            border: 1.5px dashed #e2e2e2;
            background: transparent;
            color: #cfcfcf;
          `
        : css`
            border: 1.5px solid #d6d6d6;
            background: white;
            color: white;
          `}
`;
