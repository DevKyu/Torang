import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const layer = `
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
`;

export const Dim = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.54);
  z-index: 20000;

  pointer-events: auto;
  touch-action: none;
  user-select: none;
  overflow: hidden;

  ${layer}
`;

export const Sheet = styled(motion.div)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;

  width: 100%;
  min-height: 320px;
  max-height: 420px;

  background: #fff;
  border-radius: 18px 18px 0 0;
  z-index: 20001;

  display: flex;
  flex-direction: column;
  box-shadow: 0 -6px 14px rgba(0, 0, 0, 0.16);

  touch-action: none;
  user-select: none;

  will-change: transform;
  ${layer}
`;

export const DragZone = styled.div`
  width: 100%;
  touch-action: none;
  user-select: none;
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
    -webkit-tap-highlight-color: transparent;
  }
`;

export const Title = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #222;
`;

export const SheetBody = styled.div`
  position: relative;
  flex: 1;
  padding: 6px 18px calc(env(safe-area-inset-bottom, 0px) + 24px);

  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;

  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const fadeIn = `
  opacity: 0;
  transform: translateY(4px);
  animation: commentFadeIn 0.22s ease-out forwards;

  @keyframes commentFadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const CommentItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 2px 0;

  ${fadeIn}

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
    gap: 4px;

    .heart {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;

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
      -webkit-tap-highlight-color: transparent;
    }

    .delBtn:active {
      opacity: 0.6;
      transform: scale(0.94);
    }
  }
`;

export const ReplyItem = styled.div`
  margin-left: 18px;
  display: flex;
  gap: 8px;

  ${fadeIn}

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
    gap: 4px;

    .heart {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;

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
      -webkit-tap-highlight-color: transparent;
    }

    .delBtn:active {
      opacity: 0.6;
      transform: scale(0.94);
    }
  }
`;

export const InputWrap = styled.div`
  padding: 14px 16px calc(env(safe-area-inset-bottom, 0px) + 10px);
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
    -webkit-tap-highlight-color: transparent;
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
    -webkit-tap-highlight-color: transparent;
  }
`;

export const EmptyState = styled(motion.div)`
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #777;
  font-size: 14px;
  text-align: center;
  pointer-events: none;
  z-index: 10;
`;

export const SafeBottom = styled.div`
  height: calc(env(safe-area-inset-bottom, 0px) + 10px);
`;
