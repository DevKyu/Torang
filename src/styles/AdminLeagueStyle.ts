import styled from '@emotion/styled';

export const MonthSelect = styled.select`
  padding: 7px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
  cursor: pointer;
`;

export const GroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
`;

export const GroupRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #f3f4f6; }
  }
  &:active { background: #f3f4f6; }
`;

export const GroupBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  background: #111827;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
`;

export const GroupDate = styled.span`
  font-size: 13px;
  color: #9ca3af;
  margin-left: auto;
`;

export const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 14px;
  margin: 0;
`;

export const AddGroupBtn = styled.button`
  width: 100%;
  padding: 10px;
  background: #fff;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  margin-top: 4px;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #f9fafb; color: #374151; }
  }
  &:active { background: #f9fafb; color: #374151; }
`;

export const ApplyScoreBtn = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 4px;
  background: #fff;
  border: 1px dashed #6366f1;
  border-radius: 8px;
  font-size: 14px;
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #eef2ff; }
  }
  &:active { background: #eef2ff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
`;

export const FieldLabel = styled.label`
  font-size: 13px;
  color: #374151;
  display: block;
  margin-bottom: 4px;
`;

export const TeamSection = styled.div<{ team?: '1' | '2' }>`
  background: ${({ team }) =>
    team === '1' ? '#f0fdf4' : team === '2' ? '#eef2ff' : '#f9fafb'};
  border: 1px solid ${({ team }) =>
    team === '1' ? '#bbf7d0' : team === '2' ? '#c7d2fe' : '#e5e7eb'};
  border-left: 3px solid ${({ team }) =>
    team === '1' ? '#10b981' : team === '2' ? '#6366f1' : '#e5e7eb'};
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
`;

export const TeamHeader = styled.div<{ team?: '1' | '2' }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ team }) =>
    team === '1' ? '#059669' : team === '2' ? '#4f46e5' : '#374151'};
  margin-bottom: 10px;
`;

export const PlayerRowWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
`;

export const PlayerRowMain = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 280px;
`;

export const PlayerRowSub = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

export const PlayerInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  font-size: 13px;
  &[type='number'] { width: 64px; flex: none; }
  &[type='date'] { flex: none; width: 160px; margin-bottom: 16px; }
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
`;

export const AddPlayerBtn = styled.button`
  width: 100%;
  padding: 6px;
  background: none;
  border: 1px dashed #d1d5db;
  border-radius: 5px;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  margin-top: 4px;
  @media (hover: hover) and (pointer: fine) {
    &:hover { color: #6b7280; background: #f3f4f6; }
  }
  &:active { color: #6b7280; background: #f3f4f6; }
`;

export const RemoveBtn = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
  }
  &:active { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
`;

export const WinnerRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

export const WinnerBtn = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 9px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid ${({ active }) => (active ? '#111827' : '#e5e7eb')};
  background: ${({ active }) => (active ? '#111827' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#6b7280')};
  transition: all 0.15s;
`;

export const SaveRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const SaveBtn = styled.button`
  padding: 9px 20px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const DeleteBtn = styled.button<{ confirm?: boolean }>`
  padding: 9px 16px;
  background: ${({ confirm }) => (confirm ? '#dc2626' : '#fff')};
  color: ${({ confirm }) => (confirm ? '#fff' : '#dc2626')};
  border: ${({ confirm }) => (confirm ? 'none' : '1px solid #fca5a5')};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const CancelBtn = styled.button`
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 9px 14px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #f9fafb; }
  }
  &:active { background: #f9fafb; }
`;

export const EmpIdBadge = styled.div`
  flex: 0 0 80px;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NameDropdown = styled.div`
  margin: -2px 0 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const NameDropdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  &:not(:last-child) { border-bottom: 1px solid #f3f4f6; }
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #f9fafb; }
  }
  &:active { background: #f9fafb; }
  span { color: #9ca3af; font-size: 12px; }
`;
