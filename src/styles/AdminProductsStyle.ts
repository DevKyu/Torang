import styled from '@emotion/styled';

export const Section = styled.div`
  margin-bottom: 24px;
`;

export const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
`;

export const YmSelect = styled.select`
  appearance: none;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 32px 7px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center;
  color: #374151;
  cursor: pointer;
  margin-bottom: 24px;

  &:focus {
    outline: none;
    border-color: #c7a27c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ColHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 72px 72px 32px;
  gap: 6px;
  padding: 0 2px;
  margin-bottom: 6px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 60px 60px 28px;
  }
`;

export const ColLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.02em;
`;

export const ProductTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ProductRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 72px 72px 32px;
  gap: 6px;
  align-items: center;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 60px 60px 28px;
  }
`;

export const ProductInput = styled.input`
  font-size: 13px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: #c7a27c;
    box-shadow: 0 0 0 2px rgba(199, 162, 124, 0.12);
  }

  &[type='number'] {
    text-align: center;
  }
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
  transition: background 0.12s;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #fca5a5;
    }
  }

  &:active {
    transform: scale(0.94);
  }
`;

export const AddButton = styled.button`
  margin-top: 8px;
  font-size: 13px;
  padding: 8px;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  background: #f9fafb;
  color: #9ca3af;
  cursor: pointer;
  width: 100%;
  transition: border-color 0.12s, color 0.12s;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: #9ca3af;
      color: #6b7280;
    }
  }
`;

export const SaveButton = styled.button`
  margin-top: 14px;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.12s;

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: default;
  }

  &:not(:disabled) {
    &:active {
      transform: scale(0.985);
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        opacity: 0.9;
      }
    }
  }
`;

export const RaffleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const RaffleCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 11px 13px;
`;

export const RaffleCardTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const RaffleNames = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  word-break: break-all;
`;

export const WinnerNames = styled.div`
  font-size: 12px;
  color: #059669;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-all;
`;

export const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 10px;
  padding: 1px 7px;
`;

export const ResetButton = styled.button`
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border: none;
  border-radius: 9px;
  background: #fef3c7;
  color: #92400e;
  cursor: pointer;
  transition: background 0.12s;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #fde68a;
    }
  }

  &:active {
    transform: scale(0.985);
  }
`;

export const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 4px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const DescriptionInput = styled.textarea`
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  width: 100%;
  box-sizing: border-box;
  resize: none;
  height: 56px;
  font-family: inherit;
  line-height: 1.5;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #c7a27c;
    box-shadow: 0 0 0 2px rgba(199, 162, 124, 0.12);
  }
`;

export const EmptyNote = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  padding: 6px 0;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 24px 0;
`;

export const DrawActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
`;

export const StatusBadge = styled.span<{ $ready: boolean }>`
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  background: ${({ $ready }) => ($ready ? '#d1fae5' : '#f3f4f6')};
  color: ${({ $ready }) => ($ready ? '#059669' : '#6b7280')};
  white-space: nowrap;
`;

export const ComputeButton = styled.button`
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border: none;
  border-radius: 9px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.12s;
  white-space: nowrap;
  margin-bottom: 12px;

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: default;
  }

  &:not(:disabled) {
    &:active {
      transform: scale(0.985);
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        opacity: 0.9;
      }
    }
  }
`;
