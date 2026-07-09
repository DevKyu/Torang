import styled from '@emotion/styled';

export const Section = styled.section`
  margin-bottom: 24px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
`;

export const OrderInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 12px;
`;

export const BadgeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const BadgeTextInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 12px;
`;

export const BadgeColorInput = styled.input`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: none;
  cursor: pointer;
  touch-action: manipulation;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }
  &::-webkit-color-swatch {
    border-radius: 4px;
    border: none;
  }
`;

export const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;

  input {
    transform: scale(0.9);
  }
`;

export const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const MonthSelect = styled.select`
  width: auto;
  max-width: 140px;
  padding: 6px 28px 6px 14px;
  border-radius: 999px;
  border: 1px solid #ddd;
  font-size: 13px;
  background: #fff;
  appearance: none;
  -webkit-appearance: none;

  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 8L10 12L14 8' stroke='%239CA3AF' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
`;

export const RewardActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

export const BulkRewardButton = styled.button`
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 999px;
  border: none;
  background: #111827;
  color: #fff;
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #374151;
    }
  }
`;

export const GhostButton = styled.button`
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #f3f4f6;
    }
  }
`;

export const RewardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const RewardCard = styled.div`
  display: grid;
  grid-template-areas:
    'title toggle'
    'rates rates';
  grid-template-columns: 1fr auto;
  row-gap: 6px;
  column-gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: #f9fafb;
  font-size: 13px;
`;

export const RewardTitle = styled.div`
  grid-area: title;
  font-weight: 600;
`;

export const RewardToggle = styled.div`
  grid-area: toggle;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
`;

export const RateGroup = styled.div`
  grid-area: rates;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  button {
    min-width: 36px;
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    font-size: 12px;
    cursor: pointer;

    &.active {
      background: #111827;
      color: #fff;
      border-color: #111827;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }
`;

export const SaveButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-weight: 600;
  font-size: 14px;

  &:active {
    transform: scale(0.98);
  }
`;

export const MenuCardGrid = styled(RewardGrid)``;

export const MenuCard = styled.div`
  min-width: 0;
  padding: 14px;
  border-radius: 14px;
  background: #f9fafb;
  display: grid;
  row-gap: 10px;
`;

export const MenuCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
`;

export const MenuControlRow = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

export const GalleryRewardCard = styled(RewardCard)`
  grid-template-areas:
    'title toggle'
    'rates rates'
    'threshold threshold';
`;

export const ThresholdRow = styled.div`
  grid-area: threshold;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
`;

export const ThresholdInput = styled.input`
  width: 64px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 12px;
  text-align: center;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;
