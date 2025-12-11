import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getCurrentUserId, fetchAllUsers, db } from '../services/firebase';
import { ref, set } from 'firebase/database';
import { mapUsersToRankingEntries, type Result } from '../utils/ranking';
import { getYearMonth } from '../utils/date';
import { showToast } from '../utils/toast';
import { useLoading } from '../contexts/LoadingContext';

import RankingPopover from './RankingPopover';
import MatchOverlay from './MatchOverlay';
import CongratulationOverlay from './CongratulationOverlay';
import MatchNamePopover from './MatchNamePopover';
import LetterListOverlay from './LetterListOverlay';

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
import { useReceivedLetters } from '../hooks/useReceivedLetters';
import { canEditTarget } from '../utils/policy';
import { useUiStore } from '../stores/useUiStore';

// monthly 연동
const RANKING_TABS: RankingType[] = ['monthly', 'quarter', 'year', 'total'];
//const RANKING_TABS: RankingType[] = ['quarter', 'year', 'total'];
const MEDALS = ['🥇', '🥈', '🥉'] as const;
const ANIM_DURATION = 0.3;
const MATCH_TYPE: 'rival' | 'pin' = 'pin';

const HEADER_LABELS: Record<keyof typeof HEADER_TOAST_MAP, string> = {
  rank: '순위',
  name: '이름',
  avg: '평균',
  best: '최고',
  join: '참여',
  pin: '핀',
  league: '리그',
};

const Ranking = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { maps: activityAll } = useActivityDates();

  const participantsAll = useActivityParticipants(
    String(CUR_YEAR) as Year,
    String(CUR_MONTHN) as Month,
  );

  // monthly 연동

  const [rankingType, setRankingType] = useState<RankingType>(
    participantsAll.length > 0 ? 'monthly' : 'quarter',
  );

  //const [rankingType, setRankingType] = useState<RankingType>('monthly');
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [myId, setMyId] = useState<string | null>(null);
  const [showLetters, setShowLetters] = useState(true);
  const myRowRef = useRef<HTMLTableRowElement>(null);

  const ym: YearMonth = getYearMonth();
  const year = Number(CUR_YEAR);
  const month = Number(CUR_MONTHN);

  const activityYmd = (() => {
    const current = activityAll[String(year)]?.[String(month)];
    if (current) return String(current);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prev = activityAll[String(prevYear)]?.[String(prevMonth)];
    return prev ? String(prev) : undefined;
  })();

  const timeAllowed = canEditTarget(activityYmd, { cutoffTime: '18:30' });
  const participants = rankingType === 'monthly' ? participantsAll : undefined;

  const { hasShownCongrats, setShownCongrats } = useUiStore();
  const hasRankingCongrats = hasShownCongrats.ranking;

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ranking: RankingEntry[] = useMemo(() => {
    if (!Object.keys(users).length) return [];
    return mapUsersToRankingEntries(users, rankingType, participants).filter(
      (entry) => !EXCLUDED_EMP_IDS.includes(entry.empId),
    );
  }, [users, rankingType, participants]);

  const hasQuarterData = useMemo(() => {
    return (
      mapUsersToRankingEntries(users, 'quarter').filter(
        (entry) => !EXCLUDED_EMP_IDS.includes(entry.empId),
      ).length > 0
    );
  }, [users]);

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

  const incoming = useMatchIncoming(ym, myId, MATCH_TYPE, users, activityYmd);
  const receivedLetters = useReceivedLetters(ym, myId, MATCH_TYPE, activityYmd);

  const hasMatchResults =
    matchResults?.some((r) => r.result !== 'none') ?? false;
  const hasIncoming = incoming.length > 0;
  const isReady = matchResults !== null;
  const hasActivity = Boolean(activityYmd);
  const condition = isReady && hasActivity && (hasMatchResults || hasIncoming);

  const { show: showCongrats, setShow: setShowCongrats } = useCongratulation({
    condition,
    activityYmd,
    withinDays: 7,
  });

  const resultMessages = useMemo(() => {
    if (!matchResults?.length) return [];
    return matchResults
      .map((res) =>
        res.result === 'win'
          ? `${res.opponentName}님을 이겼습니다!`
          : res.result === 'lose'
            ? `${res.opponentName}님에게 졌습니다.`
            : res.result === 'draw'
              ? `${res.opponentName}님과 무승부!`
              : '',
      )
      .filter(Boolean);
  }, [matchResults]);

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
          <th key={key} onClick={() => handleHeaderClick(key)}>
            {HEADER_LABELS[key]}
          </th>
        ))}
      </tr>
    );
  }, [handleHeaderClick, rankingType]);

  const handleSendLetter = async (
    targetId: string,
    message: string,
    anonymous: boolean,
  ) => {
    if (!myId) return;
    await set(ref(db, `match/${ym}/${MATCH_TYPE}/${myId}/${targetId}`), {
      chosenAt: Date.now(),
      message,
      anonymous,
    });
  };

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
                onSendLetter={handleSendLetter}
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
            {/*
           {rankingType === 'quarter' ? (
              <RankingPopover user={user} />
            ) : (
              user.average
            )} */}
          </td>
          <td>{rankingType === 'monthly' ? user.league : user.max}</td>
          <td>{rankingType === 'monthly' ? user.pin : user.games}</td>
        </MotionTableRow>
      );
    },
    [rankingType, ym, myId, timeAllowed, myLeague],
  );

  useEffect(() => {
    if (participantsAll.length > 0) {
      setRankingType('monthly');
    }
  }, [participantsAll]);

  const availableTabs = useMemo(() => {
    let base =
      participantsAll.length > 0
        ? RANKING_TABS
        : RANKING_TABS.filter((t) => t !== 'monthly');
    if (!hasQuarterData) base = base.filter((t) => t !== 'quarter');
    return base;
  }, [participantsAll, hasQuarterData]);

  return (
    <Container>
      <RankingContentBox maxWidth="480px">
        <Title size="small">또랑 랭킹</Title>

        <FilterTabs>
          {availableTabs.map((type) => (
            <RankingTab
              key={type}
              active={rankingType === type}
              onClick={() => setRankingType(type)}
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
        open={showCongrats && !hasRankingCongrats}
        mainResult={mainResults}
        message={messagesSafe}
        delta={deltas}
        incoming={incoming}
        onClose={() => {
          setShowCongrats(false);
          setShownCongrats('ranking');
        }}
      />

      {timeAllowed && showLetters && receivedLetters.length > 0 && (
        <LetterListOverlay
          letters={receivedLetters}
          users={users}
          onClose={() => setShowLetters(false)}
        />
      )}
    </Container>
  );
};

export default Ranking;
