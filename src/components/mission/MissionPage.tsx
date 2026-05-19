import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get } from 'firebase/database';
import { toast } from 'sonner';
import Layout from '../layouts/Layout';
import { SmallText } from '../../styles/commonStyle';
import { db } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { useMission, submitVote } from '../../hooks/useMission';
import HiddenMissionModal from './HiddenMissionModal';
import VoteResultModal from './VoteResultModal';
import CorrectVotersModal from './CorrectVotersModal';
import VillainMissionModal from './VillainMissionModal';
import {
  MissionCard,
  CardTitle,
  HtmlBody,
  PlainBody,
  SectionLabel,
  HiddenMissionBtn,
  VotingInstruction,
  VoteListWrapper,
  VoteListArea,
  VoterCard,
  VoteCheckmark,
  SubmitBtn,
  AlreadyVotedBox,
  VotedEmoji,
  VotedName,
  VotedSub,
  ResultRevealCard,
  ResultRole,
  ResultName,
  ResultMeta,
  VoteResultBtn,
  VoterListBtn,
  PinAmount,
  LoadingText,
  MyVoteResult,
  UpcomingCard,
  UpcomingDays,
  UpcomingLabel,
} from '../../styles/MissionStyle';

const renderBody = (content: string) =>
  content.includes('<') ? (
    <HtmlBody dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <PlainBody>{content}</PlainBody>
  );

