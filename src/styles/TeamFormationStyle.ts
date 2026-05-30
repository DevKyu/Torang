import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { motion } from 'framer-motion'

export const ContentArea = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
`

export const LoadingBox = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
`

export const PendingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 0 32px;
  gap: 6px;
  text-align: center;
`

export const PendingIcon = styled.div`
  font-size: 38px;
  line-height: 1;
  margin-bottom: 6px;
`

export const PendingTitle = styled.p`
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: #374151;
  margin: 0;
  white-space: nowrap;
`

export const PendingDesc = styled.p`
  font-size: 13px;
  line-height: 1.4;
  color: #9ca3af;
  margin: 0;
  white-space: nowrap;
`

export const GroupTabs = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`

export const GroupTab = styled.button<{ active: boolean }>`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  border: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  transition: background 0.18s, color 0.18s, transform 0.1s;
  background: ${({ active }) => (active ? '#fef9c3' : '#f1f5f9')};
  color: ${({ active }) => (active ? '#92400e' : '#6b7280')};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${({ active }) => (active ? '#fde68a' : '#e2e8f0')};
    }
  }

  &:active {
    transform: scale(0.95);
    background: ${({ active }) => (active ? '#fde68a' : '#e2e8f0')};
  }
`

export const GroupCard = styled(motion.div)`
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`

export const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  user-select: none;
`

export const GroupTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: #111827;
`

type ResultType = 'team1Win' | 'team2Win' | 'draw' | 'none'

const RESULT_STYLE: Record<ResultType, { bg: string; color: string }> = {
  team1Win: { bg: '#dcfce7', color: '#166534' },
  team2Win: { bg: '#dcfce7', color: '#166534' },
  draw:     { bg: '#fef3c7', color: '#92400e' },
  none:     { bg: 'transparent', color: 'transparent' },
}

export const ResultBadge = styled.span<{ result: ResultType }>`
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  padding: 4px 10px;
  border-radius: 99px;
  background: ${({ result }) => RESULT_STYLE[result].bg};
  color: ${({ result }) => RESULT_STYLE[result].color};
  visibility: ${({ result }) => (result === 'none' ? 'hidden' : 'visible')};
`

export const DiffChip = styled.span<{ level: 'low' | 'mid' | 'high' }>`
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  padding: 4px 10px;
  border-radius: 99px;
  ${({ level }) =>
    level === 'low'
      ? 'background: #dcfce7; color: #166534;'
      : level === 'mid'
        ? 'background: #fef3c7; color: #92400e;'
        : 'background: #fee2e2; color: #991b1b;'}
`

export const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`

type TeamState = 'winner' | 'loser' | 'draw' | 'pending'

const PENDING_BG:     Record<'1'|'2', string> = { '1': '#fffbeb', '2': '#eef2ff' }
const PENDING_ACCENT: Record<'1'|'2', string> = { '1': '#fcd34d', '2': '#a5b4fc' }
const PENDING_LABEL:  Record<'1'|'2', string> = { '1': '#92400e', '2': '#4338ca' }

const STATE_BG:     Record<Exclude<TeamState,'pending'>, string> = { winner:'#f0fdf4', loser:'#f9fafb', draw:'#fffbeb' }
const STATE_ACCENT: Record<Exclude<TeamState,'pending'>, string> = { winner:'#10b981', loser:'#e5e7eb', draw:'#f59e0b' }
const STATE_LABEL:  Record<Exclude<TeamState,'pending'>, string> = { winner:'#059669', loser:'#9ca3af', draw:'#b45309' }

export const TeamCard = styled.div<{ team: '1' | '2'; state: TeamState }>`
  padding: 12px;
  display: flex;
  flex-direction: column;
  background: ${({ team, state }) => state === 'pending' ? PENDING_BG[team] : STATE_BG[state]};
  border-top: 3px solid ${({ team, state }) => state === 'pending' ? PENDING_ACCENT[team] : STATE_ACCENT[state]};
  border-left: ${({ team }) => team === '2' ? '1px solid #e5e7eb' : 'none'};
  transition: background 0.25s ease, border-top-color 0.25s ease;
`

export const PlayersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const TeamLabel = styled.div<{ team: '1' | '2'; state: TeamState }>`
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  color: ${({ team, state }) => state === 'pending' ? PENDING_LABEL[team] : STATE_LABEL[state]};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
  transition: color 0.25s ease;
`

export const WinnerIcon = styled.span`
  font-size: 12px;
  line-height: 1;
`

export const PlayerRow = styled.div<{ isMe?: boolean; clickable?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  padding: 3px 5px;
  border-radius: 6px;
  background: ${({ isMe }) => (isMe ? '#fef9c3' : 'transparent')};
  transition: background 0.15s;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  touch-action: ${({ clickable }) => (clickable ? 'manipulation' : 'auto')};
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${({ isMe, clickable }) =>
        clickable ? (isMe ? '#fde68a' : 'rgba(0,0,0,0.04)') : (isMe ? '#fef9c3' : 'transparent')};
    }
  }

  &:active {
    background: ${({ isMe, clickable }) =>
      clickable ? (isMe ? '#fde68a' : 'rgba(0,0,0,0.07)') : (isMe ? '#fef9c3' : 'transparent')};
  }
`

export const PlayerName = styled.span<{ isMe?: boolean; loser?: boolean }>`
  font-size: 13px;
  font-weight: ${({ isMe }) => (isMe ? 700 : 400)};
  line-height: 1.4;
  color: ${({ isMe, loser }) => isMe ? '#92400e' : loser ? '#6b7280' : '#374151'};
`

export const NameGroup = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
`

export const GuestBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  background: #f3f4f6;
  color: #9ca3af;
  flex-shrink: 0;
`

export const RivalBadge = styled.span`
  font-size: 12px;
  line-height: 1;
  flex-shrink: 0;
`

const fadeIn = keyframes`
  from { opacity: 0.6; }
  to   { opacity: 1; }
`

export const FadeSpan = styled.span`
  animation: ${fadeIn} 0.1s ease;
`

export const PlayerAvg = styled.span<{ loser?: boolean; isMe?: boolean; detail?: boolean }>`
  font-size: 12px;
  font-weight: ${({ isMe, detail }) => (isMe || detail ? 600 : 400)};
  line-height: 1.4;
  color: ${({ loser, isMe, detail }) =>
    isMe            ? '#92400e' :
    loser && detail ? '#6b7280' :
    loser           ? '#6b7280' :
    detail          ? '#374151' :
                      '#6b7280'};
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  white-space: nowrap;
  flex-shrink: 0;
`
