import styled from '@emotion/styled';

export const Section = styled.section`
  margin-bottom: 24px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
`;

export const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 72px 88px 64px;
  gap: 8px 10px;
  align-items: center;

  @media (max-width: 420px) {
    display: block;
  }
`;

export const MenuHeader = styled.div`
  font-size: 12px;
  color: #6b7280;

  @media (max-width: 420px) {
    display: none;
  }
`;

export const MenuRow = styled.div`
  display: contents;

  @media (max-width: 420px) {
    display: block;
    padding: 12px;
    margin-bottom: 12px;
    background: #f9fafb;
    border-radius: 12px;
  }
`;

export const MenuName = styled.div`
  font-weight: 600;

  @media (max-width: 420px) {
    margin-bottom: 8px;
  }
`;

export const OrderInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 12px;
`;

export const BadgeSelect = styled.select`
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 12px;
`;

export const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
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

  &:hover {
    background: #374151;
  }
`;

export const RewardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
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
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-weight: 600;
  font-size: 15px;

  &:active {
    transform: scale(0.98);
  }
`;
