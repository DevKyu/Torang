import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

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
import { getCurrentUserId, fetchAllUsers } from '../services/firebase';
import {
  calculateScoreStats,
  sortByAvgThenGamesThenMax,
} from '../utils/ranking';
import RankingPopover from './RankingPopover';
import { showToast } from '../utils/toast';
import { useLoading } from '../contexts/LoadingContext';

import type { RankingEntry, RankingType } from '../types/Ranking';
import {
  RANKING_TYPE_LABELS,
  HEADER_TOAST_MAP,
  EXCLUDED_EMP_IDS,
} from '../constants/rankingConstants';

const Ranking = () => {
  const [rankingType, setRankingType] = useState<RankingType>('quarter');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  const navigate = useNavigate();
  const isFirstRender = useRef(true);
  const myRowRef = useRef<HTMLTableRowElement>(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
      if (isFirstRender.current) showLoading();

      try {
        const users = await fetchAllUsers();
        const entries = Object.entries(users)
          .filter(([empId]) => !EXCLUDED_EMP_IDS.includes(empId))
          .map(([empId, user]) => {
            const { average, games, max } = calculateScoreStats(
              user.scores,
              rankingType,
            );
            return {
              empId,
              name: user.name,
              average,
              games,
              max,
              scores: user.scores,
            };
          })
          .filter((entry) => entry.games > 0)
          .sort(sortByAvgThenGamesThenMax);

        setRanking(entries);
      } catch {
        navigate('/', { replace: true });
      } finally {
        if (isFirstRender.current) {
          hideLoading();
          isFirstRender.current = false;
        }
      }
    };

    fetchData();
    getCurrentUserId().then((id) => setMyId(id || null));
  }, [rankingType]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (myRowRef.current) {
        myRowRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [ranking]);

  const renderHeader = () => (
    <tr>
      {Object.entries(HEADER_TOAST_MAP).map(([key, getToast]) => (
        <th
          key={key}
          onClick={() =>
            showToast(getToast(RANKING_TYPE_LABELS[rankingType]), key)
          }
        >
          {key === 'rank'
            ? '순위'
            : key === 'name'
              ? '이름'
              : key === 'avg'
                ? '평균'
                : key === 'best'
                  ? '최고'
                  : '참여'}
        </th>
      ))}
    </tr>
  );

  const renderRow = (user: RankingEntry, idx: number) => {
    const isTop3 = idx < 3;
    const isMe = user.empId === myId;
    const medal = ['🥇', '🥈', '🥉'][idx] ?? `${idx + 1}`;
    const refProp = isMe ? { ref: myRowRef } : {};

    return (
      <MotionTableRow
        key={user.empId}
        variants={itemVariants}
        highlight={isMe}
        topRank={isTop3}
        {...refProp}
      >
        <td>{medal}</td>
        <td>{user.name}</td>
        <td>
          {rankingType === 'quarter' ? (
            <RankingPopover user={user} />
          ) : (
            user.average
          )}
        </td>
        <td>{user.max}</td>
        <td>{user.games}</td>
      </MotionTableRow>
    );
  };

  return (
    <Container>
      <RankingContentBox maxWidth="480px">
        <Title size="small">🏆 또랑 랭킹</Title>

        <FilterTabs>
          {(['quarter', 'year', 'total'] as RankingType[]).map((type) => (
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
              transition={{ duration: 0.3 }}
            >
              <TableContainer>
                <StyledRankingTable>
                  <thead>{renderHeader()}</thead>
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
    </Container>
  );
};

export default Ranking;
