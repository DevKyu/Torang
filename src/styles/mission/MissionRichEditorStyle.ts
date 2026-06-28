import styled from '@emotion/styled';

export const Wrapper = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
`;

export const ToolBtn = styled.button<{ active: boolean }>`
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: ${({ active }) => (active ? '#e5e7eb' : 'transparent')};
  color: ${({ active }) => (active ? '#111827' : '#6b7280')};
  font-size: 13px;
  cursor: pointer;
  touch-action: manipulation;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: #e5e7eb; color: #111827; }
  }
`;

export const ToolDivider = styled.div`
  width: 1px;
  height: 18px;
  background: #e5e7eb;
  margin: 0 4px;
`;

export const ColorBtn = styled.button<{ color: string; active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${({ active }) => (active ? '#111827' : 'transparent')};
  background: ${({ color }) => color || '#e5e7eb'};
  cursor: pointer;
  touch-action: manipulation;
  flex-shrink: 0;
  outline: ${({ active, color }) => active && !color ? '2px solid #6b7280' : 'none'};
  outline-offset: 1px;
`;

export const EditorArea = styled.div`
  position: relative;

  &.is-empty::before {
    content: attr(data-placeholder);
    position: absolute;
    top: 8px;
    left: 10px;
    color: #9ca3af;
    font-size: 13px;
    pointer-events: none;
  }

  .ProseMirror {
    outline: none;
    padding: 8px 10px;
    min-height: 80px;
    font-size: 13px;
    line-height: 1.65;
    user-select: text;

    p { margin: 0 0 2px; }
    p:last-child { margin-bottom: 0; }
    strong { font-weight: 700; }
    em { font-style: italic; }
    u { text-decoration: underline; }
  }
`;
