import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cubicBezier } from 'framer-motion';
import { MyInfoContainer, MyInfoBox } from '../../styles/myInfoStyle';
import { Title as PageTitle } from '../../styles/commonStyle';
import MonthNavigator from './MonthNavigator';
import { useUiStore } from '../../stores/useUiStore';

import {
  CategoryRow,
  CategoryBtn,
  ListFrame,
  EmptyState,
  Row,
  Icon,
  Title,
  Desc,
  TeamInline,
  Value,
  ContentCell,
  ActivitySummaryCell,
} from './ActivityHistoryStyle';
import { SmallText } from '../../styles/commonStyle';

import type { ActivityItem } from '../../types/activity';
import ActivityBottomSheet from './ActivityBottomSheet';
import { useActivityRewards } from '../../hooks/useActivityRewards';
import { useActivityMatches } from '../../hooks/useActivityMatches';
import { useActivitySummary } from '../../hooks/useActivitySummary';
import { useActivityLeague } from '../../hooks/useActivityLeague';

type Category = 'all' | 'match' | 'reward' | 'activity';

const iconMap: Record<ActivityItem['type'], string> = {
  match: '🎳',
  reward: '🎁',
  activity: '📊',
  league: '🏆',
};

const ym = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const easeOutCubic = cubicBezier(0.22, 1, 0.36, 1);

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.11,
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOutCubic,
    },
  },
};

const TYPE_PRIORITY: Record<string, number> = { match: 0, league: 0, reward: 1, activity: 2 };

const joinNames = (names: string[], max = 3) =>
  names.length <= max ? names.join(' · ') : names.slice(0, max).join(' · ') + ' · …';

const ActivityHistory = () => {
  const navigate = useNavigate();
  const currentYm = useMemo(
    () => ym(useUiStore.getState().getServerNow().getTime()),
    [],
  );
  const [yyyymm, setYyyymm] = useState(currentYm);
  const [category, setCategory] = useState<Category>('all');
  const [selected, setSelected] = useState<ActivityItem | null>(null);

  const { items: rewardItems, loading: rewardLoading } = useActivityRewards(yyyymm);
  const { items: matchItems, loading: matchLoading } = useActivityMatches(yyyymm);
  const { item: summaryItem, loading: summaryLoading } = useActivitySummary(yyyymm);
  const { items: leagueItems, loading: leagueLoading } = useActivityLeague(yyyymm);

  const monthly = useMemo(() => {
    const base: ActivityItem[] = [...rewardItems, ...matchItems, ...leagueItems];
    if (summaryItem) base.push(summaryItem);
    return base;
  }, [rewardItems, matchItems, summaryItem, leagueItems]);

  const filtered = useMemo(() => {
    const base =
      category === 'all'
        ? monthly
        : monthly.filter((a) =>
            category === 'match'
              ? a.type === 'match' || a.type === 'league'
              : a.type === category,
          );
    return [...base].sort((a, b) => {
      if (a.type === 'activity' && b.type !== 'activity') return 1;
      if (b.type === 'activity' && a.type !== 'activity') return -1;
      if (b.date !== a.date) return b.date - a.date;
      return (TYPE_PRIORITY[a.type] ?? 2) - (TYPE_PRIORITY[b.type] ?? 2);
    });
  }, [monthly, category]);

  return (
    <>
      <MyInfoContainer>
        <MyInfoBox>
          <PageTitle size="small">활동 기록</PageTitle>

          <MonthNavigator yyyymm={yyyymm} onChange={setYyyymm} minYm="202508" maxYm={currentYm} />

          <CategoryRow>
            {(['all', 'match', 'reward', 'activity'] as Category[]).map((c) => (
              <CategoryBtn
                key={c}
                active={category === c}
                onClick={() => {
                  setCategory(c);
                  setSelected(null);
                }}
              >
                {c === 'all'
                  ? '전체'
                  : c === 'match'
                    ? '경기'
                    : c === 'reward'
                      ? '리워드'
                      : '활동'}
              </CategoryBtn>
            ))}
          </CategoryRow>

          <ListFrame
            variants={listVariants}
            initial="hidden"
            animate="visible"
            key={`${yyyymm}-${category}`}
          >
            {rewardLoading || matchLoading || summaryLoading || leagueLoading ? (
              <EmptyState variants={rowVariants}>불러오는 중...</EmptyState>
            ) : filtered.length === 0 ? (
              <EmptyState variants={rowVariants}>해당 월의 내역이 없습니다.</EmptyState>
            ) : (
              filtered.map((item) => (
                <Row
                  key={item.id}
                  variants={rowVariants}
                  onClick={() => setSelected(item)}
                >
                  {item.type === 'activity' ? (
                    <ActivitySummaryCell>
                      <Title>{item.title}</Title>
                      <Desc>
                        {item.stats
                          ? `사진 ${item.stats.photos} · 좋아요 ${item.stats.likes} · 댓글 ${item.stats.comments} · 업적 ${item.stats.achievements}`
                          : item.description}
                      </Desc>
                    </ActivitySummaryCell>
                  ) : (
                    <>
                      <Icon>{iconMap[item.type]}</Icon>

                      <ContentCell>
                        <Title>{item.title}</Title>

                        {item.type === 'match' && (
                          <TeamInline>
                            {item.teams.my.length === 1 ? (
                              <div>
                                <strong>vs</strong>
                                {item.teams.opponent[0]}
                              </div>
                            ) : (
                              <>
                                <div>
                                  <strong>우리팀</strong>
                                  {joinNames(item.teams.my)}
                                </div>
                                <div>
                                  <strong>상대팀</strong>
                                  {joinNames(item.teams.opponent)}
                                </div>
                              </>
                            )}
                          </TeamInline>
                        )}

                        {item.type === 'reward' && item.description && (
                          <Desc>{item.description}</Desc>
                        )}

                        {item.type === 'league' && (
                          <TeamInline>
                            <div>
                              <strong>우리팀</strong>
                              {joinNames(item.myTeam.map((p) => p.name))}
                            </div>
                            <div>
                              <strong>상대팀</strong>
                              {joinNames(item.opponentTeam.map((p) => p.name))}
                            </div>
                          </TeamInline>
                        )}
                      </ContentCell>

                      {item.type === 'league' ? (
                        <Value positive={item.result === 'win'}>
                          {item.result === 'win' ? '승' : item.result === 'lose' ? '패' : '무'}
                        </Value>
                      ) : item.type === 'match' ? (
                        <Value positive={item.delta > 0}>
                          {item.delta > 0 ? '승' : item.delta < 0 ? '패' : '무'}
                        </Value>
                      ) : item.delta === 0 ? (
                        <Value />
                      ) : (
                        <Value positive={item.delta > 0}>
                          {item.delta > 0 ? '+' : ''}
                          {(item.delta ?? 0).toFixed(1)}
                        </Value>
                      )}
                    </>
                  )}
                </Row>
              ))
            )}
          </ListFrame>

          <SmallText top="middle" onClick={() => navigate('/menu', { replace: true })}>돌아가기</SmallText>
        </MyInfoBox>
      </MyInfoContainer>

      <ActivityBottomSheet
        open={!!selected}
        item={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default ActivityHistory;
