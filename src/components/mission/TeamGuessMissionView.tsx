import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { toast } from 'sonner';
import { submitTeamGuessVote, deleteTeamGuessVote } from '../../services/teamGuessMission';
import { useUiStore } from '../../stores/useUiStore';
import type { TeamFormationStatus, WinnerMap, ScoreMap } from '../../hooks/useTeamFormation';
import { findGroupIndexForEmpId, getGroupTeamKey, type FormationGroup } from '../../utils/teamFormation';
import type { TeamGuessMissionData, TeamGuessVote } from '../../hooks/useMission';
import TeamGuessRosterCard from './TeamGuessRosterCard';
import TeamGuessBonusSheet from './TeamGuessBonusSheet';
import TeamGuessResultModal, {
  type TeamGuessResultSection,
} from './TeamGuessResultModal';
import { renderMissionBody } from './missionBody';
import StatusCard from './StatusCard';
import {
  PreviewInfoArea,
  VoteTriggerBtn,
  PickRow,
  PickBtn,
  AddBonusBtn,
  BonusSummaryChip,
  BonusSummaryEdit,
  RevealedRosterGap,
  VotedBonusNote,
} from '../../styles/mission/TeamGuessMissionStyle';
import {
  SectionLabel,
  MissionCard,
  CardTitle,
  VotingInstruction,
  VotedStateArea,
  AlreadyVotedBox,
  VotedEmoji,
  VotedName,
  VotedSub,
  VoteActionRow,
  VoteResultBtn,
  SubmitBtn,
  ResultRevealRow,
  ResultRevealCard,
  ResultRole,
  ResultName,
  MissionLoadingBox,
} from '../../styles/mission/MissionStyle';

type Pick = 'team1' | 'team2' | 'draw';

const absolutePickLabel = (pick: Pick): string =>
  pick === 'draw' ? '무승부' : pick === 'team1' ? '1팀 승' : '2팀 승';

const myPickLabel = (pick: Pick, myTeamKey: 'team1' | 'team2' | null): string => {
  if (pick === 'draw') return '무승부';
  if (!myTeamKey) return absolutePickLabel(pick);
  return pick === myTeamKey ? '우리 팀 승' : '상대 팀 승';
};

const resultJosa = (label: string): string => (label === '무승부' ? '로' : '으로');

type Props = {
  ym: string;
  viewState: 'preview' | 'voting' | 'revealed';
  data: TeamGuessMissionData;
  myEmpId: string;
  myVote?: TeamGuessVote;
  activityYmd?: string;
  status: TeamFormationStatus;
  groups: FormationGroup[];
  winnerMap: WinnerMap;
  scoreMap: ScoreMap;
  formationLoading: boolean;
  rivalIds: Set<string>;
  rivalsLoading: boolean;
};

