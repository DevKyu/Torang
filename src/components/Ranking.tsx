import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getCurrentUserId,
  fetchAllUsers,
  db,
  saveMatchResult,
} from '../services/firebase';
import { ref, set } from 'firebase/database';
import { mapUsersToRankingEntries, type Result } from '../utils/ranking';
import { showToast } from '../utils/toast';

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
  listVariants,
  itemVariants,
  MotionTableRow,
  RankingBody,
  MotionRankingTab,
  SkeletonLine,
} from '../styles/rankingStyle';
import {
  RANKING_TYPE_LABELS,
  HEADER_TOAST_MAP,
  EXCLUDED_EMP_IDS,
} from '../constants/ranking';

import { useMatchPickedOverlay } from '../hooks/useMatchPickedOverlay';
import { useMatchResult } from '../hooks/useMatchResult';
import { useMatchIncomingAndLetters } from '../hooks/useMatchIncomingAndLetters';
import { useCongratulation } from '../hooks/useCongratulation';
import { useActivityParticipants } from '../hooks/useActivityParticipants';
import { useActivityDates } from '../hooks/useActivityDates';
import { canEditTarget } from '../utils/policy';
import { useUiStore } from '../stores/useUiStore';
import { useEventStore } from '../stores/eventStore';
import { applyPinChangeBatch } from '../utils/pin';

const SKELETON_ROWS = [
  ['44%', '70%', '54%', '50%', '44%'],
  ['42%', '66%', '52%', '48%', '42%'],
  ['44%', '70%', '54%', '50%', '44%'],
  ['42%', '66%', '52%', '48%', '42%'],
  ['44%', '70%', '54%', '50%', '44%'],
  ['42%', '66%', '52%', '48%', '42%'],
  ['44%', '70%', '54%', '50%', '44%'],
  ['42%', '66%', '52%', '48%', '42%'],
  ['44%', '70%', '54%', '50%', '44%'],
  ['42%', '66%', '52%', '48%', '42%'],
] as const;

