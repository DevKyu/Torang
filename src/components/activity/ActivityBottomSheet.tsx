import {
  AnimatePresence,
  type PanInfo,
  useMotionValue,
  animate,
} from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { ActivityItem } from '../../types/activity';
import {
  Backdrop,
  Content,
  DateLine,
  Delta,
  Desc,
  Handle,
  Header,
  Month,
  RewardBadge,
  Sheet,
  SheetWrapper,
  StatEmoji,
  StatItem,
  StatLabel,
  StatValue,
  StatsGrid,
  TeamBlock,
  TeamLabel,
  TeamLabelRow,
  TeamScoreNum,
  TeamsRow,
  Title,
  LeaguePlayerRow,
  LeaguePlayerScore,
  ScoreGroup,
  ScoreVal,
  ScoreSep,
  TeamDivider,
  TargetScoreRow,
  TargetArrow,
  TargetScoreBox,
  TargetScoreLabel,
  TargetScoreValue,
  TargetScoreUnit,
  TargetDelta,
} from '../../styles/ActivityBottomSheetStyle';

type Props = {
  open: boolean;
  item: ActivityItem | null;
  onClose: () => void;
};

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const categoryLabel: Record<string, string> = {
  activity: '🏃 활동 보상',
  achievement: '🏆 업적 보상',
  target: '🎯 목표 달성',
  match: '🎳 매치 보상',
  referral: '👥 추천인 보상',
  gallery: '📷 갤러리 보상',
  mission: '📋 미션 보상',
};