const TeamGuessMissionView = ({
  ym,
  viewState,
  data,
  myEmpId,
  myVote,
  activityYmd,
  status,
  groups,
  winnerMap,
  scoreMap,
  formationLoading,
  rivalIds,
  rivalsLoading,
}: Props) => {
  const isConfirmed = status === 'confirmed';

  const myGroupIdx = myEmpId ? findGroupIndexForEmpId(groups, myEmpId) : -1;
  const isInGroup = myGroupIdx !== -1;
  const myGroupId = isInGroup ? String.fromCharCode(65 + myGroupIdx) : '';
  const myGroup = isInGroup ? groups[myGroupIdx] : undefined;
  const myTeamKey = myGroup ? getGroupTeamKey(myGroup, myEmpId) : null;
  const opponentTeamKey: Pick | null =
    myTeamKey === 'team1' ? 'team2' : myTeamKey === 'team2' ? 'team1' : null;

  useUiStore((s) => s.lastSync);
  const stillActionable = useUiStore.getState().isBeforeCutoff(activityYmd);

  const [voteScreenOpen, setVoteScreenOpen] = useState(false);
  const [myPick, setMyPick] = useState<Pick | ''>('');
  const [bonusGroupId, setBonusGroupId] = useState('');
  const [bonusPick, setBonusPick] = useState<Pick | ''>('');
  const [bonusSheetOpen, setBonusSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [changingVote, setChangingVote] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  const bonusCandidates = useMemo(
    () =>
      groups
        .map((group, idx) => ({ groupId: String.fromCharCode(65 + idx), group }))
        .filter(({ groupId }) => groupId !== myGroupId),
    [groups, myGroupId],
  );

  const handleSubmit = async () => {
    if (!myEmpId || !myPick || !stillActionable) return;
    if (bonusGroupId && !bonusPick) return;
    setSubmitting(true);
    try {
      const vote: TeamGuessVote = { myGroupPick: myPick };
      if (bonusGroupId && bonusPick) {
        vote.bonusGroupId = bonusGroupId;
        vote.bonusGroupPick = bonusPick;
      }
      await submitTeamGuessVote(ym, myEmpId, vote);
    } catch {
      toast.error('예측 제출 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeVote = async () => {
    if (!myEmpId || !stillActionable) return;
    setChangingVote(true);
    try {
      await deleteTeamGuessVote(ym, myEmpId);
      setMyPick('');
      setBonusGroupId('');
      setBonusPick('');
    } catch {
      toast.error('예측 변경 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setChangingVote(false);
    }
  };

  const result = data.result;
  const myVotedPickLabel = myVote ? myPickLabel(myVote.myGroupPick, myTeamKey) : '';

  const modalSections = useMemo<TeamGuessResultSection[]>(() => {
    if (!myVote) return [];
    const sections: TeamGuessResultSection[] = [];
    if (isInGroup && myGroup) {
      const winner = winnerMap[myGroupId];
      sections.push({
        groupId: myGroupId,
        group: myGroup,
        winner,
        myPick: myVote.myGroupPick,
        pickLabel: myPickLabel(myVote.myGroupPick, myTeamKey),
        correct: !!winner && myVote.myGroupPick === winner,
        tone: 'mine',
        scores: scoreMap[myGroupId],
      });
    }
    if (myVote.bonusGroupId && myVote.bonusGroupPick) {
      const idx = myVote.bonusGroupId.charCodeAt(0) - 65;
      const bonusGroup = groups[idx];
      if (bonusGroup) {
        const winner = winnerMap[myVote.bonusGroupId];
        sections.push({
          groupId: myVote.bonusGroupId,
          group: bonusGroup,
          winner,
          myPick: myVote.bonusGroupPick,
          pickLabel: absolutePickLabel(myVote.bonusGroupPick),
          correct: !!winner && myVote.bonusGroupPick === winner,
          tone: 'bonus',
          scores: scoreMap[myVote.bonusGroupId],
        });
      }
    }
    return sections;
  }, [myVote, isInGroup, myGroup, myGroupId, myTeamKey, groups, winnerMap, scoreMap]);

  const contentKey = formationLoading || rivalsLoading
    ? 'loading'
    : !isConfirmed
      ? 'pending'
      : !isInGroup
        ? 'no-access'
        : viewState === 'revealed'
          ? 'revealed'
          : !voteScreenOpen
            ? 'intro'
            : myVote
              ? 'voted'
              : stillActionable
                ? 'voting'
                : 'closed';

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
          {contentKey === 'loading' && (
            <MissionLoadingBox style={viewState === 'revealed' ? { minHeight: 320 } : undefined}>
              <ClipLoader size={24} color="#9ca3af" />
            </MissionLoadingBox>
          )}

          {contentKey === 'intro' && (
            <PreviewInfoArea>
              <SectionLabel>이달의 미션</SectionLabel>
              <MissionCard>
                {data.config?.title && <CardTitle>{data.config.title}</CardTitle>}
                {data.config?.description && renderMissionBody(data.config.description)}
              </MissionCard>
              <VoteTriggerBtn onClick={() => setVoteScreenOpen(true)}>
                ⚡ 팀 승부 예측하기
              </VoteTriggerBtn>
            </PreviewInfoArea>
          )}

          {contentKey === 'pending' && (
            <StatusCard
              emoji="⏳"
              headline="팀 편성 확정 전이에요"
              sub="팀 편성이 끝나면 예측할 수 있어요"
            />
          )}

          {contentKey === 'no-access' && (
            <StatusCard
              emoji="🚫"
              headline="이번 달 조 편성 대상이 아니에요"
              sub="정기전 참여자만 예측할 수 있어요"
            />
          )}

          {contentKey === 'closed' && (
            <StatusCard
              emoji="⏰"
              headline="예측이 마감되었어요"
              sub="결과는 활동 후 확인할 수 있어요"
            />
          )}

          {contentKey === 'voted' && myVote && (
            <VotedStateArea>
              <AlreadyVotedBox>
                <VotedEmoji>🎯</VotedEmoji>
                <VotedName>
                  <strong>{myVotedPickLabel}</strong>
                  {resultJosa(myVotedPickLabel)} 예측했어요!
                </VotedName>
                {myVote.bonusGroupId && myVote.bonusGroupPick && (
                  <VotedBonusNote>
                    보너스 · {myVote.bonusGroupId}조 {absolutePickLabel(myVote.bonusGroupPick)}
                  </VotedBonusNote>
                )}
                <VotedSub>결과는 활동 후 확인할 수 있어요</VotedSub>
              </AlreadyVotedBox>
              {stillActionable && (
                <VoteActionRow>
                  <VoteResultBtn onClick={handleChangeVote} disabled={changingVote}>
                    {changingVote ? '변경 중...' : '예측 변경하기'}
                  </VoteResultBtn>
                </VoteActionRow>
              )}
            </VotedStateArea>
          )}

          {contentKey === 'voting' && myGroup && (
            <>
              <VotingInstruction>우리 조가 이길까요?</VotingInstruction>
              <TeamGuessRosterCard
                groupLabel={`${myGroupId}조`}
                group={myGroup}
                myEmpId={myEmpId}
                rivalIds={rivalIds}
              />
              <PickRow>
                <PickBtn
                  selected={!!myTeamKey && myPick === myTeamKey}
                  onClick={() => myTeamKey && setMyPick(myTeamKey)}
                >
                  우리 팀 승
                </PickBtn>
                <PickBtn selected={myPick === 'draw'} onClick={() => setMyPick('draw')}>
                  무승부
                </PickBtn>
                <PickBtn
                  selected={!!opponentTeamKey && myPick === opponentTeamKey}
                  onClick={() => opponentTeamKey && setMyPick(opponentTeamKey)}
                >
                  상대 팀 승
                </PickBtn>
              </PickRow>

              {bonusCandidates.length > 0 &&
                (bonusGroupId && bonusPick ? (
                  <BonusSummaryChip onClick={() => setBonusSheetOpen(true)}>
                    <span>
                      보너스 · {bonusGroupId}조 {absolutePickLabel(bonusPick)}
                    </span>
                    <BonusSummaryEdit>변경</BonusSummaryEdit>
                  </BonusSummaryChip>
                ) : (
                  <AddBonusBtn onClick={() => setBonusSheetOpen(true)}>
                    ⚡ 보너스 픽 추가하기 (선택)
                  </AddBonusBtn>
                ))}

              <SubmitBtn
                onClick={handleSubmit}
                disabled={!myPick || (!!bonusGroupId && !bonusPick) || submitting}
              >
                {submitting ? '예측 중...' : '예측하기'}
              </SubmitBtn>
            </>
          )}

          {contentKey === 'revealed' && myGroup && result && (
            <>
              <SectionLabel>팀 승부 결과 공개</SectionLabel>
              <TeamGuessRosterCard
                groupLabel={`${myGroupId}조`}
                group={myGroup}
                myEmpId={myEmpId}
                winner={winnerMap[myGroupId]}
                scores={scoreMap[myGroupId]}
                rivalIds={rivalIds}
              />
              <RevealedRosterGap />
              <ResultRevealRow>
                <ResultRevealCard role="reward">
                  <ResultRole role="reward">내 조 적중</ResultRole>
                  <ResultName style={{ fontSize: 15 }}>
                    {(result.myGroupCorrectVoters ?? []).length}명
                  </ResultName>
                </ResultRevealCard>
                <ResultRevealCard role="reward">
                  <ResultRole role="reward">보너스까지 적중</ResultRole>
                  <ResultName style={{ fontSize: 15 }}>
                    {(result.bonusCorrectVoters ?? []).length}명
                  </ResultName>
                </ResultRevealCard>
              </ResultRevealRow>
              {myVote && (
                <VoteActionRow>
                  <VoteResultBtn onClick={() => setResultModalOpen(true)}>
                    결과 보기
                  </VoteResultBtn>
                </VoteActionRow>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <TeamGuessBonusSheet
        open={bonusSheetOpen}
        onClose={() => setBonusSheetOpen(false)}
        candidates={bonusCandidates}
        confirmedGroupId={bonusGroupId}
        confirmedPick={bonusPick}
        onConfirm={(groupId, pick) => {
          setBonusGroupId(groupId);
          setBonusPick(pick);
        }}
        onClear={() => {
          setBonusGroupId('');
          setBonusPick('');
        }}
      />

      <TeamGuessResultModal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        myEmpId={myEmpId}
        sections={modalSections}
        rivalIds={rivalIds}
      />
    </>
  );
};

export default TeamGuessMissionView;