const RANKING_TABS: RankingType[] = ['monthly', 'quarter', 'year', 'total'];
const MEDALS = ['🥇', '🥈', '🥉'] as const;

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
  const MATCH_TYPE = useEventStore((s) => s.matchType);
  const { maps: activityAll } = useActivityDates();

  const { hasShownCongrats, setShownCongrats, formatServerDate, getServerNow } =
    useUiStore();

  const ym = formatServerDate('ym') as YearMonth;
  const serverNow = getServerNow();
  const year = serverNow.getFullYear();
  const month = serverNow.getMonth() + 1;

  const participantsAll = useActivityParticipants(
    String(year) as Year,
    String(month) as Month,
  );

  const [rankingType, setRankingType] = useState<RankingType>('quarter');
  const [rankingReady, setRankingReady] = useState(false);
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [showLetters, setShowLetters] = useState(true);
  const myRowRef = useRef<HTMLTableRowElement>(null);
  const rankingInitRef = useRef(false);

  const activityYmd = useMemo(() => {
    const current = activityAll[String(year)]?.[String(month)];
    if (current) return String(current);

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prev = activityAll[String(prevYear)]?.[String(prevMonth)];
    return prev ? String(prev) : undefined;
  }, [activityAll, year, month]);

  const activityYm = useMemo<YearMonth>(() => {
    return activityYmd ? (activityYmd.slice(0, 6) as YearMonth) : ym;
  }, [activityYmd, ym]);

  const timeAllowed = canEditTarget(activityYmd, { cutoffTime: '18:30' });
  const participants = rankingType === 'monthly' ? participantsAll : undefined;

  const monthlyEnabled = useMemo(() => {
    if (!activityYmd) return false;
    return participantsAll.length > 0 && timeAllowed;
  }, [participantsAll, activityYmd, timeAllowed]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [usersData, currentId] = await Promise.all([
          fetchAllUsers(),
          getCurrentUserId(),
        ]);
        if (cancelled) return;
        setUsers(usersData);
        setMyId(currentId || null);
        setUsersLoaded(true);
      } catch {
        if (!cancelled) navigate('/', { replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const quarterEntries = useMemo(
    () =>
      mapUsersToRankingEntries(users, 'quarter').filter(
        (entry) => !EXCLUDED_EMP_IDS.includes(entry.empId),
      ),
    [users],
  );

  const yearEntries = useMemo(
    () =>
      mapUsersToRankingEntries(users, 'year').filter(
        (entry) => !EXCLUDED_EMP_IDS.includes(entry.empId),
      ),
    [users],
  );

  const hasQuarterData = quarterEntries.length > 0;
  const hasYearData = yearEntries.length > 0;

  const availableTabs = useMemo(() => {
    let base = monthlyEnabled
      ? RANKING_TABS
      : RANKING_TABS.filter((t) => t !== 'monthly');

    if (!hasQuarterData) base = base.filter((t) => t !== 'quarter');
    if (!hasYearData) base = base.filter((t) => t !== 'year');

    return base;
  }, [monthlyEnabled, hasQuarterData, hasYearData]);

  useEffect(() => {
    if (!availableTabs.length || !usersLoaded || rankingInitRef.current) return;
    rankingInitRef.current = true;

    if (availableTabs.includes('monthly')) {
      setRankingType('monthly');
    } else {
      const first = RANKING_TABS.find((t) => availableTabs.includes(t));
      if (first) setRankingType(first);
    }
    setRankingReady(true);
  }, [availableTabs, usersLoaded]);

  const ranking: RankingEntry[] = useMemo(() => {
    if (!usersLoaded) return [];
    if (rankingType === 'quarter') return quarterEntries;
    if (rankingType === 'year') return yearEntries;
    return mapUsersToRankingEntries(users, rankingType, participants).filter(
      (entry) => !EXCLUDED_EMP_IDS.includes(entry.empId),
    );
  }, [usersLoaded, rankingType, participants, quarterEntries, yearEntries, users]);

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

  const { incoming, letters: receivedLetters } = useMatchIncomingAndLetters(ym, myId, MATCH_TYPE, users, activityYmd);

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

  const appliedRef = useRef(false);

  useEffect(() => {
    if (!myId || !matchResults || appliedRef.current) return;
    if (!hasMatchResults && !hasIncoming) return;
    appliedRef.current = true;
    (async () => {
      try {
        await Promise.all(
          matchResults.map((r) =>
            saveMatchResult(
              activityYm,
              myId,
              MATCH_TYPE,
              r.opponentId,
              r.myScore,
              r.opponentScore,
              r.delta,
              r.result,
            ),
          ),
        );
        if (MATCH_TYPE === 'rival') {
          await applyPinChangeBatch(activityYm, myId, MATCH_TYPE, matchResults);
        }
      } catch {
        appliedRef.current = false;
      }
    })();
  }, [matchResults, myId, activityYm]);

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
      <motion.tr
        key={rankingType === 'monthly' ? 'monthly' : 'other'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {keys.map((key) => (
          <th key={key} onClick={() => handleHeaderClick(key)}>
            {HEADER_LABELS[key]}
          </th>
        ))}
      </motion.tr>
    );
  }, [handleHeaderClick, rankingType]);

  const handleSendLetter = useCallback(async (
    targetId: string,
    message: string,
    anonymous: boolean,
  ) => {
    if (!myId) return;
    await set(ref(db, `match/${ym}/${MATCH_TYPE}/${myId}/${targetId}`), {
      chosenAt: useUiStore.getState().getServerNow().getTime(),
      message,
      anonymous,
    });
  }, [myId, ym, MATCH_TYPE]);

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
          </td>
          <td>{rankingType === 'monthly' ? user.league : user.max}</td>
          <td>{rankingType === 'monthly' ? user.pin : user.games}</td>
        </MotionTableRow>
      );
    },
    [rankingType, ym, myId, timeAllowed, myLeague, participants, handleSendLetter, ranking],
  );

  return (
    <Container>
      <RankingContentBox maxWidth="480px">
        <Title size="small">또랑 랭킹</Title>

        <RankingBody>
          <FilterTabs>
            {rankingReady
              ? availableTabs.map((type, idx) => (
                  <MotionRankingTab
                    key={type}
                    active={rankingType === type}
                    onClick={() => setRankingType(type)}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.06 }}
                  >
                    {RANKING_TYPE_LABELS[type]}
                  </MotionRankingTab>
                ))
              : (['quarter', 'year', 'total'] as const).map((type) => (
                  <MotionRankingTab
                    key={`ph-${type}`}
                    active={false}
                    style={{ visibility: 'hidden' }}
                  >
                    {RANKING_TYPE_LABELS[type]}
                  </MotionRankingTab>
                ))
            }
          </FilterTabs>

          <TableContainer>
            <StyledRankingTable>
              <thead>
                <AnimatePresence mode="wait" initial={false}>
                  {headerRow}
                </AnimatePresence>
              </thead>
              <AnimatePresence mode="wait">
                {!rankingReady ? (
                  <motion.tbody
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {SKELETON_ROWS.map((cols, i) => (
                      <tr key={i}>
                        {cols.map((w, j) => (
                          <td key={j}><SkeletonLine width={w} /></td>
                        ))}
                      </tr>
                    ))}
                  </motion.tbody>
                ) : ranking.length > 0 ? (
                  <motion.tbody
                    key={rankingType}
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    {ranking.map(renderRow)}
                  </motion.tbody>
                ) : (
                  <motion.tbody
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <tr style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
                      <td style={{ border: 'none', color: '#bbb', fontSize: '13px' }}>
                        등록된 데이터가 없어요
                      </td>
                    </tr>
                  </motion.tbody>
                )}
              </AnimatePresence>
            </StyledRankingTable>
          </TableContainer>
        </RankingBody>

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
        open={showCongrats && !hasShownCongrats.ranking}
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