const formatMonth = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}월`;
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const ActivityBottomSheet = ({ open, item, onClose }: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(500);
  const closingRef = useRef(false);

  useEffect(() => {
    if (!open || !item) return;
    closingRef.current = false;
    const h = sheetRef.current?.offsetHeight ?? 500;
    y.set(h);
    animate(y, 0, { duration: 0.36, ease: EASE_OUT });
  }, [open, item, y]);

  const runClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const h = sheetRef.current?.offsetHeight ?? 500;
    animate(y, h, { duration: 0.3, ease: EASE_OUT, onComplete: onClose });
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    y.set(Math.max(0, info.offset.y));
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 40 || info.velocity.y > 600) {
      runClose();
    } else {
      animate(y, 0, { duration: 0.28, ease: EASE_OUT });
    }
  };

  return (
    <AnimatePresence>
      {open && item && (
        <SheetWrapper
          key={`activity-sheet-${item.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Backdrop onClick={runClose} />

          <Sheet
            ref={sheetRef}
            style={{ y }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            <Handle />

            <Content>
              <Header>
                <Title>{item.title}</Title>
                {item.type === 'league' ? (
                  <Delta
                    draw={item.result === 'draw'}
                    positive={item.result === 'win'}
                  >
                    {item.result === 'win'
                      ? '승리'
                      : item.result === 'lose'
                        ? '패배'
                        : '무승부'}
                  </Delta>
                ) : 'delta' in item ? (
                  <Delta positive={item.delta > 0}>
                    {item.type === 'match'
                      ? `${item.delta > 0 ? '+' : ''}${Math.round(item.delta)} 점`
                      : `${item.delta > 0 ? '+' : ''}${item.delta.toFixed(1)} PIN`}
                  </Delta>
                ) : (
                  <Month>{formatMonth(item.date)}</Month>
                )}
              </Header>

              {item.type === 'match' &&
                item.teams &&
                (() => {
                  const myStatus =
                    item.delta > 0
                      ? 'winner'
                      : item.delta < 0
                        ? 'loser'
                        : 'neutral';
                  const oppStatus =
                    item.delta > 0
                      ? 'loser'
                      : item.delta < 0
                        ? 'winner'
                        : 'neutral';
                  return (
                    <>
                      <TeamsRow>
                        <TeamBlock status={myStatus}>
                          <TeamLabelRow>
                            <TeamLabel status={myStatus}>
                              {item.teams.my.length === 1
                                ? item.teams.my[0]
                                : '우리팀'}
                            </TeamLabel>
                            {item.scores && (
                              <TeamScoreNum status={myStatus}>
                                {item.scores.my}
                              </TeamScoreNum>
                            )}
                          </TeamLabelRow>
                          {item.teams.my.length > 1 &&
                            item.teams.my.map((name) => (
                              <span key={name}>{name}</span>
                            ))}
                        </TeamBlock>
                        <TeamBlock status={oppStatus}>
                          <TeamLabelRow>
                            <TeamLabel status={oppStatus}>
                              {item.teams.opponent.length === 1
                                ? item.teams.opponent[0]
                                : '상대팀'}
                            </TeamLabel>
                            {item.scores && (
                              <TeamScoreNum status={oppStatus}>
                                {item.scores.opponent}
                              </TeamScoreNum>
                            )}
                          </TeamLabelRow>
                          {item.teams.opponent.length > 1 &&
                            item.teams.opponent.map((name) => (
                              <span key={name}>{name}</span>
                            ))}
                        </TeamBlock>
                      </TeamsRow>
                      <DateLine>{formatDate(item.date)}</DateLine>
                    </>
                  );
                })()}

              {item.type === 'reward' && (
                <>
                  {item.category && (
                    <RewardBadge category={item.category}>
                      {categoryLabel[item.category]}
                    </RewardBadge>
                  )}
                  {item.category === 'target' && item.targetMeta ? (
                    (() => {
                      const { myScore, target, special } = item.targetMeta;
                      const achievedVariant = special ? 'special' : 'regular';
                      const diff = myScore - target;
                      return (
                        <>
                          <TargetScoreRow>
                            <TargetScoreBox variant="goal">
                              <TargetScoreLabel variant="goal">
                                목표
                              </TargetScoreLabel>
                              <TargetScoreValue variant="goal">
                                {target}
                                <TargetScoreUnit>점</TargetScoreUnit>
                              </TargetScoreValue>
                            </TargetScoreBox>
                            <TargetArrow>→</TargetArrow>
                            <TargetScoreBox variant={achievedVariant}>
                              <TargetScoreLabel variant={achievedVariant}>
                                달성
                              </TargetScoreLabel>
                              <TargetScoreValue variant={achievedVariant}>
                                {myScore}
                                <TargetScoreUnit>점</TargetScoreUnit>
                              </TargetScoreValue>
                            </TargetScoreBox>
                          </TargetScoreRow>
                          <TargetDelta special={special}>
                            {special
                              ? '정확히 목표 달성!'
                              : `+${diff}점 초과 달성`}
                          </TargetDelta>
                        </>
                      );
                    })()
                  ) : (
                    <Desc>{item.description}</Desc>
                  )}
                  <DateLine>{formatDate(item.date)}</DateLine>
                </>
              )}

              {item.type === 'league' &&
                (() => {
                  const myStatus =
                    item.result === 'win'
                      ? 'winner'
                      : item.result === 'lose'
                        ? 'loser'
                        : 'neutral';
                  const oppStatus =
                    item.result === 'win'
                      ? 'loser'
                      : item.result === 'lose'
                        ? 'winner'
                        : 'neutral';
                  return (
                    <>
                      <TeamsRow>
                        <TeamBlock status={myStatus}>
                          <TeamLabelRow>
                            <TeamLabel status={myStatus}>우리 팀</TeamLabel>
                            <TeamScoreNum status={myStatus}>
                              {item.myTotalScore}
                            </TeamScoreNum>
                          </TeamLabelRow>
                          {item.myTeam.length > 0 && <TeamDivider />}
                          {item.myTeam.map((p) => (
                            <LeaguePlayerRow key={p.empId}>
                              <span>{p.name}</span>
                              <ScoreGroup>
                                <ScoreVal>{p.scores[0] || '–'}</ScoreVal>
                                <ScoreSep>/</ScoreSep>
                                <LeaguePlayerScore status={myStatus}>
                                  {p.scores[1] || '–'}
                                </LeaguePlayerScore>
                              </ScoreGroup>
                            </LeaguePlayerRow>
                          ))}
                        </TeamBlock>
                        <TeamBlock status={oppStatus}>
                          <TeamLabelRow>
                            <TeamLabel status={oppStatus}>상대 팀</TeamLabel>
                            <TeamScoreNum status={oppStatus}>
                              {item.opponentTotalScore}
                            </TeamScoreNum>
                          </TeamLabelRow>
                          {item.opponentTeam.length > 0 && <TeamDivider />}
                          {item.opponentTeam.map((p) => (
                            <LeaguePlayerRow key={p.empId}>
                              <span>{p.name}</span>
                              <ScoreGroup>
                                <ScoreVal>{p.scores[0] || '–'}</ScoreVal>
                                <ScoreSep>/</ScoreSep>
                                <LeaguePlayerScore status={oppStatus}>
                                  {p.scores[1] || '–'}
                                </LeaguePlayerScore>
                              </ScoreGroup>
                            </LeaguePlayerRow>
                          ))}
                        </TeamBlock>
                      </TeamsRow>
                      <DateLine>{formatDate(item.date)}</DateLine>
                    </>
                  );
                })()}

              {item.type === 'activity' &&
                (item.stats ? (
                  <StatsGrid>
                    <StatItem kind="photos">
                      <StatEmoji>📷</StatEmoji>
                      <StatValue kind="photos">{item.stats.photos}</StatValue>
                      <StatLabel>사진</StatLabel>
                    </StatItem>
                    <StatItem kind="likes">
                      <StatEmoji>❤️</StatEmoji>
                      <StatValue kind="likes">{item.stats.likes}</StatValue>
                      <StatLabel>좋아요</StatLabel>
                    </StatItem>
                    <StatItem kind="comments">
                      <StatEmoji>💬</StatEmoji>
                      <StatValue kind="comments">
                        {item.stats.comments}
                      </StatValue>
                      <StatLabel>댓글</StatLabel>
                    </StatItem>
                    <StatItem kind="achievements">
                      <StatEmoji>🏆</StatEmoji>
                      <StatValue kind="achievements">
                        {item.stats.achievements}
                      </StatValue>
                      <StatLabel>업적</StatLabel>
                    </StatItem>
                  </StatsGrid>
                ) : (
                  <Desc>{item.description}</Desc>
                ))}
            </Content>
          </Sheet>
        </SheetWrapper>
      )}
    </AnimatePresence>
  );
};

export default ActivityBottomSheet;
