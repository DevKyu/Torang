import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const gpu = `
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, opacity;
`;

export const Dim = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.54);
  z-index: 20000;
  pointer-events: auto;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  ${gpu}
`;

export const Sheet = styled(motion.div)`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 55vh;
  max-height: 55vh;
  background: #fff;
  border-radius: 18px 18px 0 0;
  z-index: 20001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -6px 14px rgba(0, 0, 0, 0.16);
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  overscroll-behavior: none;
  ${gpu}
`;

export const DragZone = styled(motion.div)`
  width: 100%;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  ${gpu}
`;

export const HandleBar = styled.div`
  width: 40px;
  height: 5px;
  background: rgba(0, 0, 0, 0.28);
  border-radius: 3px;
  margin: 12px auto 8px;
`;

export const SheetHeader = styled.div`
  padding: 4px 18px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .close {
    width: 24px;
    height: 24px;
    color: #333;
    cursor: pointer;
  }
`;

export const Title = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #222;
`;

export const SheetBody = styled.div`
  flex: 1;
  padding: 6px 18px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const CommentItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 6px;

  .row1 {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .name {
    font-size: 13px;
    font-weight: 600;
    color: #333;
  }

  .time {
    font-size: 11px;
    color: #999;
  }

  .text {
    font-size: 14px;
    color: #444;
    line-height: 1.48;
    word-break: break-word;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .heart {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;

      &.on {
        color: #e63946;
      }

      span {
        font-size: 12px;
        min-width: 10px;
      }
    }

    .replyBtn,
    .delBtn {
      border: none;
      background: none;
      font-size: 12px;
      color: #666;
      cursor: pointer;
    }
  }
`;

export const ReplyItem = styled(motion.div)`
  margin-left: 22px;
  display: flex;
  gap: 8px;

  .inner {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .name {
    font-size: 13px;
    font-weight: 600;
    color: #333;
  }

  .time {
    font-size: 11px;
    color: #999;
  }

  .text {
    font-size: 13px;
    color: #444;
    line-height: 1.48;
    word-break: break-word;
  }

  .actions {
    display: flex;
    gap: 8px;

    .heart {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;

      &.on {
        color: #e63946;
      }

      span {
        font-size: 12px;
      }
    }

    .delBtn {
      border: none;
      background: none;
      font-size: 12px;
      color: #666;
      cursor: pointer;
    }
  }
`;

export const InputWrap = styled.div`
  padding: 14px 16px 10px;
  background: #fff;
  border-top: 1px solid #eee;
`;

export const ReplyNotice = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 14px 10px;
  font-size: 12px;
  color: #555;

  button {
    border: none;
    background: none;
    font-size: 12px;
    color: #777;
    cursor: pointer;
  }
`;

export const InputBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f2f2f4;
  border-radius: 14px;
  padding: 12px 16px;

  input {
    flex: 1;
    font-size: 14px;
    border: none;
    background: none;
    outline: none;
  }

  .send {
    cursor: pointer;
    width: 24px;
    height: 24px;
    color: #444;
  }
`;

export const SafeBottom = styled.div`
  height: calc(env(safe-area-inset-bottom, 0px) + 10px);
`;
