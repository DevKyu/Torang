import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { getCurrentUserId, fetchAllUsers } from '../services/firebase';
import { mapUsersToRankingEntries, type Result } from '../utils/ranking';
import { getYearMonth } from '../utils/date';
import { showToast } from '../utils/toast';
import { useLoading } from '../contexts/LoadingContext';

import RankingPopover from './RankingPopover';
import MatchNamePopover from './MatchNamePopover';
import MatchOverlay from './MatchOverlay';
import CongratulationOverlay from './CongratulationOverlay';

import type { RankingEntry, RankingType } from '../types/Ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import type { YearMonth } from '../types/match';

import { Container, Title, SmallText } from '../styles/commonStyle';
import {
  RankingContentBox,
  TableContainer,
  StyledRankingTable,
  FilterTabs,
  RankingTab,
  listVariants,
  itemVariants,
  MotionTableRow,
} from '../styles/rankingStyle';

import {
  RANKING_TYPE_LABELS,
  HEADER_TOAST_MAP,
  EXCLUDED_EMP_IDS,
} from '../constants/ranking';
import { CUR_YEAR, CUR_MONTHN } from '../constants/date';

import { useMatchPickedOverlay } from '../hooks/useMatchPickedOverlay';
import { useMatchResult } from '../hooks/useMatchResult';
import { useMatchIncoming } from '../hooks/useMatchIncoming';
import { useCongratulation } from '../hooks/useCongratulation';
import { useActivityParticipants } from '../hooks/useActivityParticipants';
import { useActivityDates } from '../hooks/useActivityDates';
import { canEditTarget, toYmd } from '../utils/policy';

const RANKING_TABS: RankingType[] = ['monthly', 'quarter', 'year', 'total'];
const MEDALS = ['🥇', '🥈', '🥉'] as const;
const ANIM_DURATION = 0.3;

const HEADER_LABELS: Record<keyof typeof HEADER_TOAST_MAP, string> = {
  rank: '순위',
  name: '이름',
  avg: '평균',
  best: '최고',
  join: '참여',
  pin: '핀',
  league: '리그',
};

const MATCH_TYPE: 'rival' | 'pin' = 'pin';

