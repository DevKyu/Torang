import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  submitScoreGuessVote,
  deleteScoreGuessVote,
  markCheerRead,
} from '../../hooks/useScoreGuessMission';
import type { ScoreGuessMissionData, ScoreGuessVote } from '../../hooks/useMission';
import { useScrollFade } from '../../hooks/useScrollFade';
import VoterCardItem from './VoterCardItem';
import PredictScoreModal from './PredictScoreModal';
import ScoreGuessResultModal, {
  type ScoreGuessResultSection,
} from './ScoreGuessResultModal';
import CheerMessagesModal from './CheerMessagesModal';
import { renderMissionBody } from './missionBody';
import {
  CheerTriggerBtn,
  VoteTriggerBtn,
  PreviewInfoArea,
  TargetScoreRow,
  TargetScoreRank,
  TargetScoreName,
  TargetScoreValue,
} from '../../styles/mission/ScoreGuessMissionStyle';
import {
  VotingInstruction,
  VoteListWrapper,
  VoteListArea,
  SubmitBtn,
  AlreadyVotedBox,
  VotedStateArea,
  VotedEmoji,
  VotedName,
  VotedHeadline,
  VotedSub,
  SectionLabel,
  ResultRevealCard,
  ResultRole,
  ResultName,
  VoteActionRow,
  VoteResultBtn,
  MissionCard,
  CardTitle,
  ResultRevealRow,
} from '../../styles/mission/MissionStyle';

const MEDALS = ['🥇', '🥈', '🥉'] as const;

type Props = {
  ym: string;
  viewState: 'preview' | 'voting' | 'revealed';
  data: ScoreGuessMissionData;
  myEmpId: string;
  myVote?: ScoreGuessVote;
  allNames: Record<string, string>;
  participants: string[];
};

