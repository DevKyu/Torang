import styled from '@emotion/styled';

export {
  FormTitle,
  FieldLabel,
  SaveRow,
  SaveBtn,
  EmptyMsg,
  NameDropdown,
  NameDropdownItem,
  WinnerRow,
  WinnerBtn,
} from './AdminLeagueStyle';

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 20px 0;
`;

export const SectionBlock = styled.div`
  margin-bottom: 20px;
`;

export const TitleInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
`;

export const CharCount = styled.div<{ over?: boolean }>`
  text-align: right;
  font-size: 11px;
  color: ${({ over }) => (over ? '#dc2626' : '#9ca3af')};
  margin-top: 4px;
`;

export const TargetSearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

export const TargetSearchInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  font-size: 13px;
  min-width: 0;
`;

export const LookupBtn = styled.button`
  flex-shrink: 0;
  padding: 6px 10px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  touch-action: manipulation;
`;

export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`;

export const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 6px 5px 10px;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  border-radius: 16px;
  font-size: 12px;
  color: #6d28d9;
`;

export const ChipRemoveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #ddd6fe;
  color: #6d28d9;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
`;

export const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 50vh;
  max-height: 50dvh;
  overflow-y: auto;
  touch-action: pan-y;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
`;

export const HistoryRow = styled.div`
  padding: 12px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #f3f4f6;
    }
  }
  &:active {
    background: #eef0f2;
  }
`;

export const HistoryRowTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

export const TypeBadge = styled.span<{ color: string }>`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ color }) => `${color}1a`};
  color: ${({ color }) => color};
`;

export const StatusTag = styled.span<{ status: 'active' | 'cancelled' }>`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ status }) => (status === 'active' ? '#10b981' : '#e5e7eb')};
  color: ${({ status }) => (status === 'active' ? '#fff' : '#6b7280')};
`;

export const HistoryTitle = styled.span<{ cancelled?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ cancelled }) => (cancelled ? '#9ca3af' : '#111827')};
  text-decoration: ${({ cancelled }) => (cancelled ? 'line-through' : 'none')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HistoryMeta = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

export const DangerRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 6px;
`;

export const CancelLink = styled.button`
  padding: 0;
  background: none;
  border: none;
  font-size: 12px;
  color: #dc2626;
  cursor: pointer;
  text-decoration: underline;
  touch-action: manipulation;
`;

export const DeleteForeverLink = styled.button`
  padding: 0;
  background: none;
  border: none;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  text-decoration: underline;
  touch-action: manipulation;
  &:active {
    color: #dc2626;
  }
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: #dc2626;
    }
  }
`;