const Ranking = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { maps: activityAll } = useActivityDates();

  const participantsAll = useActivityParticipants(
    String(CUR_YEAR) as Year,
    String(CUR_MONTHN) as Month,
  );

  const [rankingType, setRankingType] = useState<RankingType>(
    participantsAll.length > 0 ? 'monthly' : 'quarter',
  );
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [myId, setMyId] = useState<string | null>(null);

  const myRowRef = useRef<HTMLTableRowElement>(null);

  const ym: YearMonth = getYearMonth();
  const activityMap = activityAll[String(CUR_YEAR)] ?? {};
  const todayYmd = toYmd(new Date());
  const raw = activityMap[String(CUR_MONTHN)];
  const activityYmd = raw != null ? String(raw) : undefined;
  const timeAllowed = canEditTarget(todayYmd, activityYmd);
  const participants = rankingType === 'monthly' ? participantsAll : undefined;

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      showLoading();
      try {
        const [usersData, currentId] = await Promise.all([
          fetchAllUsers(),
          getCurrentUserId(),
        ]);
        if (cancelled) return;
        setUsers(usersData);
        setMyId(currentId || null);
      } catch {
        if (!cancelled) navigate('/', { replace: true });
      } finally {
        if (!cancelled) hideLoading();
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setRankingType(participantsAll.length > 0 ? 'monthly' : 'quarter');
  }, [participantsAll]);

  const ranking: RankingEntry[] = useMemo(() => {
    if (!Object.keys(users).length) return [];
    return mapUsersToRankingEntries(users, rankingType, participants).filter(
      (entry) => !EXCLUDED_EMP_IDS.includes(entry.empId),
    );
  }, [users, rankingType, participants]);

  useEffect(() => {
    if (!ranking.length) return;
    const id = window.setTimeout(() => {
      requestAnimationFrame(() =>
        myRowRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        }),
      );
    }, 1500);
    return () => window.clearTimeout(id);
  }, [ranking]);

  const meEntry = useMemo(
    () => ranking.find((r) => r.empId === myId),
    [ranking, myId],
  );
  const myLeague = meEntry?.league ?? null;

  const {
    open: vsOpen,
    opponentName: opponent,
    deltaAvg: vsDeltaAvg,
    close: closeVs,
  } = useMatchPickedOverlay({
    rankingType,
    myId,
    ranking,
    enabled: rankingType === 'monthly' && timeAllowed,
    cooldownMs: 1000,
  });

  const matchResults = useMatchResult({
    myId,
    ym,
    type: MATCH_TYPE,
    users,
    activityYmd,
    withinDays: 7,
  });

  const incoming = useMatchIncoming(ym, myId, MATCH_TYPE, users);

  const resultMessages = useMemo(() => {
    if (!matchResults || matchResults.length === 0) return [];
    return matchResults
      .map((res) => {
        if (res.result === 'win') return `${res.opponentName}님을 이겼습니다!`;
        if (res.result === 'lose') return `${res.opponentName}님에게 졌습니다.`;
        if (res.result === 'draw') return `${res.opponentName}님과 무승부!`;
        return '';
      })
      .filter(Boolean);
  }, [matchResults]);

  const hasMatchResults =
    matchResults !== null && matchResults.some((r) => r.result !== 'none');
  const hasIncoming = incoming.length > 0;

  const { show: showCongrats, setShow: setShowCongrats } = useCongratulation({
    condition: matchResults !== null && (hasMatchResults || hasIncoming),
    activityYmd,
    withinDays: 7,
  });

  const mainResults: Result[] = hasMatchResults
    ? matchResults!.map((r) => r.result)
    : (['none'] as const);

  const deltas = hasMatchResults ? matchResults!.map((r) => r.delta ?? 0) : [];

  const messagesSafe =
    resultMessages.length > 0
      ? resultMessages
      : hasIncoming
        ? ['이번 매치에 참여하지 않았어요.']
        : [];

  const handleTabClick = useCallback((type: RankingType) => {
    setRankingType(type);
  }, []);

  const handleHeaderClick = useCallback(
    (key: keyof typeof HEADER_TOAST_MAP) => {
      showToast(HEADER_TOAST_MAP[key](RANKING_TYPE_LABELS[rankingType]), key);
    },
    [rankingType],
  );

  const headerRow = useMemo(() => {
    const keys =
      rankingType === 'monthly'
        ? (['rank', 'name', 'avg', 'league', 'pin'] as const)
        : (['rank', 'name', 'avg', 'best', 'join'] as const);
    return (
      <tr>
        {keys.map((key) => (
          <th
            key={key}
            onClick={() =>
              handleHeaderClick(key as keyof typeof HEADER_TOAST_MAP)
            }
          >
            {HEADER_LABELS[key]}
          </th>
        ))}
      </tr>
    );
  }, [handleHeaderClick, rankingType]);

  const renderRow = useCallback(
    (user: RankingEntry, idx: number) => {
      const isMe = user.empId === myId;
      const medal = MEDALS[idx] ?? String(idx + 1);
      const disabledBase =
        isMe || EXCLUDED_EMP_IDS.includes(user.empId) || !myId;
      const sameLeague = myLeague && user.league === myLeague;
      const isParticipant =
        rankingType === 'monthly' && participants?.includes(user.empId);
      const matchUIEnabled =
        rankingType === 'monthly' &&
        timeAllowed &&
        !disabledBase &&
        sameLeague &&
        isParticipant;

      const isLeagueEnd =
        rankingType === 'monthly' &&
        idx < ranking.length - 1 &&
        ranking[idx + 1].league !== user.league;

      return (
        <MotionTableRow
          key={user.empId}
          variants={itemVariants}
          highlight={isMe}
          ref={isMe ? myRowRef : undefined}
          isLeagueEnd={isLeagueEnd}
        >
          <td>{medal}</td>
          <td>
            {matchUIEnabled ? (
              <MatchNamePopover
                ym={ym}
                myId={myId}
                targetId={user.empId}
                targetName={user.name}
                type={MATCH_TYPE}
                disabled={!matchUIEnabled}
                maxChoices={2}
              />
            ) : (
              user.name
            )}
          </td>
          <td>
            {rankingType === 'monthly' ? (
              <RankingPopover user={user} />
            ) : (
              user.average
            )}
          </td>
          <td>{rankingType === 'monthly' ? user.league : user.max}</td>
          <td>{rankingType === 'monthly' ? user.pin : user.games}</td>
        </MotionTableRow>
      );
    },
    [rankingType, ym, myId, timeAllowed, myLeague],
  );

  const availableTabs = useMemo(
    () =>
      participantsAll.length > 0
        ? RANKING_TABS
        : RANKING_TABS.filter((t) => t !== 'monthly'),
    [participantsAll],
  );

  return (
    <Container>
      <RankingContentBox maxWidth="480px">
        <Title size="small">또랑 랭킹</Title>

        <FilterTabs>
          {availableTabs.map((type) => (
            <RankingTab
              key={type}
              active={rankingType === type}
              onClick={() => handleTabClick(type)}
            >
              {RANKING_TYPE_LABELS[type]}
            </RankingTab>
          ))}
        </FilterTabs>

        {ranking.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={rankingType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: ANIM_DURATION }}
            >
              <TableContainer>
                <StyledRankingTable>
                  <thead>{headerRow}</thead>
                  <motion.tbody
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {ranking.map(renderRow)}
                  </motion.tbody>
                </StyledRankingTable>
              </TableContainer>
            </motion.div>
          </AnimatePresence>
        )}

        <SmallText
          top="middle"
          onClick={() => navigate('/menu', { replace: true })}
        >
          돌아가기
        </SmallText>
      </RankingContentBox>

      <MatchOverlay
        open={vsOpen}
        me={meEntry?.name ?? '나'}
        opponent={opponent}
        deltaAvg={vsDeltaAvg}
        onClose={closeVs}
        durationMs={2000}
        type={MATCH_TYPE}
      />

      <CongratulationOverlay
        open={showCongrats}
        mainResult={mainResults}
        message={messagesSafe}
        delta={deltas}
        incoming={incoming}
        onClose={() => setShowCongrats(false)}
      />
    </Container>
  );
};

export default Ranking;