const ScoreGuessMissionView = ({
  ym,
  viewState,
  data,
  myEmpId,
  myVote,
  allNames,
  participants,
}: Props) => {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [predictModalOpen, setPredictModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultSections, setResultSections] = useState<ScoreGuessResultSection[]>([]);
  const [voteScreenOpen, setVoteScreenOpen] = useState(false);
  const [changingVote, setChangingVote] = useState(false);
  const [cheerModalOpen, setCheerModalOpen] = useState(false);
  const scoreListRef = useRef<HTMLDivElement>(null);
  const voteListRef = useRef<HTMLDivElement>(null);

  const targets = useMemo(() => data.targets?.empIds ?? [], [data.targets]);
  const isParticipant = myEmpId ? participants.includes(myEmpId) : false;
  const isTarget = !!myEmpId && targets.includes(myEmpId);
  const votingActive = viewState === 'voting' || viewState === 'preview';

  const sortedTargets = useMemo(
    () =>
      votingActive && isParticipant && !isTarget
        ? [...targets].sort((a, b) =>
            (allNames[a] ?? a).localeCompare(allNames[b] ?? b, 'ko'),
          )
        : [],
    [votingActive, isParticipant, isTarget, targets, allNames],
  );

  const voteListFaded = useScrollFade(voteListRef, votingActive && voteScreenOpen, [
    sortedTargets,
  ]);

  const handlePredictSubmit = async (
    predictedScore: number,
    message: string,
    anonymous: boolean,
  ) => {
    if (!myEmpId || !selectedTarget) return;
    setSubmitting(true);
    try {
      await submitScoreGuessVote(
        ym,
        myEmpId,
        selectedTarget,
        predictedScore,
        message,
        anonymous,
      );
      setPredictModalOpen(false);
    } catch {
      toast.error('예측 제출 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteChange = async () => {
    if (!myEmpId) return;
    setChangingVote(true);
    try {
      await deleteScoreGuessVote(ym, myEmpId);
      setSelectedTarget('');
    } catch {
      toast.error('예측 변경 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setChangingVote(false);
    }
  };

  const result = data.result;
  const votes = useMemo(() => data.votes ?? {}, [data.votes]);

  const myCheerMessages = useMemo(
    () =>
      isTarget && myEmpId
        ? Object.entries(votes)
            .filter(([, vote]) => vote.targetEmpId === myEmpId && vote.message)
            .map(([voterEmpId, vote]) => ({
              senderName: vote.anonymous
                ? '익명의 회원'
                : (allNames[voterEmpId] ?? voterEmpId),
              message: vote.message ?? '',
            }))
        : [],
    [isTarget, myEmpId, votes, allNames],
  );

  const correctSet = useMemo(
    () => new Set(result?.correctVoters ?? []),
    [result],
  );

  const buildSection = (targetId: string): ScoreGuessResultSection => {
    const actualScore = result?.actualScores?.[targetId];
    const voters = Object.entries(votes)
      .filter(([, vote]) => vote.targetEmpId === targetId)
      .map(([voterEmpId, vote]) => ({
        empId: voterEmpId,
        name: allNames[voterEmpId] ?? voterEmpId,
        predictedScore: vote.predictedScore,
        correct: correctSet.has(voterEmpId),
        isMine: voterEmpId === myEmpId,
      }))
      .sort(
        (a, b) =>
          Math.abs(a.predictedScore - (actualScore ?? 0)) -
          Math.abs(b.predictedScore - (actualScore ?? 0)),
      );
    return {
      targetEmpId: targetId,
      targetName: allNames[targetId] ?? targetId,
      actualScore,
      voters,
    };
  };

  const openResultModal = (sections: ScoreGuessResultSection[]) => {
    setResultSections(sections);
    setResultModalOpen(true);
  };

  const rankedTargets = useMemo(
    () =>
      [...targets]
        .map((id): [string, number | undefined] => [id, result?.actualScores?.[id]])
        .sort(([, a], [, b]) => (b ?? -1) - (a ?? -1)),
    [targets, result],
  );

  const scoreListFaded = useScrollFade(scoreListRef, viewState === 'revealed', [rankedTargets]);

  const contentKey = votingActive
    ? !isParticipant
      ? 'no-access'
      : isTarget
        ? voteScreenOpen
          ? 'target-detail'
          : 'target-intro'
        : !voteScreenOpen
          ? 'vote-trigger'
          : myVote
            ? 'voted'
            : 'voting'
    : viewState;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          {votingActive && !voteScreenOpen && contentKey !== 'no-access' && (
            <PreviewInfoArea>
              {viewState === 'preview' && (
                <>
                  <SectionLabel>이달의 미션</SectionLabel>
                  <MissionCard>
                    {data.config?.title && <CardTitle>{data.config.title}</CardTitle>}
                    {data.config?.description && renderMissionBody(data.config.description)}
                  </MissionCard>
                </>
              )}
              {isTarget && (
                <VoteTriggerBtn
                  onClick={() => {
                    setVoteScreenOpen(true);
                    if (myEmpId) {
                      markCheerRead(ym, myEmpId, myCheerMessages.length).catch(
                        () => {},
                      );
                    }
                  }}
                >
                  🎉 나의 미션 확인하기
                </VoteTriggerBtn>
              )}
              {isParticipant && !isTarget && (
                <VoteTriggerBtn onClick={() => setVoteScreenOpen(true)}>
                  🎯 신규회원 점수 예측하기
                </VoteTriggerBtn>
              )}
            </PreviewInfoArea>
          )}

          {contentKey === 'no-access' && (
            <VotedStateArea>
              <AlreadyVotedBox>
                <VotedEmoji>🚫</VotedEmoji>
                <VotedHeadline>이달의 활동에 참여하지 않았습니다</VotedHeadline>
                <VotedSub>미션은 활동 참여자만 할 수 있어요</VotedSub>
              </AlreadyVotedBox>
            </VotedStateArea>
          )}

          {contentKey === 'target-detail' && (
            <VotedStateArea>
              <AlreadyVotedBox>
                <VotedEmoji>🎉</VotedEmoji>
                <VotedHeadline>이달의 미션 주인공이에요!</VotedHeadline>
                <VotedSub>
                  {myCheerMessages.length === 0 ? (
                    '또랑 첫 활동, 응원할게요'
                  ) : (
                    <>
                      <strong>{myCheerMessages.length}명</strong>의 회원이 나를
                      응원하고 있어요
                    </>
                  )}
                </VotedSub>
              </AlreadyVotedBox>
              {myCheerMessages.length > 0 && (
                <VoteActionRow>
                  <CheerTriggerBtn onClick={() => setCheerModalOpen(true)}>
                    💌 응원 메시지 보기
                  </CheerTriggerBtn>
                </VoteActionRow>
              )}
            </VotedStateArea>
          )}

          {contentKey === 'voted' && (
            <VotedStateArea>
              <AlreadyVotedBox>
                <VotedEmoji>🎯</VotedEmoji>
                <VotedName>
                  <strong>{allNames[myVote?.targetEmpId ?? ''] ?? myVote?.targetEmpId}</strong>님을{' '}
                  <strong>{myVote?.predictedScore}점</strong>으로 예측했어요!
                </VotedName>
                <VotedSub>결과는 활동 후 확인할 수 있어요</VotedSub>
              </AlreadyVotedBox>
              <VoteActionRow>
                <VoteResultBtn onClick={handleVoteChange} disabled={changingVote}>
                  {changingVote ? '변경 중...' : '예측 변경하기'}
                </VoteResultBtn>
              </VoteActionRow>
            </VotedStateArea>
          )}

          {contentKey === 'voting' && (
            <>
              <VotingInstruction>
                이번 달 신규회원의 점수는 몇 점일까요?
              </VotingInstruction>
              <VoteListWrapper faded={voteListFaded}>
                <VoteListArea ref={voteListRef}>
                  {sortedTargets.map((id, index) => (
                    <VoterCardItem
                      key={id}
                      id={id}
                      index={index}
                      name={allNames[id] ?? id}
                      selected={selectedTarget === id}
                      onSelect={(v) =>
                        setSelectedTarget((prev) => (prev === v ? '' : v))
                      }
                    />
                  ))}
                </VoteListArea>
              </VoteListWrapper>
              <SubmitBtn
                onClick={() => setPredictModalOpen(true)}
                disabled={!selectedTarget}
              >
                점수 예측하기
              </SubmitBtn>
            </>
          )}

          {viewState === 'revealed' && (
            <>
              <SectionLabel>신규회원 점수 공개</SectionLabel>
              <VoteListWrapper faded={scoreListFaded} fadeHeight={32} marginBottom={10}>
                <VoteListArea ref={scoreListRef}>
                  {rankedTargets.map(([id, score], index) => {
                    const rewarded = result?.topTargets?.includes(id) ?? false;
                    return (
                      <TargetScoreRow
                        key={id}
                        onClick={() => openResultModal([buildSection(id)])}
                      >
                        <TargetScoreRank rank={index + 1}>
                          {MEDALS[index] ?? (rewarded ? '🏅' : index + 1)}
                        </TargetScoreRank>
                        <TargetScoreName>{allNames[id] ?? id}</TargetScoreName>
                        <TargetScoreValue>{score ?? '-'}점</TargetScoreValue>
                        <ChevronRight size={16} color="#93c5fd" strokeWidth={2.5} />
                      </TargetScoreRow>
                    );
                  })}
                </VoteListArea>
              </VoteListWrapper>

              {result && (
                <ResultRevealRow>
                  <ResultRevealCard role="reward">
                    <ResultRole role="reward">예측 성공</ResultRole>
                    <ResultName style={{ fontSize: 15 }}>
                      {(result.correctVoters ?? []).length}명
                    </ResultName>
                  </ResultRevealCard>
                  <ResultRevealCard role="reward">
                    <ResultRole role="reward">우수 점수 보상</ResultRole>
                    <ResultName style={{ fontSize: 15 }}>
                      {(result.topTargets ?? []).length}명
                    </ResultName>
                  </ResultRevealCard>
                </ResultRevealRow>
              )}

              <VoteActionRow>
                <VoteResultBtn
                  onClick={() =>
                    openResultModal(rankedTargets.map(([id]) => buildSection(id)))
                  }
                >
                  전체 예측 결과 보기
                </VoteResultBtn>
              </VoteActionRow>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <PredictScoreModal
        isOpen={predictModalOpen}
        onClose={() => setPredictModalOpen(false)}
        targetName={allNames[selectedTarget] ?? selectedTarget}
        onSubmit={handlePredictSubmit}
        submitting={submitting}
      />

      <ScoreGuessResultModal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        sections={resultSections}
      />

      <CheerMessagesModal
        isOpen={cheerModalOpen}
        onClose={() => setCheerModalOpen(false)}
        messages={myCheerMessages}
      />
    </>
  );
};

export default ScoreGuessMissionView;
