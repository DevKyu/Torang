import styled from '@emotion/styled';
import {
  Backdrop,
  Card,
  RoleTag,
  MissionTitle,
  Divider,
  CloseBtn,
} from './HiddenMissionModalStyle';
import { Empty } from './VoteResultModalStyle';

export { Backdrop, Card, RoleTag, MissionTitle, Divider, CloseBtn, Empty };

export const CHEER_COLOR = '#d97706';

export const MessageScrollArea = styled.div`
  margin: 0 24px 20px;
  max-height: 50vh;
  max-height: 50dvh;
  overflow-y: auto;
  touch-action: pan-y;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const CheerItem = styled.div`
  background: #fffbeb;
  border-radius: 10px;
  padding: 11px 14px;
  text-align: left;
`;

export const CheerSender = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${CHEER_COLOR};
  margin-bottom: 3px;
`;

export const CheerText = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-word;
`;
