import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { getCurrentUserId, fetchAllUsers } from '../services/firebase';
import { mapUsersToRankingEntries } from '../utils/ranking';
import { getYearMonth } from '../utils/date';
import { showToast } from '../utils/toast';
import { useLoading } from '../contexts/LoadingContext';

import RankingPopover from './RankingPopover';
import RivalPopover from './RivalPopover';
import RivalOverlay from './RivalOverlay';
import CongratulationOverlay from './CongratulationOverlay';

import type { RankingEntry, RankingType } from '../types/Ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import type { YearMonth } from '../types/rival';

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
import { useRivalPickedOverlay } from '../hooks/useRivalPickedOverlay';
import { useRivalResult } from '../hooks/useRivalResult';
import { useCongratulation } from '../hooks/useCongratulation';
import { useRivalIncoming } from '../hooks/useRivalIncoming';
import { useActivityParticipants } from '../hooks/useActivityParticipants';
import { useActivityDates } from '../hooks/useActivityDates';
import { canEditTarget, toYmd } from '../utils/policy';
import { CUR_YEAR, CUR_MONTHN } from '../constants/date';

const RANKING_TABS: RankingType[] = [
  'quarter',
  'year',
  'total',
  /* 'monthly' */
];
const MEDALS = ['🥇', '🥈', '🥉'] as const;
const ANIM_DURATION = 0.3;

const HEADER_LABELS: Record<keyof typeof HEADER_TOAST_MAP, string> = {
  rank: '순위',
  name: '이름',
  avg: '평균',
  best: '최고',
  join: '참여',
  pin: '핀',
};

const Ranking = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { maps: activityAll } = useActivityDates();

  const [rankingType, setRankingType] = useState<RankingType>('quarter');
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [myId, setMyId] = useState<string | null>(null);

  const isFirstRender = useRef(true);
  const myRowRef = useRef<HTMLTableRowElement>(null);
  const ym: YearMonth = getYearMonth();
  const activityMap = activityAll[String(CUR_YEAR)] ?? {};
  const todayYmd = toYmd(new Date());
  const raw = activityMap[String(CUR_MONTHN)];
  const activityYmd = raw != null ? String(raw) : undefined;
  const timeAllowed = canEditTarget(todayYmd, activityYmd);

  const participantsAll = useActivityParticipants(
    String(CUR_YEAR) as Year,
    String(CUR_MONTHN) as Month,
  );
  const participants = rankingType === 'monthly' ? participantsAll : undefined;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (isFirstRender.current) showLoading();
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
        if (isFirstRender.current && !cancelled) {
          hideLoading();
          isFirstRender.current = false;
        }
      }
    };

    init();
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

  const {
    open: vsOpen,
    rivalName: vsRivalName,
    deltaAvg: vsDeltaAvg,
    close: closeVs,
  } = useRivalPickedOverlay({
    rankingType,
    ranking,
    myId,
    enabled: rankingType === 'quarter' && timeAllowed,
    cooldownMs: 1000,
  });

  const {
    rivalName: resultRival,
    delta,
    result,
  } = useRivalResult({ myId, ym, users, activityYmd, withinDays: 7 });

  const { show: showCongrats, setShow: setShowCongrats } = useCongratulation({
    condition: !!resultRival && result !== 'none',
    activityYmd,
    withinDays: 7,
  });

  const incoming = useRivalIncoming(ym, myId, users);
  const incomingWithNames = incoming.map((i) => ({
    name: users[i.fromId]?.name ?? i.fromId,
    result: i.result,
    delta: i.delta,
  }));

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
        ? // ? (['rank', 'name', 'avg', 'best', 'pin'] as const)
          (['rank', 'name', 'avg', 'best', 'join'] as const)
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
  }, [rankingType, handleHeaderClick]);

  const renderRow = useCallback(
    (user: RankingEntry, idx: number) => {
      const isTop3 = idx < 3;
      const isMe = user.empId === myId;
      const medal = MEDALS[idx] ?? String(idx + 1);

      const disabledBase =
        isMe || EXCLUDED_EMP_IDS.includes(user.empId) || !myId;
      const rivalUIEnabled =
        rankingType === 'quarter' && timeAllowed && !disabledBase;

      return (
        <MotionTableRow
          key={user.empId}
          variants={itemVariants}
          highlight={isMe}
          topRank={isTop3}
          ref={isMe ? myRowRef : undefined}
        >
          <td>{medal}</td>
          <td>
            {rivalUIEnabled ? (
              <RivalPopover
                ym={ym}
                myId={myId}
                targetId={user.empId}
                targetName={user.name}
                disabled={false}
              />
            ) : (
              user.name
            )}
          </td>
          <td>
            {rankingType === 'quarter' ? (
              <RankingPopover user={user} />
            ) : (
              user.average
            )}
          </td>
          <td>{user.max}</td>
          <td>
            {
              // rankingType === 'monthly' ? user.pin : user.games
              user.games
            }
          </td>
        </MotionTableRow>
      );
    },
    [rankingType, ym, myId, timeAllowed],
  );

  const resultMessage =
    result === 'win'
      ? `${resultRival}님을 이겼습니다!`
      : result === 'lose'
        ? `${resultRival}님에게 졌습니다.`
        : result === 'draw'
          ? `${resultRival}님과 무승부!`
          : '';

  return (
    <Container>
      <RankingContentBox maxWidth="480px">
        <Title size="small">🏆 또랑 랭킹</Title>

        <FilterTabs>
          {RANKING_TABS.map((type) => (
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
                  <tbody>
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      style={{ display: 'contents' }}
                    >
                      {ranking.map(renderRow)}
                    </motion.div>
                  </tbody>
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

      <RivalOverlay
        open={vsOpen}
        me={meEntry?.name ?? '나'}
        rival={vsRivalName}
        deltaAvg={vsDeltaAvg}
        onClose={closeVs}
        durationMs={2000}
      />

      <CongratulationOverlay
        open={showCongrats}
        mainResult={result}
        message={resultMessage}
        delta={delta}
        incoming={incomingWithNames}
        onClose={() => setShowCongrats(false)}
      />
    </Container>
  );
};

export default Ranking;
