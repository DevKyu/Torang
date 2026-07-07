import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { submitVote } from '../../hooks/useMission';
import type { VillainMissionData } from '../../hooks/useMission';
import { useScrollFade } from '../../hooks/useScrollFade';
import VoterCardItem from './VoterCardItem';
import HiddenMissionModal from './HiddenMissionModal';
import VoteResultModal from './VoteResultModal';
import CorrectVotersModal from './CorrectVotersModal';
import VillainMissionModal from './VillainMissionModal';
import {
  HiddenMissionBtn,
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
  ResultRevealRow,
  ResultRevealCard,
  ResultRole,
  ResultName,
  ResultMeta,
  VoteResultBtn,
  VoteActionRow,
  VoterListBtn,
  SectionLabel,
} from '../../styles/mission/MissionStyle';

type Props = {
  ym: string;
  viewState: 'preview' | 'voting' | 'revealed';
  data: VillainMissionData;
  myEmpId: string;
  myVote?: string;
  allNames: Record<string, string>;
  participants: string[];
};

const VillainMissionView = ({
  ym,
  viewState,
  data,
  myEmpId,
  myVote,
  allNames,
  participants,
}: Props) => {
  const [selectedVote, setSelectedVote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [votersModalOpen, setVotersModalOpen] = useState(false);
  const [villainMissionOpen, setVillainMissionOpen] = useState(false);
  const hasAutoOpenedRef = useRef(false);
  const voteListRef = useRef<HTMLDivElement>(null);

  const isParticipant = myEmpId ? participants.includes(myEmpId) : false;
  const isVillain = !!myEmpId && data.roles?.villain === myEmpId;
  const isHelper = !!myEmpId && data.roles?.helper === myEmpId;
  const myRole: 'villain' | 'helper' | null = isVillain
    ? 'villain'
    : isHelper
      ? 'helper'
      : null;

  useEffect(() => {
    if (viewState !== 'preview' || !myRole || hasAutoOpenedRef.current) return;
    const t = setTimeout(() => {
      hasAutoOpenedRef.current = true;
      setModalOpen(true);
    }, 800);
    return () => clearTimeout(t);
  }, [viewState, myRole]);

  const sortedParticipants = useMemo(
    () =>
      viewState === 'voting' && isParticipant
        ? participants
            .filter((id) => id !== myEmpId)
            .filter((id) => !(isHelper && id === data.roles?.villain))
            .sort((a, b) =>
              (allNames[a] ?? a).localeCompare(allNames[b] ?? b, 'ko'),
            )
        : [],
    [viewState, isParticipant, participants, myEmpId, isHelper, data.roles?.villain, allNames],
  );

  const voteListFaded = useScrollFade(voteListRef, viewState === 'voting', [sortedParticipants]);

  const handleVoteSubmit = async () => {
    if (!selectedVote || !myEmpId) return;
    setSubmitting(true);
    try {
      await submitVote(ym, myEmpId, selectedVote);
      toast('✅ 투표가 완료되었습니다.', {
        position: 'top-center',
        duration: 2000,
        style: {
          backgroundColor: '#f0fdf4',
          color: '#065f46',
          borderRadius: '10px',
        },
      });
    } catch {
      toast.error('투표 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  const result = data.result;
  const votes = data.votes ?? {};
  const villainId = data.roles?.villain ?? '';
  const helperId = data.roles?.helper ?? '';

  const contentKey =
    viewState === 'voting'
      ? !isParticipant
        ? 'no-access'
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
          {viewState === 'preview' && myRole && data.hidden?.[myRole] && (
            <HiddenMissionBtn role={myRole} onClick={() => setModalOpen(true)}>
              {myRole === 'villain'
                ? '🎭 나의 히든 미션 보기'
                : '🤝 나의 히든 미션 보기'}
            </HiddenMissionBtn>
          )}

          {viewState === 'voting' &&
            (!isParticipant ? (
              <VotedStateArea>
                <AlreadyVotedBox>
                  <VotedEmoji>🚫</VotedEmoji>
                  <VotedHeadline>이달의 활동에 참여하지 않았습니다</VotedHeadline>
                  <VotedSub>투표는 활동 참여자만 할 수 있어요</VotedSub>
                </AlreadyVotedBox>
              </VotedStateArea>
            ) : myVote ? (
              <VotedStateArea>
                <AlreadyVotedBox>
                  <VotedEmoji>🎯</VotedEmoji>
                  <VotedName>
                    <strong>{allNames[myVote] ?? myVote}</strong>님에게
                    투표했습니다
                  </VotedName>
                  <VotedSub>결과는 공개 후 확인할 수 있어요</VotedSub>
                </AlreadyVotedBox>
              </VotedStateArea>
            ) : (
              <>
                <VotingInstruction>
                  {isVillain || isHelper
                    ? '의심받지 않게 투표해주세요'
                    : '이번 활동의 또랑 빌런은 누구였을까요?'}
                </VotingInstruction>
                <VoteListWrapper faded={voteListFaded}>
                  <VoteListArea ref={voteListRef}>
                    {sortedParticipants.map((id, index) => (
                      <VoterCardItem
                        key={id}
                        id={id}
                        index={index}
                        name={allNames[id] ?? id}
                        selected={selectedVote === id}
                        onSelect={(v) =>
                          setSelectedVote((prev) => (prev === v ? '' : v))
                        }
                      />
                    ))}
                  </VoteListArea>
                </VoteListWrapper>
                <SubmitBtn
                  onClick={handleVoteSubmit}
                  disabled={!selectedVote || submitting}
                >
                  {submitting ? '투표 중...' : '투표하기'}
                </SubmitBtn>
              </>
            ))}

          {viewState === 'revealed' && (
            <>
              <SectionLabel>또랑 빌런 공개</SectionLabel>

              <ResultRevealRow>
                <ResultRevealCard role="villain">
                  <ResultRole role="villain">또랑 빌런</ResultRole>
                  <ResultName>{allNames[villainId] ?? villainId}</ResultName>
                  <ResultMeta>
                    {result?.villainWon
                      ? '모두를 속였습니다 😈'
                      : '정체 발각! 🔍'}
                  </ResultMeta>
                </ResultRevealCard>

                <ResultRevealCard role="helper">
                  <ResultRole role="helper">빌런 조력자</ResultRole>
                  <ResultName>{allNames[helperId] ?? helperId}</ResultName>
                  <ResultMeta>
                    {result?.helperWon ? '공동 수상 🎉' : '함께 속였습니다 😈'}
                  </ResultMeta>
                </ResultRevealCard>
              </ResultRevealRow>

              {result?.villainWon && !result.helperWon && (
                <ResultRevealCard role="reward">
                  <ResultRole role="reward">빌런 생존 🎭</ResultRole>
                  <ResultName style={{ fontSize: 15 }}>
                    {allNames[villainId] ?? villainId}
                  </ResultName>
                </ResultRevealCard>
              )}

              {result?.villainWon && result.helperWon && (
                <ResultRevealCard role="reward">
                  <ResultRole role="reward">공동 보상 🎉</ResultRole>
                  <ResultName style={{ fontSize: 15 }}>
                    {allNames[villainId] ?? villainId} +{' '}
                    {allNames[helperId] ?? helperId}
                  </ResultName>
                </ResultRevealCard>
              )}

              {!result?.villainWon &&
                result &&
                (result.correctVoters?.length ?? 0) > 0 && (
                  <ResultRevealCard role="reward">
                    <ResultRole role="reward">정답 투표자</ResultRole>
                    <ResultName style={{ fontSize: 15 }}>
                      {(result.correctVoters ?? []).length}명
                    </ResultName>
                    <VoterListBtn onClick={() => setVotersModalOpen(true)}>
                      명단 보기
                    </VoterListBtn>
                  </ResultRevealCard>
                )}

              <VoteActionRow>
                <VoteResultBtn onClick={() => setVoteModalOpen(true)}>
                  투표 결과 보기
                </VoteResultBtn>
                {data.hidden?.villain && (
                  <VoteResultBtn onClick={() => setVillainMissionOpen(true)}>
                    빌런 미션 보기
                  </VoteResultBtn>
                )}
              </VoteActionRow>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {viewState === 'revealed' && data.roles && (
        <VoteResultModal
          isOpen={voteModalOpen}
          onClose={() => setVoteModalOpen(false)}
          votes={votes}
          roles={data.roles}
          allNames={allNames}
          myVote={myVote}
        />
      )}
      {viewState === 'revealed' &&
        result &&
        (result.correctVoters?.length ?? 0) > 0 && (
          <CorrectVotersModal
            isOpen={votersModalOpen}
            onClose={() => setVotersModalOpen(false)}
            correctVoters={result.correctVoters}
            allNames={allNames}
          />
        )}
      {viewState === 'revealed' && data.hidden?.villain && (
        <VillainMissionModal
          isOpen={villainMissionOpen}
          onClose={() => setVillainMissionOpen(false)}
          hidden={data.hidden.villain}
        />
      )}
      {viewState === 'preview' && myRole && data.hidden?.[myRole] && (
        <HiddenMissionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          role={myRole}
          hidden={data.hidden[myRole]!}
        />
      )}
    </>
  );
};

export default VillainMissionView;
