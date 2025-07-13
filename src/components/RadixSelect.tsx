import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import styled from '@emotion/styled';
import isPropValid from '@emotion/is-prop-valid';

const COLOR = {
  border: '#d0d7e2',
  bg: '#fff',
  hover: '#f1f5fb',
  active: '#e4ecf7',
  brand: '#3b82f6',
  text: '#0f172a',
  subtle: '#475569',
};
const RADIUS = 10;

const Trigger = styled(Select.Trigger, {
  shouldForwardProp: (prop) =>
    isPropValid(prop) && prop !== '$center' && prop !== '$minw',
})<{ $center?: boolean; $minw?: number }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: ${({ $minw = 84 }) => $minw}px;
  padding: 6px 32px 6px 12px;
  border: 1px solid ${COLOR.border};
  border-radius: ${RADIUS}px;
  background: ${COLOR.bg};
  font-size: 14px;
  color: ${COLOR.text};
  ${({ $center }) => $center && 'justify-content:center;'}
  transition: background .15s, border-color .15s;

  &:hover {
    background: ${COLOR.hover};
  }
  &[data-state='open'] {
    background: ${COLOR.active};
  }
  &:focus-visible {
    outline: 2px solid ${COLOR.brand};
    outline-offset: 2px;
  }
`;

const ChevronIcon = styled(ChevronDown)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${COLOR.subtle};
`;

const Content = styled(Select.Content)`
  border: 1px solid ${COLOR.border};
  background: ${COLOR.bg};
  border-radius: ${RADIUS}px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
`;

const Item = styled(Select.Item)`
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 40px;
  font-size: 14px;
  color: ${COLOR.text};
  cursor: pointer;
  user-select: none;
  &[data-highlighted] {
    background: ${COLOR.hover};
  }
  &[data-state='checked'] {
    font-weight: 600;
  }
`;

const CheckIcon = styled(Select.ItemIndicator)`
  position: absolute;
  left: 12px;
  color: ${COLOR.brand};
`;

export type RadixSelectProps = {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  minWidth?: number;
  center?: boolean;
};

const RadixSelect = ({
  value,
  options,
  onChange,
  minWidth = 84,
  center = false,
}: RadixSelectProps) => (
  <Select.Root value={value} onValueChange={onChange}>
    <Trigger $center={center} $minw={minWidth}>
      <Select.Value aria-label={value}>{value}</Select.Value>
      <ChevronIcon size={16} />
    </Trigger>

    <Select.Portal>
      <Content position="popper" sideOffset={4}>
        <Select.Viewport>
          {options.map((opt) => (
            <Item key={opt} value={opt}>
              <Select.ItemText>{opt}</Select.ItemText>
              <CheckIcon asChild>
                <Check size={14} />
              </CheckIcon>
            </Item>
          ))}
        </Select.Viewport>
      </Content>
    </Select.Portal>
  </Select.Root>
);

export default RadixSelect;
