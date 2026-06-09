import styled from '@emotion/styled';

export { MonthSelect, EmptyMsg, FormSection, FormTitle, FieldLabel, SaveRow, SaveBtn, CancelBtn, EmpIdBadge, NameDropdown, NameDropdownItem } from './AdminLeagueStyle';

export const SectionBlock = styled.div`
  margin-bottom: 20px;
`;

export const MissionInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  &[type='number'] {
    width: 80px;
    flex: none;
  }
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  &[type='number'] { -moz-appearance: textfield; }
`;

export const NumberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
`;

export const HiddenSection = styled.div<{ role: 'villain' | 'helper' }>`
  background: ${({ role }) => (role === 'villain' ? '#fef2f2' : '#eff6ff')};
  border: 1px solid ${({ role }) => (role === 'villain' ? '#fecaca' : '#bfdbfe')};
  border-left: 3px solid ${({ role }) => (role === 'villain' ? '#ef4444' : '#3b82f6')};
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
`;

export const HiddenSectionTitle = styled.div<{ role: 'villain' | 'helper' }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ role }) => (role === 'villain' ? '#dc2626' : '#2563eb')};
  margin-bottom: 8px;
`;

export const RoleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

export const RoleLabel = styled.span<{ role: 'villain' | 'helper' }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ role }) => (role === 'villain' ? '#dc2626' : '#2563eb')};
  min-width: 60px;
`;

export const RoleNameInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  font-size: 13px;
  min-width: 0;
  max-width: 200px;
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

export const RandomBtn = styled.button`
  padding: 8px 14px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ status }) =>
    status === 'revealed'
      ? '#111827'
      : status === 'voting'
        ? '#f59e0b'
        : status === 'active'
          ? '#10b981'
          : '#d1d5db'};
  color: ${({ status }) => (status === 'draft' ? '#6b7280' : '#fff')};
`;

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

export const StatusBtn = styled.button<{ color?: string }>`
  padding: 7px 14px;
  background: ${({ color }) => color ?? '#374151'};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const VoteStatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
`;

export const VoteStatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

export const VoteBar = styled.div<{ pct: number; color?: string }>`
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  &::after {
    content: '';
    display: block;
    width: ${({ pct }) => pct}%;
    height: 100%;
    background: ${({ color }) => color ?? '#3b82f6'};
    border-radius: 4px;
  }
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 20px 0;
`;

export const VoteStatLabel = styled.span`
  min-width: 60px;
  font-size: 13px;
  color: #374151;
`;

export const VoteStatCount = styled.span`
  min-width: 28px;
  text-align: right;
  font-size: 13px;
  color: #374151;
`;

export const VoteHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const ResultArea = styled.div`
  margin-top: 12px;
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
`;

export const SettingGroup = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SettingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SettingSectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 0.4px;
`;

export const SettingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

export const SettingCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const SettingCellLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
`;

export const SettingDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 0 -14px;
`;
