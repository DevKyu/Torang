import styled from '@emotion/styled';

export const DevNotice = styled.div`
  font-size: 12.5px;
  line-height: 1.6;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 20px;
`;

export const DevPreviewFrame = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 14px;
  padding: 20px 16px;
  background: #fff;
`;

export const DevFloatingBar = styled.div`
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 20px;
  background: #111827;
  color: #fde68a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

export const DevFloatingLink = styled.button`
  font: inherit;
  color: #93c5fd;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  touch-action: manipulation;
`;
