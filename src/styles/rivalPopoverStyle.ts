import styled from '@emotion/styled';

export const POPOVER_STYLE: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '8px 12px',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
  fontSize: '0.85rem',
  color: '#333',
  whiteSpace: 'nowrap',
  border: '1px solid #e5e7eb',
  zIndex: 100,
  letterSpacing: '-0.01em',
  maxWidth: '220px',
  lineHeight: 1.5,
};

export const NameTrigger = styled.button`
  appearance: none;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;

  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;

  color: #111827;
  max-width: 100%;

  &:hover {
    text-decoration: underline;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    text-decoration: none;
  }

  &[data-selected='true'] .name {
    font-weight: 700;
    background-image: linear-gradient(
      to top,
      rgba(254, 249, 195, 0.95),
      rgba(254, 249, 195, 0.95) var(--hl-thickness, 0.6em),
      transparent var(--hl-thickness, 0.6em)
    );
    background-repeat: no-repeat;
    background-size: 100% calc(var(--hl-thickness, 0.6em) + 0.05em);
    background-position: 0 95%;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 2px;
`;

export const Label = styled.span`
  font-size: 0.86rem;
  color: #374151;
`;

export const Value = styled.span`
  font-size: 0.86rem;
  font-weight: 700;
  color: #111827;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
`;

const BaseButton = styled.button`
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid #e5e7eb;
  transition:
    transform 0.05s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
  &:active {
    transform: translateY(1px);
  }
`;

export const PrimaryButton = styled(BaseButton)`
  background: #fef9c3;
  border-color: #fde68a;
  color: #92400e;
  &:hover {
    background: #fef3c7;
  }
`;

export const SubtleButton = styled(BaseButton)`
  background: #f3f4f6;
  color: #111827;
  &:hover {
    background: #e5e7eb;
  }
`;