const MissionPage = () => {
  const navigate = useNavigate();

  const currentYm = useMemo(() => {
    const now = useUiStore.getState().getServerNow();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const { data, myEmpId, myVote, loading } = useMission(currentYm);
  const [activityDateNum, setActivityDateNum] = useState<number | null>(null);
  const [allNames, setAllNames] = useState<Record<string, string>>({});
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [votersModalOpen, setVotersModalOpen] = useState(false);
  const [villainMissionOpen, setVillainMissionOpen] = useState(false);
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    const year = currentYm.slice(0, 4);
    const month = String(Number(currentYm.slice(4)));

    Promise.all([
      get(ref(db, `activityDate/${year}/${month}`)),
      get(ref(db, 'names')),
      get(ref(db, `activityParticipants/${year}/${month}`)),
    ])
      .then(([dateSnap, namesSnap, participantsSnap]) => {
        if (dateSnap.exists()) setActivityDateNum(dateSnap.val() as number);
        if (namesSnap.exists())
          setAllNames(namesSnap.val() as Record<string, string>);
        if (participantsSnap.exists())
          setParticipants(
            Object.keys(participantsSnap.val() as Record<string, true>),
          );
        setParticipantsLoaded(true);
      })
      .catch(() => {
        setParticipantsLoaded(true);
      });
  }, [currentYm]);

  const daysUntilReveal = useMemo(() => {
    if (!activityDateNum || !data?.config) return null;
    const revealDays = data.config.revealDays ?? 7;
    const n = activityDateNum;
    const y = Math.floor(n / 10000);
    const m = Math.floor((n % 10000) / 100) - 1;
    const d = n % 100;
    const revealTimestamp = new Date(y, m, d).getTime() - revealDays * 86400000;
    const now = useUiStore.getState().getServerNow().getTime();
    return Math.ceil((revealTimestamp - now) / 86400000);
  }, [activityDateNum, data]);

  const viewState = useMemo(() => {
    if (!data?.config || data.config.status === 'draft') return 'empty';
    const status = data.config.status;
    if (status === 'revealed') return 'revealed';
    if (status === 'voting') return 'voting';
    if (daysUntilReveal !== null && daysUntilReveal > 0) return 'upcoming';
    return 'preview';
  }, [data, daysUntilReveal]);

  const isParticipant = myEmpId ? participants.includes(myEmpId) : false;

  const isVillain = !!myEmpId && data?.roles?.villain === myEmpId;
  const isHelper = !!myEmpId && data?.roles?.helper === myEmpId;
  const myRole: 'villain' | 'helper' | null = isVillain
    ? 'villain'
    : isHelper
      ? 'helper'
      : null;

  useEffect(() => {
    if (
      viewState === 'preview' &&
      myRole &&
      !loading &&
      !hasAutoOpenedRef.current
    ) {
      hasAutoOpenedRef.current = true;
      const t = setTimeout(() => setModalOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [viewState, myRole, loading]);

  const handleVoteSubmit = async () => {
    if (!selectedVote || !myEmpId) return;
    setSubmitting(true);
    try {
      await submitVote(currentYm, myEmpId, selectedVote);
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

  const isVotingLoading =
    viewState === 'voting' && (loading || !participantsLoaded);

  const sortedParticipants =
    viewState === 'voting' && !isVotingLoading && isParticipant
      ? participants
          .filter((id) => id !== myEmpId)
          .filter((id) => !(isHelper && id === data?.roles?.villain))
          .sort((a, b) =>
            (allNames[a] ?? a).localeCompare(allNames[b] ?? b, 'ko'),
          )
      : [];

  const result = data?.result;
  const votes = data?.votes ?? {};
  const villainId = data?.roles?.villain ?? '';
  const helperId = data?.roles?.helper ?? '';
  const myVoteCorrect = myVote === villainId;

  const pageTitle = viewState === 'voting' ? '또랑 빌런 투표' : '활동 미션';

  const contentKey =
    loading || isVotingLoading
      ? 'loading'
      : viewState === 'voting'
        ? !isParticipant
          ? 'no-access'
          : myVote
            ? 'voted'
            : 'voting'
        : viewState;

  return (
    <Layout title={pageTitle} maxWidth="480px">
      <AnimatePresence mode="wait">
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {(loading || isVotingLoading) && (
            <LoadingText>불러오는 중...</LoadingText>
          )}

          {!loading &&
            viewState === 'voting' &&
            !isVotingLoading &&
            (!isParticipant ? (
              <AlreadyVotedBox>
                <VotedEmoji>🚫</VotedEmoji>
                <VotedName>이달의 활동에 참여하지 않았습니다</VotedName>
                <VotedSub>투표는 활동 참여자만 할 수 있어요</VotedSub>
              </AlreadyVotedBox>
            ) : myVote ? (
              <AlreadyVotedBox>
                <VotedEmoji>🎯</VotedEmoji>
                <VotedName>
                  <strong>{allNames[myVote] ?? myVote}</strong>님에게
                  투표했습니다
                </VotedName>
                <VotedSub>결과는 공개 후 확인할 수 있어요</VotedSub>
              </AlreadyVotedBox>
            ) : (
              <>
                <VotingInstruction>
                  {isVillain || isHelper
                    ? '의심받지 않게 투표해주세요'
                    : '이번 활동의 또랑 빌런은 누구였을까요?'}
                </VotingInstruction>
                <VoteListWrapper>
                  <VoteListArea>
                    {sortedParticipants.map((id) => (
                      <VoterCard
                        key={id}
                        selected={selectedVote === id}
                        onClick={() =>
                          setSelectedVote((prev) => (prev === id ? '' : id))
                        }
                        whileTap={{ scale: 0.98 }}
                      >
                        {allNames[id] ?? id}
                        <VoteCheckmark
                          style={{ opacity: selectedVote === id ? 1 : 0 }}
                        >
                          ✓
                        </VoteCheckmark>
                      </VoterCard>
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

          {!loading && viewState === 'revealed' && (
            <>
              <SectionLabel>또랑 빌런 공개</SectionLabel>

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

              {result?.villainWon && !result.helperWon && (
                <ResultRevealCard role="reward">
                  <ResultRole role="reward">빌런 생존 🎭</ResultRole>
                  <ResultName style={{ fontSize: 15 }}>
                    {allNames[villainId] ?? villainId}
                  </ResultName>
                  <PinAmount>+{data!.config!.rewardPin} PIN 지급</PinAmount>
                </ResultRevealCard>
              )}

              {result?.villainWon && result.helperWon && (
                <ResultRevealCard role="reward">
                  <ResultRole role="reward">공동 보상 🎉</ResultRole>
                  <ResultName style={{ fontSize: 15 }}>
                    {allNames[villainId] ?? villainId} +{' '}
                    {allNames[helperId] ?? helperId}
                  </ResultName>
                  <PinAmount>+{data!.config!.rewardPin} PIN 지급</PinAmount>
                </ResultRevealCard>
              )}

              {!result?.villainWon &&
                result &&
                (result.correctVoters?.length ?? 0) > 0 && (
                  <ResultRevealCard role="reward">
                    <ResultRole role="reward">정답 투표자</ResultRole>
                    <ResultName style={{ fontSize: 15 }}>
                      {(result.correctVoters ?? []).length}명 적중
                    </ResultName>
                    <PinAmount>+{data!.config!.rewardPin} PIN 지급</PinAmount>
                    <VoterListBtn onClick={() => setVotersModalOpen(true)}>
                      명단 보기
                    </VoterListBtn>
                  </ResultRevealCard>
                )}

              <VoteResultBtn onClick={() => setVoteModalOpen(true)}>
                투표 현황 보기 ({Object.keys(votes).length}명 참여)
              </VoteResultBtn>

              {data?.hidden?.villain && (
                <VoteResultBtn onClick={() => setVillainMissionOpen(true)}>
                  빌런 미션 보기
                </VoteResultBtn>
              )}

              {myVote && (
                <MyVoteResult correct={myVoteCorrect}>
                  내 투표: {allNames[myVote] ?? myVote} —{' '}
                  {myVoteCorrect ? '맞혔어요 🎉' : '속았어요 🥲'}
                </MyVoteResult>
              )}
            </>
          )}

          {!loading && viewState === 'empty' && (
            <MissionCard>
              <CardTitle>이달의 미션</CardTitle>
              <PlainBody style={{ color: '#9ca3af', textAlign: 'center' }}>
                이달의 미션을 준비중입니다.
              </PlainBody>
            </MissionCard>
          )}

          {!loading && viewState === 'upcoming' && (
            <UpcomingCard>
              <UpcomingDays>D-{daysUntilReveal}</UpcomingDays>
              <UpcomingLabel>
                이달의 미션이 {daysUntilReveal}일 후 공개됩니다.
              </UpcomingLabel>
            </UpcomingCard>
          )}

          {!loading && viewState === 'preview' && (
            <>
              <SectionLabel>이달의 미션</SectionLabel>
              <MissionCard>
                {data!.config!.title && (
                  <CardTitle>{data!.config!.title}</CardTitle>
                )}
                {renderBody(data!.config!.description)}
              </MissionCard>

              {myRole && data?.hidden?.[myRole] && (
                <HiddenMissionBtn
                  role={myRole}
                  onClick={() => setModalOpen(true)}
                >
                  {myRole === 'villain'
                    ? '🎭 나의 히든 미션 보기'
                    : '🤝 나의 히든 미션 보기'}
                </HiddenMissionBtn>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {viewState === 'revealed' && data?.roles && (
        <VoteResultModal
          isOpen={voteModalOpen}
          onClose={() => setVoteModalOpen(false)}
          votes={votes}
          roles={data.roles}
          allNames={allNames}
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
      {viewState === 'revealed' && data?.hidden?.villain && (
        <VillainMissionModal
          isOpen={villainMissionOpen}
          onClose={() => setVillainMissionOpen(false)}
          hidden={data.hidden.villain}
        />
      )}
      {viewState === 'preview' && myRole && data?.hidden?.[myRole] && (
        <HiddenMissionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          role={myRole}
          hidden={data.hidden[myRole]!}
        />
      )}

      <SmallText
        top="middle"
        onClick={() => navigate('/menu', { replace: true })}
      >
        돌아가기
      </SmallText>
    </Layout>
  );
};

export default MissionPage;
