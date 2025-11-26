import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const gpu = `
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: opacity, transform;
`;

export const Dim = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9998;
  pointer-events: auto;
  ${gpu};
`;

export const Sheet = styled(motion.div)`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 55vh;
  max-height: 55vh;
  background: #fff;
  border-radius: 18px 18px 0 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -6px 14px rgba(0, 0, 0, 0.16);
  mask-image: radial-gradient(white, black);
  ${gpu};
`;

export const SheetHeader = styled.div`
  padding: 16px 18px 14px;
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
  padding: 6px 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  touch-action: pan-y;

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
    align-items: center;
    gap: 6px;

    .name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    .time {
      font-size: 11px;
      color: #999;
    }
  }

  .text {
    font-size: 14px;
    color: #444;
    line-height: 1.45;
    white-space: pre-wrap;
  }

  .actions {
    display: flex;
    align-items: center;
    min-height: 20px;

    .heart {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      color: #aaa;

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
      background: none;
      border: none;
      color: #666;
      font-size: 12px;
      padding: 2px 4px;
      border-radius: 4px;
      cursor: pointer;

      &:active {
        opacity: 0.6;
      }
    }
  }
`;

export const ReplyItem = styled(motion.div)`
  margin-top: 2px;
  margin-left: 20px;
  padding-left: 4px;
  display: flex;
  gap: 8px;

  .inner {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .row1 {
      display: flex;
      align-items: center;
      gap: 6px;

      .name {
        font-size: 13px;
        font-weight: 600;
        color: #333;
      }

      .time {
        font-size: 11px;
        color: #999;
      }
    }

    .text {
      font-size: 13px;
      color: #444;
      line-height: 1.45;
      white-space: pre-wrap;
    }

    .actions {
      display: flex;
      align-items: center;

      .heart {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        color: #aaa;

        &.on {
          color: #e63946;
        }

        span {
          font-size: 12px;
          min-width: 10px;
        }
      }

      .delBtn {
        background: none;
        border: none;
        color: #666;
        font-size: 12px;
        padding: 2px 4px;
        border-radius: 4px;
        cursor: pointer;

        &:active {
          opacity: 0.6;
        }
      }
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
    background: none;
    border: none;
    font-size: 12px;
    color: #777;
    padding: 2px 6px;
    border-radius: 4px;
    cursor: pointer;

    &:active {
      opacity: 0.6;
    }
  }
`;

export const InputBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f3f5;
  border-radius: 14px;
  padding: 12px 16px;

  input {
    flex: 1;
    border: none;
    outline: none;
    background: none;
    font-size: 14px;
    color: #222;
    line-height: 1.44;
  }

  .send {
    width: 24px;
    height: 24px;
    color: #444;
    cursor: pointer;

    &:active {
      opacity: 0.6;
    }
  }
`;

export const SafeBottom = styled.div`
  height: calc(env(safe-area-inset-bottom, 0px) + 10px);
`;
