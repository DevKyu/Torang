import styled from '@emotion/styled'
import { motion } from 'framer-motion'

export const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`

export const MonthSelect = styled.select`
  padding: 7px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: #fff;
`

export const LabeledInput = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;

  input {
    width: 60px;
    padding: 6px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
    text-align: center;
    background: #fff;
  }
`

export const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  @media (max-width: 400px) {
    flex-wrap: wrap;
  }
`

export const GenerateBtn = styled.button`
  padding: 8px 14px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (hover: hover) and (pointer: fine) {
    &:not(:disabled):hover {
      background: #2563eb;
    }
  }
`

export const ShuffleBtn = styled.button`
  padding: 8px 14px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (hover: hover) and (pointer: fine) {
    &:not(:disabled):hover {
      background: #f9fafb;
    }
  }
`

export const ConfirmBtn = styled.button`
  padding: 8px 14px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (hover: hover) and (pointer: fine) {
    &:not(:disabled):hover {
      background: #059669;
    }
  }
`

export const ResetBtn = styled.button`
  padding: 5px 12px;
  background: #fff;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (hover: hover) and (pointer: fine) {
    &:not(:disabled):hover {
      background: #fef2f2;
    }
  }
`

export const ClearBtn = styled.button`
  padding: 5px 12px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      background: #b91c1c;
    }
  }
`

export const ConfirmedBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #065f46;
  gap: 10px;
`

export const GroupTabs = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`

export const GroupTab = styled.button<{ active: boolean }>`
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background 0.15s, color 0.15s;
  background: ${({ active }) => (active ? '#fef9c3' : '#f1f5f9')};
  color: ${({ active }) => (active ? '#92400e' : '#6b7280')};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${({ active }) => (active ? '#fde68a' : '#e2e8f0')};
    }
  }
  &:active {
    background: ${({ active }) => (active ? '#fde68a' : '#e2e8f0')};
  }
`

export const GroupCard = styled(motion.div)`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
`

export const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`

export const GroupBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  background: #111827;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
`

export const DiffChip = styled.span<{ level: 'low' | 'mid' | 'high' }>`
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  ${({ level }) =>
    level === 'low'
      ? 'background: #dcfce7; color: #166534;'
      : level === 'mid'
        ? 'background: #fef3c7; color: #92400e;'
        : 'background: #fee2e2; color: #991b1b;'}
`

export const TeamsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

export const TeamBlock = styled.div<{ team: '1' | '2' }>`
  padding: 12px 14px;
  background: ${({ team }) => (team === '1' ? '#f0fdf4' : '#eef2ff')};
  border-left: ${({ team }) =>
    team === '2' ? '1px solid #e5e7eb' : 'none'};

  @media (max-width: 480px) {
    border-left: none;
    border-top: ${({ team }) => (team === '2' ? '1px solid #e5e7eb' : 'none')};
  }
`

export const TeamLabel = styled.div<{ team: '1' | '2' }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ team }) => (team === '1' ? '#059669' : '#4f46e5')};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const TeamTotal = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
`

export const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);

  &:last-child {
    border-bottom: none;
  }
`

export const PlayerAvg = styled.span`
  font-size: 12px;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
`

export const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  padding: 32px 0;
  margin: 0;
`

export const ParticipantCount = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
`

export const EditToggleBtn = styled.button<{ active?: boolean }>`
  padding: 8px 14px;
  background: ${({ active }) => (active ? '#f0fdf4' : '#fff')};
  color: ${({ active }) => (active ? '#059669' : '#6b7280')};
  border: 1px solid ${({ active }) => (active ? '#6ee7b7' : '#e5e7eb')};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: ${({ active }) => (active ? '#ecfdf5' : '#f9fafb')}; }
  }
`

export const PlayerEditActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`

export const MoveBtn = styled.button`
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #4338ca;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #e0e7ff; }
  }
`

export const DeleteBtn = styled.button`
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #fca5a5;
  background: #fef2f2;
  color: #dc2626;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #fee2e2; }
  }
`

export const AddPlayerRow = styled.button`
  width: 100%;
  margin-top: 6px;
  padding: 5px;
  border: 1px dashed #d1d5db;
  border-radius: 5px;
  background: none;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  @media (hover: hover) and (pointer: fine) {
    &:hover { color: #6b7280; background: rgba(0,0,0,0.02); }
  }
`

export const PickerList = styled.div`
  margin-top: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow-y: auto;
  max-height: 280px;
  background: #fff;
`

export const PickerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  &:last-child { border-bottom: none; }
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #f9fafb; }
  }
  &:active { background: #f3f4f6; }
`

export const PickerEmpty = styled.div`
  padding: 10px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
`

export const PickerCancel = styled.button`
  width: 100%;
  padding: 7px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  border-top: 1px solid #e5e7eb;
`

export const GuestBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
  margin-left: 4px;
  flex-shrink: 0;
`

export const PlayerNameCell = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
`

export const PlayerNameText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const GuestDivider = styled.div`
  padding: 6px 10px 4px;
  font-size: 11px;
  color: #9ca3af;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
`

export const GuestInputRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;

  input {
    border: 1px solid #e5e7eb;
    border-radius: 5px;
    padding: 5px 7px;
    font-size: 12px;
    background: #fff;
  }

  input:first-of-type { flex: 1; min-width: 0; }
  input:last-of-type  { width: 52px; text-align: center; }

  button {
    padding: 5px 10px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
  }
`
