import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ref, get, remove } from 'firebase/database';
import { toast } from 'sonner';
import MissionRichEditor from './MissionRichEditor';
import { db, fetchAllUsers } from '../../services/firebase';
import { getQuarterStartYm, getQuarterEndYm, getPrevYm } from '../../utils/date';
import {
  STATUS_LABEL,
  toSuccessStyle,
  createIntFieldHandler,
  createPinInputHandlers,
  runMissionStatusChange,
  runMissionReset,
  runMissionReveal,
  runVotesReset,
} from './missionAdminHelpers';
import {
  FormTitle,
  FieldLabel,
  SaveRow,
  SaveBtn,
  EmpIdBadge,
  SectionBlock,
  MissionTypeCard,
  MissionInput,
  NumberRow,
  StatusBadge,
  StatusRow,
  StatusBtn,
  CardHeaderRow,
  CardHeaderTitle,
  CardChevron,
  CardSummary,
  CardBody,
  VoteStatList,
  VoteStatRow,
  VoteBar,
  VoteStatLabel,
  VoteStatCount,
  VoteHeaderRow,
  ResultArea,
  Divider,
  SettingGroup,
  SettingSection,
  SettingSectionTitle,
  SettingGrid,
  SettingCell,
  SettingCellLabel,
  SettingDivider,
  EmptyMsg,
} from '../../styles/admin/AdminMissionStyle';
import {
  TypeSelectRow,
  TypeSelectBtn,
  QuarterHint,
  CandidateList,
  CandidateRow,
  CandidateCheck,
  ConfirmedBadgeRow,
} from '../../styles/admin/AdminScoreGuessMissionStyle';
import {
  resetVotes,
  migrateLegacyIfNeeded,
  DEFAULT_SCORE_DIFF_THRESHOLD,
  type ScoreGuessMissionConfig,
  type TeamGuessMissionConfig,
  type ScoreGuessMissionData,
  type TeamGuessMissionData,
  type MissionStatus,
  type MissionType,
} from '../../hooks/useMission';
import {
  saveScoreGuessMissionContent,
  confirmScoreGuessTargets,
  revealScoreGuessMissionResult,
} from '../../services/scoreGuessMission';
import { saveTeamGuessMissionContent, revealTeamGuessMissionResult } from '../../services/teamGuessMission';

type ScoreGuessConfigDraft = Omit<ScoreGuessMissionConfig, 'status'>;
type TeamGuessConfigDraft = Omit<TeamGuessMissionConfig, 'status'>;

const DEFAULT_SCORE_GUESS_CONFIG_DRAFT: ScoreGuessConfigDraft = {
  type: 'scoreGuess',
  title: '',
  description: '',
  revealDays: 7,
  rewardPin: 0.5,
  scoreDiffThreshold: DEFAULT_SCORE_DIFF_THRESHOLD,
  targetRewardPin: 0.5,
};

const DEFAULT_TEAM_GUESS_CONFIG_DRAFT: TeamGuessConfigDraft = {
  type: 'teamGuess',
  title: '',
  description: '',
  revealDays: 7,
  rewardPin: 1,
  bonusRewardPin: 1,
};

type PredictType = 'scoreGuess' | 'teamGuess';

const removeIfDraft = async (ym: string, type: PredictType) => {
  await migrateLegacyIfNeeded(ym);
  const statusSnap = await get(ref(db, `missions/${ym}/${type}/config/status`));
  if (!statusSnap.exists() || statusSnap.val() !== 'draft') return;
  await remove(ref(db, `missions/${ym}/${type}`));
  await remove(ref(db, `missions/${ym}/votes/${type}`));
};

type Props = {
  ym: string;
  data: ScoreGuessMissionData | TeamGuessMissionData | null;
  predictType: PredictType | null;
  loading: boolean;
  allNames: Record<string, string>;
  teamFormationStatus: string;
  teamFormationGroups: unknown[];
};

