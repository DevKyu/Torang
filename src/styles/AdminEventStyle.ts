import styled from '@emotion/styled';

export const Section = styled.section`
  margin-bottom: 28px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
`;

export const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(90px, 1fr) 60px 80px 56px;
  gap: 8px;
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
    margin-bottom: 10px;
    background: #f9fafb;
    border-radius: 10px;
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
  min-width: 0;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
`;

export const BadgeSelect = styled.select`
  width: 100%;
  min-width: 0;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
`;

export const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;

  @media (max-width: 420px) {
    margin-top: 6px;
  }
`;

export const MonthSelect = styled.select`
  width: auto;
  max-width: 140px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #ddd;
  font-size: 12px;
  background: #fff;
`;

export const RewardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
`;

export const RewardItem = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f3f4f6;
  }
`;

export const SaveButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  transition:
    transform 0.08s ease,
    opacity 0.2s;

  &:active {
    transform: scale(0.98);
  }
`;

export const RewardActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
`;

export const BulkRewardButton = styled.button`
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 999px;
  border: none;
  background: #111827;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover {
    background: #374151;
  }
`;
