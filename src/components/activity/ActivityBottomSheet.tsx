import {
  AnimatePresence,
  animate,
  useMotionValue,
  useDragControls,
  type PanInfo,
} from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import type { ActivityItem } from '../../types/activity';
import {
  Backdrop,
  Content,
  DateLine,
  Delta,
  Desc,
  DragZone,
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
  TeamDivider,
  TeamLabel,
  TeamLabelRow,
  TeamScoreNum,
  TeamsRow,
  Title,
  LeaguePlayerRow,
  LeaguePlayerScore,
  ScoreGroup,
  ScoreSep,
  ScoreVal,
  TargetArrow,
  TargetDelta,
  TargetScoreBox,
  TargetScoreLabel,
  TargetScoreRow,
  TargetScoreUnit,
  TargetScoreValue,
} from '../../styles/ActivityBottomSheetStyle';

type Props = { open: boolean; item: ActivityItem | null; onClose: () => void };
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

const formatMonth = (ts: number) => `${new Date(ts).getMonth() + 1}월`;
const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const ActivityBottomSheet = ({ open, item, onClose }: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const closingRef = useRef(false);

  const runClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const height = sheetRef.current?.offsetHeight ?? 500;
    animate(y, height, { duration: 0.28, ease: EASE_OUT, onComplete: onClose });
  }, [onClose, y]);

  const resetPosition = useCallback(() => {
    animate(y, 0, { duration: 0.22, ease: EASE_OUT });
  }, [y]);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const scrollTop = contentRef.current?.scrollTop ?? 0;
      if (scrollTop > 5) {
        resetPosition();
        return;
      }
      if (info.offset.y > 100 || info.velocity.y > 500) runClose();
      else resetPosition();
    },
    [resetPosition, runClose],
  );

  useEffect(() => {
    if (!open || !item) return;
    closingRef.current = false;
    y.set(window.innerHeight);
    animate(y, 0, { duration: 0.34, ease: EASE_OUT });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, item, y]);

  if (!open || !item) return null;

  return (
    <AnimatePresence>
      <SheetWrapper
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Backdrop onClick={runClose} />
        <Sheet
          ref={sheetRef}
          style={{ y }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          <DragZone onPointerDown={(e) => dragControls.start(e)}>
            <Handle />
          </DragZone>
          <Content ref={contentRef}>
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
                    const variant = special ? 'special' : 'regular';
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
                          <TargetScoreBox variant={variant}>
                            <TargetScoreLabel variant={variant}>
                              달성
                            </TargetScoreLabel>
                            <TargetScoreValue variant={variant}>
                              {myScore}
                              <TargetScoreUnit>점</TargetScoreUnit>
                            </TargetScoreValue>
                          </TargetScoreBox>
                        </TargetScoreRow>
                        <TargetDelta special={special}>
                          {special
                            ? '정확히 목표 달성!'
                            : `+${myScore - target}점 초과 달성`}
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
                  {(
                    [
                      { k: 'photos', e: '📷', l: '사진' },
                      { k: 'likes', e: '❤️', l: '좋아요' },
                      { k: 'comments', e: '💬', l: '댓글' },
                      { k: 'achievements', e: '🏆', l: '업적' },
                    ] as const
                  ).map((s) => (
                    <StatItem key={s.k} kind={s.k}>
                      <StatEmoji>{s.e}</StatEmoji>
                      <StatValue kind={s.k}>{item.stats![s.k]}</StatValue>
                      <StatLabel>{s.l}</StatLabel>
                    </StatItem>
                  ))}
                </StatsGrid>
              ) : (
                <Desc>{item.description}</Desc>
              ))}
          </Content>
        </Sheet>
      </SheetWrapper>
    </AnimatePresence>
  );
};

export default ActivityBottomSheet;
