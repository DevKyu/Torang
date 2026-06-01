import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { auth, empIdFromEmail } from '../services/firebase';
import Layout from './layouts/Layout';
import { SmallText } from '../styles/commonStyle';
import MonthNavigator from './activity/MonthNavigator';
import { useTeamFormation } from '../hooks/useTeamFormation';
import { useRivalEmpIds } from '../hooks/useRivalEmpIds';
import { calcGroupDiff, diffLevel } from '../utils/teamFormation';
import { useUiStore } from '../stores/useUiStore';
import {
  ContentArea,
  LoadingBox,
  PendingBox,
  PendingIcon,
  PendingTitle,
  PendingDesc,
  GroupTabs,
  GroupTab,
  GroupCard,
  GroupHeader,
  GroupTitle,
  ResultBadge,
  DiffChip,
  TeamsGrid,
  TeamCard,
  TeamLabel,
  WinnerIcon,
  PlayersWrapper,
  PlayerRow,
  PlayerName,
  PlayerAvg,
  NameGroup,
  GuestBadge,
  RivalBadge,
  FadeSpan,
} from '../styles/TeamFormationStyle';

const MIN_YM = '202507';
const GRID_MIN_HEIGHT = 172;
const PENDING_MIN_HEIGHT = 220;

const TeamFormation = () => {
  const navigate = useNavigate();

  const currentYm = useMemo(() => {
    const now = useUiStore.getState().getServerNow();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    return `${y}${String(m).padStart(2, '0')}`;
  }, []);

  const [ym, setYm] = useState(currentYm);
  const { status, groups, winnerMap, scoreMap, loading, isLegacy, error } =
    useTeamFormation(ym);
  const rivalIds = useRivalEmpIds(ym);

  const myEmpId = empIdFromEmail(auth.currentUser?.email);
  const isConfirmed = status === 'confirmed';

  const [activeIdx, setActiveIdx] = useState(0);
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    setOpenKey(null);
  }, [ym]);

  const handleYmChange = useCallback((next: string) => {
    setYm(next);
    setActiveIdx(0);
  }, []);

  const toggleScore = useCallback((key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  }, []);

  const handleTabClick = useCallback((idx: number) => {
    setActiveIdx(idx);
    setOpenKey(null);
  }, []);

  const stableMinHeightRef = useRef<number | undefined>(undefined);
  const confirmedMinHeight =
    isConfirmed && groups.length > 0
      ? (groups.length > 1 ? 48 : 0) + 40 + GRID_MIN_HEIGHT
      : undefined;
  if (confirmedMinHeight !== undefined) {
    stableMinHeightRef.current = confirmedMinHeight;
  }
  const contentMinHeight = isConfirmed
    ? (confirmedMinHeight ?? stableMinHeightRef.current ?? PENDING_MIN_HEIGHT)
    : loading
      ? (stableMinHeightRef.current ?? PENDING_MIN_HEIGHT)
      : PENDING_MIN_HEIGHT;

  const safeIdx = Math.min(activeIdx, Math.max(0, groups.length - 1));
  const activeGroup = groups[safeIdx];
  const activeGroupId = String.fromCharCode(65 + safeIdx);
  const winner = winnerMap[activeGroupId];
  const groupDiff = activeGroup ? calcGroupDiff(activeGroup) : 0;

  const resultType =
    winner === 'team1'
      ? 'team1Win'
      : winner === 'team2'
        ? 'team2Win'
        : winner === 'draw'
          ? 'draw'
          : 'none';

  const getTeamState = (teamNum: '1' | '2') => {
    if (!winner) return 'pending';
    if (winner === 'draw') return 'draw';
    return (winner === 'team1') === (teamNum === '1') ? 'winner' : 'loser';
  };

  return (
    <Layout title="팀 편성">
      <MonthNavigator
        ym={ym}
        minYm={MIN_YM}
        maxYm={currentYm}
        onChange={handleYmChange}
      />

      <ContentArea style={{ minHeight: contentMinHeight }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ flex: 1 }}
            >
              <LoadingBox>
                <ClipLoader size={24} color="#9ca3af" />
              </LoadingBox>
            </motion.div>
          ) : !isConfirmed ? (
            <motion.div
              key={`pending-${ym}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1 }}
            >
              <PendingBox>
                <PendingIcon>{error ? '⚠️' : '🎳'}</PendingIcon>
                <PendingTitle>
                  {error ? '데이터를 불러오지 못했어요' : '팀 편성 준비중'}
                </PendingTitle>
                <PendingDesc>
                  {error
                    ? '잠시 후 다시 시도해 주세요'
                    : '완료되면 바로 공개될 예정이에요'}
                </PendingDesc>
              </PendingBox>
            </motion.div>
          ) : (
            <motion.div
              key={`confirmed-${ym}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {groups.length > 1 && (
                <GroupTabs>
                  {groups.map((_, idx) => (
                    <GroupTab
                      key={idx}
                      active={safeIdx === idx}
                      onClick={() => handleTabClick(idx)}
                    >
                      {String.fromCharCode(65 + idx)}조
                    </GroupTab>
                  ))}
                </GroupTabs>
              )}

              {activeGroup && (
                <GroupCard
                  key={activeGroupId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <GroupHeader>
                    <GroupTitle>{activeGroupId}조</GroupTitle>
                    {resultType !== 'none' ? (
                      <ResultBadge result={resultType}>
                        {resultType === 'team1Win'
                          ? '1팀 승'
                          : resultType === 'team2Win'
                            ? '2팀 승'
                            : '무승부'}
                      </ResultBadge>
                    ) : !isLegacy ? (
                      <DiffChip level={diffLevel(groupDiff)}>
                        전력차 {groupDiff}점
                      </DiffChip>
                    ) : null}
                  </GroupHeader>

                  <TeamsGrid style={{ minHeight: GRID_MIN_HEIGHT }}>
                    {(['1', '2'] as const).map((teamNum) => {
                      const teamKey = teamNum === '1' ? 'team1' : 'team2';
                      const teamScores = scoreMap[activeGroupId]?.[teamKey];
                      const players = [...activeGroup[teamKey]].sort((a, b) => {
                        const sa = teamScores?.[a.empId];
                        const sb = teamScores?.[b.empId];
                        const va =
                          sa && (sa[0] > 0 || sa[1] > 0)
                            ? sa[1] || sa[0]
                            : a.average;
                        const vb =
                          sb && (sb[0] > 0 || sb[1] > 0)
                            ? sb[1] || sb[0]
                            : b.average;
                        return vb - va;
                      });
                      const state = getTeamState(teamNum);
                      const isWinner = state === 'winner';
                      const isLoser = state === 'loser';

                      return (
                        <TeamCard key={teamNum} team={teamNum} state={state}>
                          <TeamLabel team={teamNum} state={state}>
                            {teamNum}팀{isWinner && <WinnerIcon>👑</WinnerIcon>}
                          </TeamLabel>
                          <PlayersWrapper>
                            {players.map((p) => {
                              const isMe = p.empId === myEmpId;
                              const rowKey = `${activeGroupId}-${teamNum}-${p.empId}`;
                              const isOpen = openKey === rowKey;
                              const scores = teamScores?.[p.empId];
                              const hasScores =
                                scores && (scores[0] > 0 || scores[1] > 0);

                              return (
                                <PlayerRow
                                  key={p.empId}
                                  isMe={isMe}
                                  clickable={hasScores}
                                  onClick={
                                    hasScores
                                      ? () => toggleScore(rowKey)
                                      : undefined
                                  }
                                >
                                  <NameGroup>
                                    <PlayerName isMe={isMe} loser={isLoser}>
                                      {p.name}
                                    </PlayerName>
                                    {rivalIds.has(p.empId) && (
                                      <RivalBadge>⚔️</RivalBadge>
                                    )}
                                    {p.empId.startsWith('guest_') && (
                                      <GuestBadge>G</GuestBadge>
                                    )}
                                  </NameGroup>

                                  {isOpen && hasScores ? (
                                    <FadeSpan key="detail">
                                      <PlayerAvg
                                        loser={isLoser}
                                        isMe={isMe}
                                        detail
                                      >
                                        {scores[0] || '–'}&thinsp;·&thinsp;{scores[1] || '–'}
                                      </PlayerAvg>
                                    </FadeSpan>
                                  ) : p.average > 0 ? (
                                    <FadeSpan key="avg">
                                      <PlayerAvg loser={isLoser} isMe={isMe}>
                                        {p.average}점
                                      </PlayerAvg>
                                    </FadeSpan>
                                  ) : null}
                                </PlayerRow>
                              );
                            })}
                          </PlayersWrapper>
                        </TeamCard>
                      );
                    })}
                  </TeamsGrid>
                </GroupCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ContentArea>

      <SmallText
        top="middle"
        onClick={() => navigate('/menu', { replace: true })}
      >
        돌아가기
      </SmallText>
    </Layout>
  );
};

export default TeamFormation;
