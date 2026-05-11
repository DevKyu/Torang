import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const PageWrap = styled.div`
  display: flex;
  flex-direction: column;

  gap: 14px;

  height: calc(100vh - 130px);

  min-height: 0;
`;

export const TopSection = styled.div`
  display: flex;
  flex-direction: column;

  gap: 12px;

  flex-shrink: 0;
`;

export const SearchRow = styled.div`
  display: flex;

  gap: 10px;
`;

export const MonthSelect = styled.select`
  flex-shrink: 0;

  width: 118px;
  height: 46px;

  padding: 0 12px;

  border-radius: 14px;
  border: 1px solid #ece7df;

  background: rgba(255, 255, 255, 0.88);

  font-size: 0.84rem;
  font-weight: 600;

  color: #444;

  outline: none;

  backdrop-filter: blur(10px);

  transition: 0.18s ease;

  &:focus {
    border-color: #d6b089;
    background: white;
  }
`;

export const SearchInput = styled.input`
  flex: 1;

  min-width: 0;

  height: 46px;

  padding: 0 15px;

  border-radius: 14px;
  border: 1px solid #ece7df;

  background: rgba(255, 255, 255, 0.88);

  font-size: 0.9rem;

  color: #333;

  outline: none;

  backdrop-filter: blur(10px);

  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    border-color: #d6b089;

    background: white;

    box-shadow: 0 0 0 4px rgba(214, 176, 137, 0.12);
  }
`;

export const SummarySection = styled.div`
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 10px;
`;

export const SummaryCard = styled.div<{
  active?: boolean;
}>`
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  height: 72px;

  border-radius: 18px;

  border: 1px solid #ece7df;

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(250, 248, 244, 0.96) 100%
  );

  backdrop-filter: blur(10px);

  transition: 0.18s ease;

  ${({ active }) =>
    active &&
    css`
      border-color: #d6b089;

      box-shadow: 0 8px 20px rgba(214, 176, 137, 0.14);
    `}
`;

export const SummaryValue = styled.div`
  font-size: 0.95rem;
  font-weight: 800;

  color: #2f2f2f;
`;

export const SummaryLabel = styled.div`
  margin-top: 5px;

  font-size: 0.72rem;
  font-weight: 600;

  color: #8d8d8d;
`;

export const FilterSection = styled.div`
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 8px;
`;

export const FilterButton = styled.button`
  height: 40px;

  border-radius: 12px;
  border: 1px solid #ece7df;

  background: rgba(255, 255, 255, 0.92);

  font-size: 0.79rem;
  font-weight: 700;

  color: #5c5c5c;

  cursor: pointer;

  transition:
    transform 0.1s ease,
    background 0.18s ease,
    border-color 0.18s ease;

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    border-color: #dcc0a1;
    background: #fffaf4;
  }
`;

export const ListSection = styled.div`
  flex: 1;

  min-height: 0;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  border-radius: 22px;

  border: 1px solid #ece7df;

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(248, 245, 241, 0.97) 100%
  );

  backdrop-filter: blur(14px);

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
`;

export const ListHeader = styled.div`
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  min-height: 52px;

  padding: 0 16px;

  border-bottom: 1px solid rgba(236, 231, 223, 0.9);
`;

export const ListCount = styled.div`
  font-size: 0.82rem;
  font-weight: 800;

  color: #5b5b5b;
`;

export const ListSubText = styled.div`
  font-size: 0.72rem;
  font-weight: 600;

  color: #a0a0a0;
`;

export const UserList = styled.div`
  flex: 1;

  overflow-y: auto;

  padding: 10px;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const UserRow = styled.button<{
  checked?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  min-height: 62px;

  padding: 12px 14px;

  border: 1px solid
    ${({ checked }) => (checked ? '#d6b089' : 'rgba(235, 235, 235, 0.95)')};

  border-radius: 16px;

  background: ${({ checked }) =>
    checked
      ? 'linear-gradient(180deg, #fffaf3 0%, #fff4e8 100%)'
      : 'rgba(255,255,255,0.88)'};

  cursor: pointer;

  transition:
    transform 0.1s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;

  &:not(:last-of-type) {
    margin-bottom: 8px;
  }

  &:active {
    transform: scale(0.992);
  }

  ${({ checked }) =>
    checked &&
    css`
      box-shadow: 0 8px 20px rgba(214, 176, 137, 0.12);
    `}
`;

export const UserInfoWrap = styled.div`
  display: flex;
  flex-direction: column;

  align-items: flex-start;

  min-width: 0;
`;

export const UserName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.93rem;
  font-weight: 800;

  color: #262626;
`;

export const UserMeta = styled.div`
  display: flex;
  align-items: center;

  gap: 7px;

  margin-top: 5px;

  font-size: 0.73rem;
  font-weight: 600;

  color: #969696;
`;

export const UserTypeBadge = styled.div<{
  member?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 20px;

  padding: 0 8px;

  border-radius: 999px;

  background: ${({ member }) =>
    member ? 'rgba(93, 135, 255, 0.12)' : 'rgba(214, 176, 137, 0.14)'};

  color: ${({ member }) => (member ? '#5471d8' : '#b17837')};

  font-size: 0.68rem;
  font-weight: 700;
`;

export const CheckCircle = styled.div<{
  checked?: boolean;
}>`
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  margin-left: 12px;

  border-radius: 999px;

  border: 1.5px solid ${({ checked }) => (checked ? '#d6b089' : '#d6d6d6')};

  background: ${({ checked }) => (checked ? '#d6b089' : 'white')};

  color: white;

  font-size: 0.74rem;
  font-weight: 800;

  transition: 0.15s ease;
`;

export const BottomSection = styled.div`
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  gap: 8px;
`;

export const SaveButton = styled.button`
  width: 100%;

  height: 52px;

  border: none;
  border-radius: 18px;

  background: linear-gradient(135deg, #2f3645 0%, #1f2937 100%);

  color: white;

  font-size: 0.93rem;
  font-weight: 800;

  letter-spacing: -0.01em;

  cursor: pointer;

  transition:
    opacity 0.18s ease,
    transform 0.1s ease,
    box-shadow 0.18s ease;

  box-shadow: 0 12px 24px rgba(31, 41, 55, 0.16);

  &:disabled {
    opacity: 0.42;

    cursor: default;

    box-shadow: none;
  }

  &:active:not(:disabled) {
    transform: scale(0.992);
  }
`;

export const EmptyText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 100%;

  font-size: 0.9rem;
  font-weight: 600;

  color: #9d9d9d;
`;
