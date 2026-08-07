import * as Dialog from '@radix-ui/react-dialog';
import styled from '@emotion/styled';

export const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(0 0 0 / 0.5);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  animation: fadeIn 0.18s ease-out forwards;
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const Content = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.96);
  width: 90%;
  max-width: 320px;
  padding: 24px 20px 20px;
  background: #fff;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0 0 0 / 0.15);
  animation: pop 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  @keyframes pop {
    to {
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

export const Heading = styled.h3`
  font: 600 18px/1.25 sans-serif;
  margin-bottom: 14px;
`;
export const Desc = styled.p`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 18px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border: 1px solid #d0d7e2;
  border-radius: 10px;
  margin-bottom: 18px;
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

export const SaveBtn = styled.button`
  width: 100%;
  padding: 10px 0;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: #fff;
  font: 600 15px/1 sans-serif;
  cursor: pointer;
  transition: background 0.15s;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #2563eb;
    }
  }
`;
export const CloseBtn = styled(Dialog.Close)`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
`;
