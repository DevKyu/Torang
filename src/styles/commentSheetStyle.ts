import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Dim = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: black;
  z-index: 9998;
`;

export const Sheet = styled(motion.div)`
  position: fixed;
  bottom: 0;
  width: 100%;
  max-height: 72vh;

  background: white;
  border-radius: 18px 18px 0 0;
  z-index: 9999;

  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const SheetHeader = styled.div`
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .close {
    width: 24px;
    height: 24px;
    color: #555;
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
  overflow-y: auto;
  padding: 6px 18px 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const CommentItem = styled(motion.div)`
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
    margin-top: 2px;
    font-size: 14px;
    color: #444;
    line-height: 1.35;
  }

  .actions {
    margin-top: 6px;
    display: flex;
    gap: 14px;
    align-items: center;

    .heart {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #aaa;
      cursor: pointer;

      &.on {
        color: #e63946;
      }

      span {
        font-size: 12px;
      }
    }

    .replyBtn,
    .delBtn {
      background: none;
      border: none;
      color: #666;
      font-size: 11px;
      cursor: pointer;
      padding: 0;
    }
  }
`;

export const ReplyItem = styled(motion.div)`
  margin-left: 24px;
  margin-top: 14px;
  padding-bottom: 4px;

  display: flex;
  gap: 8px;

  .inner {
    display: flex;
    flex-direction: column;
    gap: 3px;

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
      line-height: 1.32;
      color: #444;
    }

    .actions {
      margin-top: 6px;
      display: flex;
      gap: 14px;
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
        }
      }

      .delBtn {
        background: none;
        border: none;
        color: #666;
        font-size: 11px;
        cursor: pointer;
        padding: 0;
      }
    }
  }
`;

export const InputWrap = styled.div`
  border-top: 1px solid #eee;
  background: white;
`;

export const ReplyNotice = styled.div`
  padding: 6px 14px;
  font-size: 12px;
  color: #555;
  display: flex;
  justify-content: space-between;

  button {
    background: none;
    border: none;
    font-size: 12px;
    color: #777;
    cursor: pointer;
  }
`;

export const InputBox = styled.div`
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;

  input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 18px;
    padding: 10px 14px;
    font-size: 14px;
    outline: none;
    background: #f7f7f7;
  }

  .send {
    width: 24px;
    height: 24px;
    color: #444;
    cursor: pointer;
  }
`;

export const SafeBottom = styled.div`
  height: env(safe-area-inset-bottom, 10px);
`;
