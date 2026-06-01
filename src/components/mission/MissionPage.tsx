import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get } from 'firebase/database';
import { toast } from 'sonner';
import { ClipLoader } from 'react-spinners';
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
  ResultRevealRow,
  ResultRevealCard,
  ResultRole,
  ResultName,
  ResultMeta,
  VoteResultBtn,
  VoteActionRow,
  VoterListBtn,
  UpcomingCard,
  UpcomingDays,
  UpcomingLabel,
  MissionLoadingBox,
  MissionEmptyBox,
  MissionEmptyIcon,
  MissionEmptyTitle,
  MissionEmptyDesc,
} from '../../styles/MissionStyle';

type VoterCardItemProps = {
  id: string;
  index: number;
  name: string;
  selected: boolean;
  onSelect: (id: string) => void;
};

const VoterCardItem = ({
  id,
  index,
  name,
  selected,
  onSelect,
}: VoterCardItemProps) => {
  const [entered, setEntered] = useState(false);
  return (
    <VoterCard
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        entered
          ? { duration: 0.12, ease: 'easeOut' }
          : { duration: 0.2, delay: index * 0.06, ease: 'easeOut' }
      }
      onAnimationComplete={() => setEntered(true)}
      whileTap={{ scale: 0.97, transition: { duration: 0.08 } }}
      selected={selected}
      onClick={() => onSelect(id)}
    >
      {name}
      <VoteCheckmark style={{ opacity: selected ? 1 : 0 }}>✓</VoteCheckmark>
    </VoterCard>
  );
};

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
      .catch(() => setParticipantsLoaded(true));
  }, [currentYm]);

  const daysUntilReveal = useMemo(() => {
    if (!activityDateNum || !data?.config) return null;
    const revealDays = data.config.revealDays ?? 7;
    const n = activityDateNum;
    const revealTimestamp =
      new Date(
        Math.floor(n / 10000),
        Math.floor((n % 10000) / 100) - 1,
        n % 100,
      ).getTime() -
      revealDays * 86400000;
    return Math.ceil(
      (revealTimestamp - useUiStore.getState().getServerNow().getTime()) /
        86400000,
    );
  }, [activityDateNum, data]);

  const viewState = useMemo(() => {
    if (!data?.config || data.config.status === 'draft') return 'empty';
    const { status } = data.config;
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
    if (viewState === 'preview' && myRole && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      const t = setTimeout(() => setModalOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [viewState, myRole]);

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

  const isReady = !loading && participantsLoaded;

  const sortedParticipants = useMemo(
    () =>
      viewState === 'voting' && isParticipant
        ? participants
            .filter((id) => id !== myEmpId)
            .filter((id) => !(isHelper && id === data?.roles?.villain))
            .sort((a, b) =>
              (allNames[a] ?? a).localeCompare(allNames[b] ?? b, 'ko'),
            )
        : [],
    [
      viewState,
      isParticipant,
      participants,
      myEmpId,
      isHelper,
      data?.roles?.villain,
      allNames,
    ],
  );

  const result = data?.result;
  const votes = data?.votes ?? {};
  const villainId = data?.roles?.villain ?? '';
  const helperId = data?.roles?.helper ?? '';

  const pageTitle = '활동 미션';

  const contentKey =
    viewState === 'voting'
      ? !isParticipant
        ? 'no-access'
        : myVote
          ? 'voted'
          : 'voting'
      : viewState;

  return (
    <Layout title={pageTitle} maxWidth="480px">
      <AnimatePresence mode="wait">
        {!isReady ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MissionLoadingBox>
              <ClipLoader size={24} color="#9ca3af" />
            </MissionLoadingBox>
          </motion.div>
        ) : (
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          {viewState === 'voting' &&
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
                {data?.hidden?.villain && (
                  <VoteResultBtn onClick={() => setVillainMissionOpen(true)}>
                    빌런 미션 보기
                  </VoteResultBtn>
                )}
              </VoteActionRow>

            </>
          )}

          {viewState === 'empty' && (
            <MissionEmptyBox>
              <MissionEmptyIcon>🤫</MissionEmptyIcon>
              <MissionEmptyTitle>활동 미션 준비중</MissionEmptyTitle>
              <MissionEmptyDesc>완료되면 바로 공개될 예정이에요</MissionEmptyDesc>
            </MissionEmptyBox>
          )}

          {viewState === 'upcoming' && (
            <UpcomingCard>
              <UpcomingDays>D-{daysUntilReveal}</UpcomingDays>
              <UpcomingLabel>
                이달의 미션이 {daysUntilReveal}일 후 공개됩니다.
              </UpcomingLabel>
            </UpcomingCard>
          )}

          {viewState === 'preview' && (
            <>
              <SectionLabel>이달의 미션</SectionLabel>
              <MissionCard>
                {data?.config?.title && (
                  <CardTitle>{data.config.title}</CardTitle>
                )}
                {data?.config?.description &&
                  renderBody(data.config.description)}
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
        )}
      </AnimatePresence>

      {viewState === 'revealed' && data?.roles && (
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