const AdminPredictMissionCard = ({
  ym,
  data,
  predictType,
  loading,
  allNames,
  teamFormationStatus,
  teamFormationGroups,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setExpanded(false);
  }, [ym]);

  const [missionType, setMissionType] = useState<PredictType>('scoreGuess');

  const [scoreGuessConfigDraft, setScoreGuessConfigDraft] = useState<ScoreGuessConfigDraft>(DEFAULT_SCORE_GUESS_CONFIG_DRAFT);
  const [sgRewardPinRaw, setSgRewardPinRaw] = useState('0.5');
  const [targetRewardPinRaw, setTargetRewardPinRaw] = useState('0.5');

  const [teamGuessConfigDraft, setTeamGuessConfigDraft] = useState<TeamGuessConfigDraft>(DEFAULT_TEAM_GUESS_CONFIG_DRAFT);
  const [tgRewardPinRaw, setTgRewardPinRaw] = useState('1');
  const [tgBonusRewardPinRaw, setTgBonusRewardPinRaw] = useState('1');

  const [candidates, setCandidates] = useState<[string, string][]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidateChecked, setCandidateChecked] = useState<Record<string, true>>({});
  const [confirmTargetChange, setConfirmTargetChange] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (predictType) setMissionType(predictType);
  }, [predictType]);

  useEffect(() => {
    if (loading) return;
    if (predictType === 'scoreGuess' && data?.config) {
      const d = data as ScoreGuessMissionData;
      const rp = d.config?.rewardPin ?? 0.5;
      setScoreGuessConfigDraft({
        type: 'scoreGuess',
        title: d.config?.title ?? '',
        description: d.config?.description ?? '',
        revealDays: d.config?.revealDays ?? 7,
        rewardPin: rp,
        scoreDiffThreshold: d.config?.scoreDiffThreshold ?? DEFAULT_SCORE_DIFF_THRESHOLD,
        targetRewardPin: d.config?.targetRewardPin ?? 0.5,
      });
      setSgRewardPinRaw(String(rp));
      setTargetRewardPinRaw(String(d.config?.targetRewardPin ?? 0.5));
    } else if (predictType === 'teamGuess' && data?.config) {
      const d = data as TeamGuessMissionData;
      const rp = d.config?.rewardPin ?? 1;
      const brp = d.config?.bonusRewardPin ?? 1;
      setTeamGuessConfigDraft({
        type: 'teamGuess',
        title: d.config?.title ?? '',
        description: d.config?.description ?? '',
        revealDays: d.config?.revealDays ?? 7,
        rewardPin: rp,
        bonusRewardPin: brp,
      });
      setTgRewardPinRaw(String(rp));
      setTgBonusRewardPinRaw(String(brp));
    } else if (!data) {
      setScoreGuessConfigDraft(DEFAULT_SCORE_GUESS_CONFIG_DRAFT);
      setSgRewardPinRaw('0.5');
      setTargetRewardPinRaw('0.5');
      setTeamGuessConfigDraft(DEFAULT_TEAM_GUESS_CONFIG_DRAFT);
      setTgRewardPinRaw('1');
      setTgBonusRewardPinRaw('1');
    }
  }, [data, predictType, loading]);

  const [candidateStartYm, quarterEndYm] = useMemo(() => {
    const refDate = new Date(Number(ym.slice(0, 4)), Number(ym.slice(4)) - 1, 1);
    return [getPrevYm(getQuarterStartYm(refDate)), getQuarterEndYm(refDate)];
  }, [ym]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCandidatesLoading(true);
      try {
        const year = ym.slice(0, 4);
        const month = String(Number(ym.slice(4)));
        const [users, partSnap] = await Promise.all([
          fetchAllUsers(),
          get(ref(db, `activityParticipants/${year}/${month}`)),
        ]);
        if (cancelled) return;
        const participantIds = partSnap.exists() ? Object.keys(partSnap.val() as Record<string, true>) : [];
        const detected = participantIds.filter((empId) => {
          const join = users[empId]?.join;
          return !!join && join >= candidateStartYm && join <= quarterEndYm;
        });
        setCandidates(detected.map((empId) => [empId, users[empId]?.name ?? empId]));
      } catch {
        setCandidates([]);
      } finally {
        if (!cancelled) setCandidatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ym, candidateStartYm, quarterEndYm]);

  useEffect(() => {
    if (loading) return;
    if (predictType === 'scoreGuess' && (data as ScoreGuessMissionData)?.targets?.empIds) {
      setCandidateChecked(
        Object.fromEntries((data as ScoreGuessMissionData).targets!.empIds.map((id) => [id, true])),
      );
    } else if (candidates.length > 0) {
      setCandidateChecked(Object.fromEntries(candidates.map(([id]) => [id, true])));
    } else {
      setCandidateChecked({});
    }
  }, [data, predictType, candidates, loading]);

  const toggleCandidate = (empId: string) => {
    setConfirmTargetChange(false);
    setCandidateChecked((prev) => {
      const next = { ...prev };
      if (next[empId]) delete next[empId];
      else next[empId] = true;
      return next;
    });
  };

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      await removeIfDraft(ym, missionType === 'scoreGuess' ? 'teamGuess' : 'scoreGuess');
      if (missionType === 'scoreGuess') {
        await saveScoreGuessMissionContent(ym, scoreGuessConfigDraft, data?.config?.status ?? null);
      } else {
        await saveTeamGuessMissionContent(ym, teamGuessConfigDraft, data?.config?.status ?? null);
      }
      toast('✅ 미션 내용이 저장되었습니다.', { position: 'top-center', duration: 2000, style: toSuccessStyle });
    } catch {
      toast.error('저장 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmTargets = async () => {
    const empIds = Object.keys(candidateChecked);
    if (empIds.length === 0) {
      toast('신규회원 후보를 1명 이상 선택해주세요.', { position: 'top-center' });
      return;
    }
    if (data?.result?.revealed === true) {
      toast('이미 결과가 공개된 미션입니다. 후보를 바꾸려면 먼저 "미션 초기화"를 눌러주세요.', { position: 'top-center', duration: 3000 });
      return;
    }
    const hasExistingVotes = Object.keys(data?.votes ?? {}).length > 0;
    if (hasExistingVotes && !confirmTargetChange) {
      setConfirmTargetChange(true);
      toast('이미 예측이 진행 중입니다. 다시 누르면 기존 예측이 초기화됩니다.', { position: 'top-center', duration: 2500 });
      return;
    }
    setSaving(true);
    try {
      if (hasExistingVotes) await resetVotes(ym, 'scoreGuess');
      await confirmScoreGuessTargets(ym, empIds);
      setConfirmTargetChange(false);
      toast('✅ 후보가 확정되었습니다.', { position: 'top-center', duration: 2000, style: toSuccessStyle });
    } catch {
      toast.error('확정 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSaving(false);
    }
  };

  const currentType: MissionType = predictType ?? missionType;

  const handleStatusChange = (next: MissionStatus) =>
    runMissionStatusChange(ym, currentType, next, setSaving);

  const handleReveal = () =>
    runMissionReveal(data, setRevealing, async () => {
      if (currentType === 'scoreGuess') {
        const res = await revealScoreGuessMissionResult(ym, data as ScoreGuessMissionData);
        return `예측 성공 ${res.correctVoters.length}명, 순위 보상 ${res.topTargets.length}명 🎉`;
      }
      const res = await revealTeamGuessMissionResult(ym, data as TeamGuessMissionData);
      return `내 조 적중 ${res.myGroupCorrectVoters.length}명, 보너스 적중 ${res.bonusCorrectVoters.length}명 🎉`;
    });

  const handleResetMission = () =>
    runMissionReset(ym, currentType, data, setSaving, setConfirmReset);

  const status = data?.config?.status ?? 'draft';
  const predictVotes = data?.votes ?? {};
  const totalVotes = Object.keys(predictVotes).length;
  const canChangeType =
    !data?.config || (status === 'draft' && totalVotes === 0 && data?.result?.revealed !== true);

  const missionTypeLabel = currentType === 'scoreGuess' ? '신규회원 점수 맞추기' : '팀 승부 예측';
  const summaryText = [
    missionTypeLabel,
    data?.config?.title ? `『${data.config.title}』` : null,
    status === 'draft'
      ? data?.config?.title
        ? '초안'
        : '아직 설정되지 않았어요'
      : status === 'active'
        ? `예측 ${totalVotes}명 진행중`
        : data?.result
          ? '결과 공개됨'
          : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const renderScoreGuessVoteStats = () => {
    if (totalVotes === 0) return <EmptyMsg>아직 예측이 없습니다.</EmptyMsg>;
    const counts: Record<string, number> = {};
    for (const vote of Object.values(predictVotes as Record<string, { targetEmpId: string }>)) {
      counts[vote.targetEmpId] = (counts[vote.targetEmpId] ?? 0) + 1;
    }
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    return (
      <VoteStatList>
        {sorted.map(([empId, count]) => (
          <VoteStatRow key={empId}>
            <VoteStatLabel>{allNames[empId] ?? empId}</VoteStatLabel>
            <VoteBar pct={totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0} color="#10b981" />
            <VoteStatCount>{count}표</VoteStatCount>
          </VoteStatRow>
        ))}
        <VoteStatRow>
          <VoteStatLabel style={{ color: '#6b7280' }}>총 예측</VoteStatLabel>
          <VoteStatCount style={{ color: '#6b7280', marginLeft: 'auto' }}>{totalVotes}명</VoteStatCount>
        </VoteStatRow>
      </VoteStatList>
    );
  };

  const renderTeamGuessVoteStats = () =>
    totalVotes === 0 ? (
      <EmptyMsg>아직 예측이 없습니다.</EmptyMsg>
    ) : (
      <VoteStatList>
        <VoteStatRow>
          <VoteStatLabel style={{ color: '#6b7280' }}>총 예측</VoteStatLabel>
          <VoteStatCount style={{ color: '#6b7280', marginLeft: 'auto' }}>{totalVotes}명</VoteStatCount>
        </VoteStatRow>
      </VoteStatList>
    );

  return (
    <MissionTypeCard>
      <CardHeaderRow onClick={() => setExpanded((v) => !v)}>
        <CardHeaderTitle>🎯 예측 미션</CardHeaderTitle>
        <StatusBadge status={status}>{STATUS_LABEL[status]}</StatusBadge>
        <CardChevron expanded={expanded}>
          <ChevronDown size={18} />
        </CardChevron>
      </CardHeaderRow>
      {summaryText && <CardSummary>{summaryText}</CardSummary>}
      {expanded && (
        <CardBody>
          <StatusRow>
            {status === 'draft' && (
              <StatusBtn color="#10b981" disabled={saving} onClick={() => handleStatusChange('active')}>
                미션 공개
              </StatusBtn>
            )}
            {status === 'active' && (
              <>
                <StatusBtn color="#111827" disabled={saving || revealing} onClick={handleReveal}>
                  {revealing ? '처리중...' : '결과 공개'}
                </StatusBtn>
                <StatusBtn color="#9ca3af" disabled={saving} onClick={() => handleStatusChange('draft')}>
                  준비중으로
                </StatusBtn>
              </>
            )}
            {status === 'revealed' && (
              <>
                <StatusBtn color="#10b981" disabled={saving} onClick={() => handleStatusChange('active')}>
                  미션공개로
                </StatusBtn>
                <StatusBtn color="#9ca3af" disabled={saving} onClick={() => handleStatusChange('draft')}>
                  준비중으로
                </StatusBtn>
              </>
            )}
          </StatusRow>

          <TypeSelectRow>
            <TypeSelectBtn active={missionType === 'scoreGuess'} disabled={!canChangeType} onClick={() => setMissionType('scoreGuess')}>
              신규회원 점수 맞추기
            </TypeSelectBtn>
            <TypeSelectBtn active={missionType === 'teamGuess'} disabled={!canChangeType} onClick={() => setMissionType('teamGuess')}>
              팀 승부 예측
            </TypeSelectBtn>
          </TypeSelectRow>

          {missionType === 'scoreGuess' ? (
            <>
              <SectionBlock>
                <FieldLabel>미션 제목</FieldLabel>
                <MissionInput
                  value={scoreGuessConfigDraft.title}
                  onChange={(e) => setScoreGuessConfigDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder="예: 신규회원과 함께하는 7월"
                />
              </SectionBlock>

              <SectionBlock>
                <FieldLabel>미션 내용</FieldLabel>
                <MissionRichEditor
                  value={scoreGuessConfigDraft.description}
                  onChange={(html) => setScoreGuessConfigDraft((p) => ({ ...p, description: html }))}
                  placeholder="전체 참여자에게 공개될 미션 내용을 입력하세요."
                />
              </SectionBlock>

              <SettingGroup>
                <SettingSection>
                  <SettingSectionTitle>공개 기준</SettingSectionTitle>
                  <NumberRow>
                    활동일
                    <MissionInput
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={scoreGuessConfigDraft.revealDays}
                      onChange={createIntFieldHandler(setScoreGuessConfigDraft, 'revealDays')}
                    />
                    일 전부터 공개
                  </NumberRow>
                </SettingSection>

                <SettingDivider />

                <SettingSection>
                  <SettingSectionTitle>보상 기준</SettingSectionTitle>
                  <SettingGrid cols={3}>
                    <SettingCell>
                      <SettingCellLabel>지급 PIN</SettingCellLabel>
                      <NumberRow>
                        <MissionInput
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={sgRewardPinRaw}
                          {...createPinInputHandlers(
                            setSgRewardPinRaw,
                            (n) => setScoreGuessConfigDraft((p) => ({ ...p, rewardPin: n })),
                            scoreGuessConfigDraft.rewardPin,
                          )}
                        />
                        PIN
                      </NumberRow>
                    </SettingCell>
                    <SettingCell>
                      <SettingCellLabel>오차 허용범위</SettingCellLabel>
                      <NumberRow>
                        <MissionInput
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={scoreGuessConfigDraft.scoreDiffThreshold}
                          onChange={createIntFieldHandler(setScoreGuessConfigDraft, 'scoreDiffThreshold')}
                        />
                        점 이내
                      </NumberRow>
                    </SettingCell>
                    <SettingCell>
                      <SettingCellLabel>순위 보상 PIN (상위 점수자)</SettingCellLabel>
                      <NumberRow>
                        <MissionInput
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={targetRewardPinRaw}
                          {...createPinInputHandlers(
                            setTargetRewardPinRaw,
                            (n) => setScoreGuessConfigDraft((p) => ({ ...p, targetRewardPin: n })),
                            scoreGuessConfigDraft.targetRewardPin,
                          )}
                        />
                        PIN
                      </NumberRow>
                    </SettingCell>
                  </SettingGrid>
                </SettingSection>
              </SettingGroup>

              <Divider />

              <SaveRow style={{ marginBottom: 8 }}>
                <SaveBtn onClick={handleSaveContent} disabled={saving}>
                  {saving ? '저장 중...' : '미션 내용 저장'}
                </SaveBtn>
              </SaveRow>

              <Divider />

              <FormTitle>신규회원 후보</FormTitle>
              <QuarterHint>
                {candidateStartYm.slice(4)}~{quarterEndYm.slice(4)}월 가입 + 이번 달 활동 참여자 기준으로 자동 감지됩니다.
              </QuarterHint>

              <SectionBlock>
                {candidatesLoading ? (
                  <EmptyMsg>후보를 불러오는 중...</EmptyMsg>
                ) : candidates.length === 0 ? (
                  <EmptyMsg>최근 가입 신규회원 중 이번 달 활동 참여자가 없습니다.</EmptyMsg>
                ) : (
                  <CandidateList>
                    {candidates.map(([empId, name]) => {
                      const checked = !!candidateChecked[empId];
                      return (
                        <CandidateRow key={empId} checked={checked} onClick={() => toggleCandidate(empId)}>
                          <span>
                            {name} <EmpIdBadge>{empId}</EmpIdBadge>
                          </span>
                          <CandidateCheck checked={checked}>{checked ? '✓' : ''}</CandidateCheck>
                        </CandidateRow>
                      );
                    })}
                  </CandidateList>
                )}

                {predictType === 'scoreGuess' && ((data as ScoreGuessMissionData)?.targets?.empIds?.length ?? 0) > 0 && (
                  <ConfirmedBadgeRow>
                    확정됨: {(data as ScoreGuessMissionData).targets!.empIds.map((id) => allNames[id] ?? id).join(', ')}
                  </ConfirmedBadgeRow>
                )}

                <SaveRow>
                  <SaveBtn onClick={handleConfirmTargets} disabled={saving || Object.keys(candidateChecked).length === 0}>
                    {confirmTargetChange ? '정말 확정 (투표 초기화됨)' : saving ? '처리 중...' : '후보 확정'}
                  </SaveBtn>
                </SaveRow>
              </SectionBlock>
            </>
          ) : (
            <>
              <SectionBlock>
                <FieldLabel>미션 제목</FieldLabel>
                <MissionInput
                  value={teamGuessConfigDraft.title}
                  onChange={(e) => setTeamGuessConfigDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder="예: 8월 정기전 팀 승부 예측"
                />
              </SectionBlock>

              <SectionBlock>
                <FieldLabel>미션 내용</FieldLabel>
                <MissionRichEditor
                  value={teamGuessConfigDraft.description}
                  onChange={(html) => setTeamGuessConfigDraft((p) => ({ ...p, description: html }))}
                  placeholder="전체 참여자에게 공개될 미션 내용을 입력하세요."
                />
              </SectionBlock>

              <SettingGroup>
                <SettingSection>
                  <SettingSectionTitle>공개 기준</SettingSectionTitle>
                  <NumberRow>
                    활동일
                    <MissionInput
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={teamGuessConfigDraft.revealDays}
                      onChange={createIntFieldHandler(setTeamGuessConfigDraft, 'revealDays')}
                    />
                    일 전부터 공개
                  </NumberRow>
                </SettingSection>

                <SettingDivider />

                <SettingSection>
                  <SettingSectionTitle>보상 기준</SettingSectionTitle>
                  <SettingGrid>
                    <SettingCell>
                      <SettingCellLabel>내 조 적중</SettingCellLabel>
                      <NumberRow>
                        <MissionInput
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={tgRewardPinRaw}
                          {...createPinInputHandlers(
                            setTgRewardPinRaw,
                            (n) => setTeamGuessConfigDraft((p) => ({ ...p, rewardPin: n })),
                            teamGuessConfigDraft.rewardPin,
                          )}
                        />
                        PIN
                      </NumberRow>
                    </SettingCell>
                    <SettingCell>
                      <SettingCellLabel>보너스까지 적중</SettingCellLabel>
                      <NumberRow>
                        <MissionInput
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={tgBonusRewardPinRaw}
                          {...createPinInputHandlers(
                            setTgBonusRewardPinRaw,
                            (n) => setTeamGuessConfigDraft((p) => ({ ...p, bonusRewardPin: n })),
                            teamGuessConfigDraft.bonusRewardPin,
                          )}
                        />
                        PIN
                      </NumberRow>
                    </SettingCell>
                  </SettingGrid>
                </SettingSection>
              </SettingGroup>

              <Divider />

              <SaveRow style={{ marginBottom: 8 }}>
                <SaveBtn onClick={handleSaveContent} disabled={saving}>
                  {saving ? '저장 중...' : '미션 내용 저장'}
                </SaveBtn>
              </SaveRow>

              <Divider />

              <FormTitle>팀 편성 연동</FormTitle>
              <QuarterHint>
                이 달 팀 편성 확정 여부에 따라 예측 화면이 열립니다. 확정 전에는 사용자에게 &quot;팀 편성 확정 전이에요&quot; 안내만 표시됩니다.
              </QuarterHint>
              {teamFormationStatus === 'confirmed' ? (
                <ConfirmedBadgeRow>확정됨 — {teamFormationGroups.length}개 조</ConfirmedBadgeRow>
              ) : (
                <EmptyMsg>아직 팀 편성이 확정되지 않았습니다. /admin/team-formation에서 먼저 확정하세요.</EmptyMsg>
              )}
            </>
          )}

          {(status === 'voting' || status === 'revealed') && (
            <>
              <Divider />
              <VoteHeaderRow>
                <FormTitle style={{ margin: 0 }}>투표 현황</FormTitle>
                <StatusBtn
                  color="#6b7280"
                  disabled={saving}
                  onClick={() => runVotesReset(ym, currentType, '예측', setSaving)}
                >
                  투표 초기화
                </StatusBtn>
                {!confirmReset ? (
                  <StatusBtn color="#dc2626" disabled={saving} onClick={() => setConfirmReset(true)}>
                    미션 초기화
                  </StatusBtn>
                ) : (
                  <>
                    <StatusBtn color="#dc2626" disabled={saving} onClick={handleResetMission}>
                      정말 초기화
                    </StatusBtn>
                    <StatusBtn color="#9ca3af" disabled={saving} onClick={() => setConfirmReset(false)}>
                      취소
                    </StatusBtn>
                  </>
                )}
              </VoteHeaderRow>
              {currentType === 'scoreGuess' ? renderScoreGuessVoteStats() : renderTeamGuessVoteStats()}
              {data?.result && currentType === 'scoreGuess' && (
                <ResultArea>
                  {((data as ScoreGuessMissionData).targets?.empIds ?? []).map((id) => (
                    <div key={id}>
                      <strong>{allNames[id] ?? id}:</strong> {(data as ScoreGuessMissionData).result?.actualScores?.[id] ?? '-'}점
                    </div>
                  ))}
                  <div>
                    <strong>예측 성공:</strong>{' '}
                    {((data as ScoreGuessMissionData).result?.correctVoters ?? []).map((id) => allNames[id] ?? id).join(', ') || '없음'}
                  </div>
                </ResultArea>
              )}
              {data?.result && currentType === 'teamGuess' && (
                <ResultArea>
                  <div>
                    <strong>내 조 적중:</strong>{' '}
                    {((data as TeamGuessMissionData).result?.myGroupCorrectVoters ?? []).map((id) => allNames[id] ?? id).join(', ') || '없음'}
                  </div>
                  <div>
                    <strong>보너스까지 적중:</strong>{' '}
                    {((data as TeamGuessMissionData).result?.bonusCorrectVoters ?? []).map((id) => allNames[id] ?? id).join(', ') || '없음'}
                  </div>
                </ResultArea>
              )}
            </>
          )}
        </CardBody>
      )}
    </MissionTypeCard>
  );
};

export default AdminPredictMissionCard;
