import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import VillainMissionModal from '../mission/VillainMissionModal';
import { ref, get } from 'firebase/database';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';
import MissionRichEditor from './MissionRichEditor';
import { db, fetchAllUsers } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { getQuarterStartYm, getQuarterEndYm } from '../../utils/date';
import { SmallText } from '../../styles/global/commonStyle';
import {
  MonthSelect,
  EmptyMsg,
  FormTitle,
  FieldLabel,
  SaveRow,
  SaveBtn,
  EmpIdBadge,
  NameDropdown,
  NameDropdownItem,
  SectionBlock,
  MissionInput,
  NumberRow,
  HiddenSection,
  HiddenSectionTitle,
  RoleRow,
  RoleLabel,
  RoleNameInput,
  LookupBtn,
  RandomBtn,
  StatusBadge,
  StatusRow,
  StatusBtn,
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
  useMission,
  saveVillainMissionContent,
  saveScoreGuessMissionContent,
  assignRoles,
  setMissionStatus,
  revealMissionResult,
  resetVotes,
  resetMissionState,
  isScoreGuessMission,
  type MissionType,
  type VillainMissionConfig,
  type VillainMissionHidden,
  type ScoreGuessMissionConfig,
  type MissionStatus,
} from '../../hooks/useMission';
import {
  confirmScoreGuessTargets,
  revealScoreGuessMissionResult,
} from '../../hooks/useScoreGuessMission';

type RoleDraft = {
  villainName: string;
  villainId: string;
  helperName: string;
  helperId: string;
};

type ConfigDraft = Omit<VillainMissionConfig, 'status'>;
type ScoreGuessConfigDraft = Omit<ScoreGuessMissionConfig, 'status'>;

function createIntFieldHandler<T>(
  setDraft: Dispatch<SetStateAction<T>>,
  field: keyof T,
) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^\d]/g, '');
    setDraft((p) => ({ ...p, [field]: v === '' ? 0 : Number(v) }));
  };
}

const createPinInputHandlers = (
  setRaw: (raw: string) => void,
  commit: (n: number) => void,
  committedValue: number,
) => ({
  onChange: (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!/^[\d.]*$/.test(raw)) return;
    setRaw(raw);
    const n = parseFloat(raw);
    if (!isNaN(n)) commit(n);
  },
  onBlur: () => setRaw(String(committedValue)),
});

const STATUS_LABEL: Record<MissionStatus, string> = {
  draft: '준비중',
  active: '공개됨',
  voting: '투표중',
  revealed: '결과공개',
};

const toSuccessStyle = {
  backgroundColor: '#f0fdf4',
  color: '#065f46',
  borderRadius: '10px',
  fontSize: '0.875rem',
};

const DEFAULT_CONFIG_DRAFT: ConfigDraft = {
  type: 'villain',
  title: '',
  description: '',
  revealDays: 7,
  rewardPin: 1,
  villainRewardPin: 1,
  helperVoteThreshold: 3,
  villainCatchThreshold: 1,
};

const DEFAULT_HIDDEN_DRAFT: VillainMissionHidden = {
  villain: { title: '또랑 빌런 미션', description: '' },
  helper: { title: '빌런 조력자 미션', description: '' },
};

const DEFAULT_SCORE_GUESS_CONFIG_DRAFT: ScoreGuessConfigDraft = {
  type: 'scoreGuess',
  title: '',
  description: '',
  revealDays: 7,
  rewardPin: 0.5,
  scoreDiffThreshold: 5,
  targetRewardPin: 0.5,
};

const AdminMission = () => {
  const goBack = useNavigateBack('/admin');

  const currentYm = useMemo(() => {
    const now = useUiStore.getState().getServerNow();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [ym, setYm] = useState(currentYm);
  const { data, loading } = useMission(ym);

  const [missionType, setMissionType] = useState<MissionType>('villain');

  const [configDraft, setConfigDraft] = useState<ConfigDraft>(DEFAULT_CONFIG_DRAFT);
  const [rewardPinRaw, setRewardPinRaw] = useState('1');
  const [villainRewardPinRaw, setVillainRewardPinRaw] = useState('1');
  const [hiddenDraft, setHiddenDraft] = useState<VillainMissionHidden>(DEFAULT_HIDDEN_DRAFT);
  const [roleDraft, setRoleDraft] = useState<RoleDraft>({
    villainName: '',
    villainId: '',
    helperName: '',
    helperId: '',
  });

  const [scoreGuessConfigDraft, setScoreGuessConfigDraft] = useState<ScoreGuessConfigDraft>(
    DEFAULT_SCORE_GUESS_CONFIG_DRAFT,
  );
  const [sgRewardPinRaw, setSgRewardPinRaw] = useState('0.5');
  const [targetRewardPinRaw, setTargetRewardPinRaw] = useState('0.5');

  const [candidates, setCandidates] = useState<[string, string][]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidateChecked, setCandidateChecked] = useState<Record<string, true>>({});
  const [confirmTargetChange, setConfirmTargetChange] = useState(false);
  const [confirmRoleChange, setConfirmRoleChange] = useState(false);

  useEffect(() => {
    setConfirmRoleChange(false);
  }, [roleDraft.villainId, roleDraft.helperId]);

  const [allNames, setAllNames] = useState<Record<string, string>>({});
  const [villainDropdown, setVillainDropdown] = useState<[string, string][]>(
    [],
  );
  const [helperDropdown, setHelperDropdown] = useState<[string, string][]>([]);
  const [saving, setSaving] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [villainPreviewOpen, setVillainPreviewOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await get(ref(db, 'names'));
        if (snap.exists()) setAllNames(snap.val() as Record<string, string>);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    if (data && isScoreGuessMission(data)) {
      setMissionType('scoreGuess');
      const rp = data.config?.rewardPin ?? 0.5;
      setScoreGuessConfigDraft({
        type: 'scoreGuess',
        title: data.config?.title ?? '',
        description: data.config?.description ?? '',
        revealDays: data.config?.revealDays ?? 7,
        rewardPin: rp,
        scoreDiffThreshold: data.config?.scoreDiffThreshold ?? 5,
        targetRewardPin: data.config?.targetRewardPin ?? 0.5,
      });
      setSgRewardPinRaw(String(rp));
      setTargetRewardPinRaw(String(data.config?.targetRewardPin ?? 0.5));
    } else if (data) {
      const rp = data.config?.rewardPin ?? 1;
      const vp = data.config?.villainRewardPin ?? rp;
      setMissionType('villain');
      setConfigDraft({
        type: 'villain',
        title: data.config?.title ?? '',
        description: data.config?.description ?? '',
        revealDays: data.config?.revealDays ?? 7,
        rewardPin: rp,
        villainRewardPin: vp,
        helperVoteThreshold: data.config?.helperVoteThreshold ?? 3,
        villainCatchThreshold: data.config?.villainCatchThreshold ?? 1,
      });
      setRewardPinRaw(String(rp));
      setVillainRewardPinRaw(String(vp));
      setHiddenDraft({
        villain: {
          title: data.hidden?.villain?.title ?? '또랑 빌런 미션',
          description: data.hidden?.villain?.description ?? '',
          revealTitle: data.hidden?.villain?.revealTitle ?? '',
        },
        helper: {
          title: data.hidden?.helper?.title ?? '빌런 조력자 미션',
          description: data.hidden?.helper?.description ?? '',
        },
      });
      if (data.roles) {
        setRoleDraft({
          villainId: data.roles.villain,
          villainName: allNames[data.roles.villain] ?? data.roles.villain,
          helperId: data.roles.helper,
          helperName: allNames[data.roles.helper] ?? data.roles.helper,
        });
      }
    } else if (!loading) {
      setMissionType('villain');
      setConfigDraft(DEFAULT_CONFIG_DRAFT);
      setRewardPinRaw('1');
      setVillainRewardPinRaw('1');
      setHiddenDraft(DEFAULT_HIDDEN_DRAFT);
      setRoleDraft({
        villainName: '',
        villainId: '',
        helperName: '',
        helperId: '',
      });
      setScoreGuessConfigDraft(DEFAULT_SCORE_GUESS_CONFIG_DRAFT);
      setSgRewardPinRaw('0.5');
      setTargetRewardPinRaw('0.5');
    }
  }, [data, loading, allNames]);

  const [quarterStartYm, quarterEndYm] = useMemo(() => {
    const refDate = new Date(Number(ym.slice(0, 4)), Number(ym.slice(4)) - 1, 1);
    return [getQuarterStartYm(refDate), getQuarterEndYm(refDate)];
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
        const participantIds = partSnap.exists()
          ? Object.keys(partSnap.val() as Record<string, true>)
          : [];
        const detected = participantIds.filter((empId) => {
          const join = users[empId]?.join;
          return !!join && join >= quarterStartYm && join <= quarterEndYm;
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
  }, [ym, quarterStartYm, quarterEndYm]);

  useEffect(() => {
    if (data && isScoreGuessMission(data) && data.targets?.empIds) {
      setCandidateChecked(
        Object.fromEntries(data.targets.empIds.map((id) => [id, true])),
      );
    } else if (candidates.length > 0) {
      setCandidateChecked(Object.fromEntries(candidates.map(([id]) => [id, true])));
    } else {
      setCandidateChecked({});
    }
  }, [data, candidates]);

  const toggleCandidate = (empId: string) => {
    setConfirmTargetChange(false);
    setCandidateChecked((prev) => {
      const next = { ...prev };
      if (next[empId]) delete next[empId];
      else next[empId] = true;
      return next;
    });
  };

  const lookupRole = (role: 'villain' | 'helper') => {
    const query = (
      role === 'villain' ? roleDraft.villainName : roleDraft.helperName
    )
      .trim()
      .toLowerCase();
    if (!query) return;
    const matches = Object.entries(allNames).filter(([, n]) =>
      n.toLowerCase().includes(query),
    );
    if (matches.length === 0) {
      toast('등록된 회원이 없습니다.', {
        position: 'top-center',
        duration: 1800,
      });
      return;
    }
    if (matches.length === 1) {
      const [empId, name] = matches[0];
      setRoleDraft((prev) =>
        role === 'villain'
          ? { ...prev, villainId: empId, villainName: name }
          : { ...prev, helperId: empId, helperName: name },
      );
      return;
    }
    if (role === 'villain') setVillainDropdown(matches);
    else setHelperDropdown(matches);
  };

  const randomAssign = useCallback(async () => {
    const year = ym.slice(0, 4);
    const month = String(Number(ym.slice(4)));
    try {
      const snap = await get(ref(db, `activityParticipants/${year}/${month}`));
      if (!snap.exists()) {
        toast('이번 달 활동 참여자 데이터가 없습니다.', {
          position: 'top-center',
        });
        return;
      }
      const ids = Object.keys(snap.val() as Record<string, true>);
      if (ids.length < 2) {
        toast('참여자가 2명 이상이어야 합니다.', { position: 'top-center' });
        return;
      }
      const shuffled = [...ids].sort(() => Math.random() - 0.5);
      const [vId, hId] = shuffled;
      setRoleDraft({
        villainId: vId,
        villainName: allNames[vId] ?? vId,
        helperId: hId,
        helperName: allNames[hId] ?? hId,
      });
      toast('✅ 랜덤 배정 완료', {
        position: 'top-center',
        duration: 1800,
        style: toSuccessStyle,
      });
    } catch {
      toast.error('배정 중 오류가 발생했습니다.', { position: 'top-center' });
    }
  }, [ym, allNames]);

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      if (missionType === 'scoreGuess') {
        await saveScoreGuessMissionContent(
          ym,
          scoreGuessConfigDraft,
          data?.config?.status ?? null,
        );
      } else {
        await saveVillainMissionContent(
          ym,
          configDraft,
          hiddenDraft,
          data?.config?.status ?? null,
        );
      }
      toast('✅ 미션 내용이 저장되었습니다.', {
        position: 'top-center',
        duration: 2000,
        style: toSuccessStyle,
      });
    } catch {
      toast.error('저장 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRoles = async () => {
    if (!roleDraft.villainId || !roleDraft.helperId) {
      toast('빌런과 조력자를 모두 지정해주세요.', { position: 'top-center' });
      return;
    }
    if (roleDraft.villainId === roleDraft.helperId) {
      toast('빌런과 조력자는 다른 사람이어야 합니다.', {
        position: 'top-center',
      });
      return;
    }
    const hasExistingVotes =
      !isScoreGuessMission(data) && Object.keys(data?.votes ?? {}).length > 0;
    if (hasExistingVotes && !confirmRoleChange) {
      setConfirmRoleChange(true);
      toast('이미 투표가 진행 중입니다. 다시 누르면 기존 투표가 초기화됩니다.', {
        position: 'top-center',
        duration: 2500,
      });
      return;
    }
    setSaving(true);
    try {
      if (hasExistingVotes) await resetVotes(ym);
      await assignRoles(ym, roleDraft.villainId, roleDraft.helperId);
      setConfirmRoleChange(false);
      toast('✅ 역할 배정이 저장되었습니다.', {
        position: 'top-center',
        duration: 2000,
        style: toSuccessStyle,
      });
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
    if (isScoreGuessMission(data) && data.result?.revealed === true) {
      toast('이미 결과가 공개된 미션입니다. 후보를 바꾸려면 먼저 "미션 초기화"를 눌러주세요.', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }
    const hasExistingVotes =
      isScoreGuessMission(data) && Object.keys(data.votes ?? {}).length > 0;
    if (hasExistingVotes && !confirmTargetChange) {
      setConfirmTargetChange(true);
      toast('이미 예측이 진행 중입니다. 다시 누르면 기존 예측이 초기화됩니다.', {
        position: 'top-center',
        duration: 2500,
      });
      return;
    }
    setSaving(true);
    try {
      if (hasExistingVotes) await resetVotes(ym);
      await confirmScoreGuessTargets(ym, empIds);
      setConfirmTargetChange(false);
      toast('✅ 후보가 확정되었습니다.', {
        position: 'top-center',
        duration: 2000,
        style: toSuccessStyle,
      });
    } catch {
      toast.error('확정 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (next: MissionStatus) => {
    setSaving(true);
    try {
      await setMissionStatus(ym, next);
      toast(`✅ 상태가 '${STATUS_LABEL[next]}'로 변경되었습니다.`, {
        position: 'top-center',
        duration: 2000,
        style: toSuccessStyle,
      });
    } catch {
      toast.error('상태 변경 중 오류가 발생했습니다.', {
        position: 'top-center',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReveal = async () => {
    if (!data) return;
    const confirmMsg = data.result?.revealed
      ? '이미 공개된 결과입니다. 다시 동기화하시겠습니까? (PIN은 재지급되지 않습니다)'
      : '결과를 공개하시겠습니까? 공개 즉시 PIN이 지급됩니다.';
    if (!confirm(confirmMsg)) return;
    setRevealing(true);
    try {
      if (isScoreGuessMission(data)) {
        const res = await revealScoreGuessMissionResult(ym, data);
        toast(
          `✅ 결과 공개 완료 — 예측 성공 ${res.correctVoters.length}명, 순위 보상 ${res.topTargets.length}명 🎉`,
          {
            position: 'top-center',
            duration: 3000,
            style: toSuccessStyle,
          },
        );
      } else {
        const res = await revealMissionResult(ym, data);
        const msg = res.villainWon
          ? `빌런 생존! ${res.helperWon ? '조력자 공동 수상 🎉' : '빌런 단독 수상 🎉'}`
          : `정답자 ${res.correctVoters.length}명 수상 🎉`;
        toast(`✅ 결과 공개 완료 — ${msg}`, {
          position: 'top-center',
          duration: 3000,
          style: toSuccessStyle,
        });
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '오류가 발생했습니다.', {
        position: 'top-center',
      });
    } finally {
      setRevealing(false);
    }
  };

  const handleResetMission = async () => {
    if (
      data?.result?.revealed &&
      !confirm(
        '이미 결과가 공개된 미션입니다. 초기화하면 이미 지급된 PIN이 전부 환수됩니다. 계속하시겠습니까?',
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      await resetMissionState(ym, data);
      setConfirmReset(false);
      toast('✅ 미션 상태가 초기화되었습니다.', {
        position: 'top-center',
        duration: 2000,
        style: toSuccessStyle,
      });
    } catch {
      toast.error('초기화 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSaving(false);
    }
  };

  const monthOptions = useMemo(() => {
    const options: string[] = [];
    const curY = Number(currentYm.slice(0, 4));
    const curM = Number(currentYm.slice(4));
    for (let y = 2025; y <= curY; y++) {
      const mStart = y === 2025 ? 7 : 1;
      const mEnd = y === curY ? curM : 12;
      for (let m = mStart; m <= mEnd; m++) {
        options.push(`${y}${String(m).padStart(2, '0')}`);
      }
    }
    return options.reverse();
  }, [currentYm]);

  const status = data?.config?.status ?? 'draft';
  const canChangeType = !data?.config || status === 'draft';

  const villainVotes = useMemo(
    () => (!isScoreGuessMission(data) ? data?.votes ?? {} : {}),
    [data],
  );
  const totalVillainVotes = Object.keys(villainVotes).length;
  const villainVoteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const target of Object.values(villainVotes)) {
      counts[target] = (counts[target] ?? 0) + 1;
    }
    return counts;
  }, [villainVotes]);

  const scoreGuessVotes = useMemo(
    () => (isScoreGuessMission(data) ? data.votes ?? {} : {}),
    [data],
  );
  const totalScoreGuessVotes = Object.keys(scoreGuessVotes).length;
  const scoreGuessVoteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const vote of Object.values(scoreGuessVotes)) {
      counts[vote.targetEmpId] = (counts[vote.targetEmpId] ?? 0) + 1;
    }
    return counts;
  }, [scoreGuessVotes]);

  const renderVillainVoteStats = () => {
    if (totalVillainVotes === 0) return <EmptyMsg>아직 투표가 없습니다.</EmptyMsg>;
    const villainId = !isScoreGuessMission(data) ? data?.roles?.villain : undefined;
    const helperId = !isScoreGuessMission(data) ? data?.roles?.helper : undefined;
    const sorted = Object.entries(villainVoteCounts).sort(([, a], [, b]) => b - a);
    return (
      <VoteStatList>
        {sorted.map(([empId, count]) => (
          <VoteStatRow key={empId}>
            <VoteStatLabel>{allNames[empId] ?? empId}</VoteStatLabel>
            <VoteBar
              pct={totalVillainVotes > 0 ? Math.round((count / totalVillainVotes) * 100) : 0}
              color={empId === villainId ? '#ef4444' : empId === helperId ? '#3b82f6' : '#9ca3af'}
            />
            <VoteStatCount>{count}표</VoteStatCount>
          </VoteStatRow>
        ))}
        <VoteStatRow>
          <VoteStatLabel style={{ color: '#6b7280' }}>총 투표</VoteStatLabel>
          <VoteStatCount style={{ color: '#6b7280', marginLeft: 'auto' }}>
            {totalVillainVotes}명
          </VoteStatCount>
        </VoteStatRow>
      </VoteStatList>
    );
  };

  const renderScoreGuessVoteStats = () => {
    if (totalScoreGuessVotes === 0) return <EmptyMsg>아직 예측이 없습니다.</EmptyMsg>;
    const sorted = Object.entries(scoreGuessVoteCounts).sort(([, a], [, b]) => b - a);
    return (
      <VoteStatList>
        {sorted.map(([empId, count]) => (
          <VoteStatRow key={empId}>
            <VoteStatLabel>{allNames[empId] ?? empId}</VoteStatLabel>
            <VoteBar
              pct={totalScoreGuessVotes > 0 ? Math.round((count / totalScoreGuessVotes) * 100) : 0}
              color="#10b981"
            />
            <VoteStatCount>{count}표</VoteStatCount>
          </VoteStatRow>
        ))}
        <VoteStatRow>
          <VoteStatLabel style={{ color: '#6b7280' }}>총 예측</VoteStatLabel>
          <VoteStatCount style={{ color: '#6b7280', marginLeft: 'auto' }}>
            {totalScoreGuessVotes}명
          </VoteStatCount>
        </VoteStatRow>
      </VoteStatList>
    );
  };

  return (
    <AdminLayout title="활동 미션 관리">
      <MonthSelect value={ym} onChange={(e) => setYm(e.target.value)}>
        {monthOptions.map((ym) => (
          <option key={ym} value={ym}>
            {ym.slice(0, 4)}년 {Number(ym.slice(4))}월
          </option>
        ))}
      </MonthSelect>

      <StatusRow>
        <StatusBadge status={status}>{STATUS_LABEL[status]}</StatusBadge>
        {status === 'draft' && (
          <StatusBtn
            color="#10b981"
            disabled={saving}
            onClick={() => handleStatusChange('active')}
          >
            미션 공개
          </StatusBtn>
        )}
        {status === 'active' && (
          <>
            {isScoreGuessMission(data) ? (
              <StatusBtn
                color="#111827"
                disabled={saving || revealing}
                onClick={handleReveal}
              >
                {revealing ? '처리중...' : '결과 공개'}
              </StatusBtn>
            ) : (
              <StatusBtn
                color="#f59e0b"
                disabled={saving}
                onClick={() => handleStatusChange('voting')}
              >
                투표 시작
              </StatusBtn>
            )}
            <StatusBtn
              color="#9ca3af"
              disabled={saving}
              onClick={() => handleStatusChange('draft')}
            >
              준비중으로
            </StatusBtn>
          </>
        )}
        {status === 'voting' && (
          <>
            <StatusBtn
              color="#111827"
              disabled={saving || revealing}
              onClick={handleReveal}
            >
              {revealing ? '처리중...' : '결과 공개'}
            </StatusBtn>
            <StatusBtn
              color="#9ca3af"
              disabled={saving}
              onClick={() => handleStatusChange('active')}
            >
              미션공개로
            </StatusBtn>
            <StatusBtn
              color="#9ca3af"
              disabled={saving}
              onClick={() => handleStatusChange('draft')}
            >
              준비중으로
            </StatusBtn>
          </>
        )}
        {status === 'revealed' && (
          <>
            {!isScoreGuessMission(data) && (
              <StatusBtn
                color="#f59e0b"
                disabled={saving}
                onClick={() => handleStatusChange('voting')}
              >
                투표중으로
              </StatusBtn>
            )}
            <StatusBtn
              color="#10b981"
              disabled={saving}
              onClick={() => handleStatusChange('active')}
            >
              미션공개로
            </StatusBtn>
            <StatusBtn
              color="#9ca3af"
              disabled={saving}
              onClick={() => handleStatusChange('draft')}
            >
              준비중으로
            </StatusBtn>
          </>
        )}
      </StatusRow>

      <TypeSelectRow>
        <TypeSelectBtn
          active={missionType === 'villain'}
          disabled={!canChangeType}
          onClick={() => setMissionType('villain')}
        >
          빌런 찾기
        </TypeSelectBtn>
        <TypeSelectBtn
          active={missionType === 'scoreGuess'}
          disabled={!canChangeType}
          onClick={() => setMissionType('scoreGuess')}
        >
          신규회원 점수 맞추기
        </TypeSelectBtn>
      </TypeSelectRow>

      <FormTitle>이달의 미션</FormTitle>

      {missionType === 'scoreGuess' ? (
        <>
          <SectionBlock>
            <FieldLabel>미션 제목</FieldLabel>
            <MissionInput
              value={scoreGuessConfigDraft.title}
              onChange={(e) =>
                setScoreGuessConfigDraft((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="예: 신규회원과 함께하는 7월"
            />
          </SectionBlock>

          <SectionBlock>
            <FieldLabel>미션 내용</FieldLabel>
            <MissionRichEditor
              value={scoreGuessConfigDraft.description}
              onChange={(html) =>
                setScoreGuessConfigDraft((p) => ({ ...p, description: html }))
              }
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
            이번 분기({quarterStartYm.slice(4)}~{quarterEndYm.slice(4)}월)
            가입 + 이번 달 활동 참여자 기준으로 자동 감지됩니다.
          </QuarterHint>

          <SectionBlock>
            {candidatesLoading ? (
              <EmptyMsg>후보를 불러오는 중...</EmptyMsg>
            ) : candidates.length === 0 ? (
              <EmptyMsg>이번 분기 신규회원 중 이번 달 활동 참여자가 없습니다.</EmptyMsg>
            ) : (
              <CandidateList>
                {candidates.map(([empId, name]) => {
                  const checked = !!candidateChecked[empId];
                  return (
                    <CandidateRow
                      key={empId}
                      checked={checked}
                      onClick={() => toggleCandidate(empId)}
                    >
                      <span>
                        {name} <EmpIdBadge>{empId}</EmpIdBadge>
                      </span>
                      <CandidateCheck checked={checked}>
                        {checked ? '✓' : ''}
                      </CandidateCheck>
                    </CandidateRow>
                  );
                })}
              </CandidateList>
            )}

            {isScoreGuessMission(data) && (data.targets?.empIds?.length ?? 0) > 0 && (
              <ConfirmedBadgeRow>
                확정됨: {data.targets!.empIds.map((id) => allNames[id] ?? id).join(', ')}
              </ConfirmedBadgeRow>
            )}

            <SaveRow>
              <SaveBtn
                onClick={handleConfirmTargets}
                disabled={saving || Object.keys(candidateChecked).length === 0}
              >
                {confirmTargetChange
                  ? '정말 확정 (투표 초기화됨)'
                  : saving
                    ? '처리 중...'
                    : '후보 확정'}
              </SaveBtn>
            </SaveRow>
          </SectionBlock>
        </>
      ) : (
        <>
          <SectionBlock>
            <FieldLabel>미션 제목</FieldLabel>
            <MissionInput
              value={configDraft.title}
              onChange={(e) =>
                setConfigDraft((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="예: 5월 활동 미션"
            />
          </SectionBlock>

          <SectionBlock>
            <FieldLabel>미션 내용</FieldLabel>
            <MissionRichEditor
              value={configDraft.description}
              onChange={(html) =>
                setConfigDraft((p) => ({ ...p, description: html }))
              }
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
                  value={configDraft.revealDays}
                  onChange={createIntFieldHandler(setConfigDraft, 'revealDays')}
                />
                일 전부터 공개
              </NumberRow>
            </SettingSection>

            <SettingDivider />

            <SettingSection>
              <SettingSectionTitle>보상 핀</SettingSectionTitle>
              <SettingGrid>
                <SettingCell>
                  <SettingCellLabel>정답자</SettingCellLabel>
                  <NumberRow>
                    <MissionInput
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={rewardPinRaw}
                      {...createPinInputHandlers(
                        setRewardPinRaw,
                        (n) => setConfigDraft((p) => ({ ...p, rewardPin: n })),
                        configDraft.rewardPin,
                      )}
                    />
                    PIN
                  </NumberRow>
                </SettingCell>
                <SettingCell>
                  <SettingCellLabel>빌런 성공</SettingCellLabel>
                  <NumberRow>
                    <MissionInput
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={villainRewardPinRaw}
                      {...createPinInputHandlers(
                        setVillainRewardPinRaw,
                        (n) => setConfigDraft((p) => ({ ...p, villainRewardPin: n })),
                        configDraft.villainRewardPin,
                      )}
                    />
                    PIN
                  </NumberRow>
                </SettingCell>
              </SettingGrid>
            </SettingSection>

            <SettingDivider />

            <SettingSection>
              <SettingSectionTitle>투표 조건</SettingSectionTitle>
              <SettingGrid>
                <SettingCell>
                  <SettingCellLabel>빌런 검거 기준</SettingCellLabel>
                  <NumberRow>
                    <MissionInput
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={configDraft.villainCatchThreshold}
                      onChange={createIntFieldHandler(setConfigDraft, 'villainCatchThreshold')}
                    />
                    표 이상
                  </NumberRow>
                </SettingCell>
                <SettingCell>
                  <SettingCellLabel>조력자 공동 수상</SettingCellLabel>
                  <NumberRow>
                    <MissionInput
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={configDraft.helperVoteThreshold}
                      onChange={createIntFieldHandler(setConfigDraft, 'helperVoteThreshold')}
                    />
                    표 이상
                  </NumberRow>
                </SettingCell>
              </SettingGrid>
            </SettingSection>
          </SettingGroup>

          <Divider />

          <FormTitle>히든 미션</FormTitle>

          <HiddenSection role="villain">
            <HiddenSectionTitle role="villain">또랑 빌런</HiddenSectionTitle>
            <FieldLabel>미션 제목 (빌런 전용)</FieldLabel>
            <MissionInput
              value={hiddenDraft.villain.title}
              onChange={(e) =>
                setHiddenDraft((p) => ({
                  ...p,
                  villain: { ...p.villain, title: e.target.value },
                }))
              }
              placeholder="예: 또랑 빌런 미션"
            />
            <FieldLabel style={{ marginTop: 8 }}>결과 공개 제목</FieldLabel>
            <MissionInput
              value={hiddenDraft.villain.revealTitle ?? ''}
              onChange={(e) =>
                setHiddenDraft((p) => ({
                  ...p,
                  villain: { ...p.villain, revealTitle: e.target.value },
                }))
              }
              placeholder="예: 🎭 빌런에게 주어진 미션"
            />
            <FieldLabel style={{ marginTop: 8 }}>미션 내용</FieldLabel>
            <MissionRichEditor
              value={hiddenDraft.villain.description}
              onChange={(html) =>
                setHiddenDraft((p) => ({
                  ...p,
                  villain: { ...p.villain, description: html },
                }))
              }
              placeholder="빌런에게만 공개될 미션 내용을 입력하세요."
            />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <LookupBtn
                type="button"
                style={{ background: '#ef4444' }}
                disabled={
                  !hiddenDraft.villain.title && !hiddenDraft.villain.description
                }
                onClick={() => setVillainPreviewOpen(true)}
              >
                미리보기
              </LookupBtn>
            </div>
          </HiddenSection>

          <HiddenSection role="helper">
            <HiddenSectionTitle role="helper">빌런 조력자</HiddenSectionTitle>
            <FieldLabel>미션 제목</FieldLabel>
            <MissionInput
              value={hiddenDraft.helper.title}
              onChange={(e) =>
                setHiddenDraft((p) => ({
                  ...p,
                  helper: { ...p.helper, title: e.target.value },
                }))
              }
              placeholder="예: 빌런 조력자 미션"
            />
            <FieldLabel style={{ marginTop: 8 }}>미션 내용</FieldLabel>
            <MissionRichEditor
              value={hiddenDraft.helper.description}
              onChange={(html) =>
                setHiddenDraft((p) => ({
                  ...p,
                  helper: { ...p.helper, description: html },
                }))
              }
              placeholder="조력자에게만 공개될 미션 내용을 입력하세요."
            />
          </HiddenSection>

          <SaveRow style={{ marginBottom: 8 }}>
            <SaveBtn onClick={handleSaveContent} disabled={saving}>
              {saving ? '저장 중...' : '미션 내용 저장'}
            </SaveBtn>
          </SaveRow>

          <Divider />

          <FormTitle>역할 배정</FormTitle>

          <SectionBlock>
            <RoleRow>
              <RoleLabel role="villain">또랑 빌런</RoleLabel>
              <RoleNameInput
                value={roleDraft.villainName}
                onChange={(e) =>
                  setRoleDraft((p) => ({
                    ...p,
                    villainName: e.target.value,
                    villainId: '',
                  }))
                }
                placeholder="이름 검색"
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    lookupRole('villain');
                  }
                }}
              />
              <LookupBtn type="button" onClick={() => lookupRole('villain')}>
                조회
              </LookupBtn>
              {roleDraft.villainId && (
                <EmpIdBadge style={{ borderColor: '#fca5a5' }}>
                  {roleDraft.villainId}
                </EmpIdBadge>
              )}
            </RoleRow>
            {villainDropdown.length > 0 && (
              <NameDropdown>
                {villainDropdown.map(([eid, n]) => (
                  <NameDropdownItem
                    key={eid}
                    onClick={() => {
                      setRoleDraft((p) => ({
                        ...p,
                        villainId: eid,
                        villainName: n,
                      }));
                      setVillainDropdown([]);
                    }}
                  >
                    {n}
                    <span>{eid}</span>
                  </NameDropdownItem>
                ))}
              </NameDropdown>
            )}
          </SectionBlock>

          <SectionBlock>
            <RoleRow>
              <RoleLabel role="helper">빌런 조력자</RoleLabel>
              <RoleNameInput
                value={roleDraft.helperName}
                onChange={(e) =>
                  setRoleDraft((p) => ({
                    ...p,
                    helperName: e.target.value,
                    helperId: '',
                  }))
                }
                placeholder="이름 검색"
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    lookupRole('helper');
                  }
                }}
              />
              <LookupBtn type="button" onClick={() => lookupRole('helper')}>
                조회
              </LookupBtn>
              {roleDraft.helperId && (
                <EmpIdBadge style={{ borderColor: '#bfdbfe' }}>
                  {roleDraft.helperId}
                </EmpIdBadge>
              )}
            </RoleRow>
            {helperDropdown.length > 0 && (
              <NameDropdown>
                {helperDropdown.map(([eid, n]) => (
                  <NameDropdownItem
                    key={eid}
                    onClick={() => {
                      setRoleDraft((p) => ({ ...p, helperId: eid, helperName: n }));
                      setHelperDropdown([]);
                    }}
                  >
                    {n}
                    <span>{eid}</span>
                  </NameDropdownItem>
                ))}
              </NameDropdown>
            )}
          </SectionBlock>

          <SaveRow>
            <RandomBtn onClick={randomAssign} disabled={saving}>
              랜덤 배정
            </RandomBtn>
            <SaveBtn onClick={handleSaveRoles} disabled={saving}>
              {confirmRoleChange
                ? '정말 저장 (투표 초기화됨)'
                : saving
                  ? '저장 중...'
                  : '역할 저장'}
            </SaveBtn>
          </SaveRow>
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
              onClick={async () => {
                if (!confirm('투표를 초기화하시겠습니까? 지금까지의 투표/예측 기록이 모두 삭제됩니다.')) return;
                setSaving(true);
                try {
                  await resetVotes(ym);
                  toast('🗑️ 투표가 초기화되었습니다.', {
                    position: 'top-center',
                    duration: 2000,
                    style: {
                      backgroundColor: '#fef9c3',
                      color: '#854d0e',
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                    },
                  });
                } catch {
                  toast.error('초기화 중 오류가 발생했습니다.', {
                    position: 'top-center',
                  });
                } finally {
                  setSaving(false);
                }
              }}
            >
              투표 초기화
            </StatusBtn>
            {!confirmReset ? (
              <StatusBtn
                color="#dc2626"
                disabled={saving}
                onClick={() => setConfirmReset(true)}
              >
                미션 초기화
              </StatusBtn>
            ) : (
              <>
                <StatusBtn
                  color="#dc2626"
                  disabled={saving}
                  onClick={handleResetMission}
                >
                  정말 초기화
                </StatusBtn>
                <StatusBtn
                  color="#9ca3af"
                  disabled={saving}
                  onClick={() => setConfirmReset(false)}
                >
                  취소
                </StatusBtn>
              </>
            )}
          </VoteHeaderRow>
          {isScoreGuessMission(data) ? renderScoreGuessVoteStats() : renderVillainVoteStats()}
          {data?.result && !isScoreGuessMission(data) && (
            <ResultArea>
              <div>
                <strong>빌런:</strong>{' '}
                {allNames[data.roles?.villain ?? ''] ??
                  data.roles?.villain ??
                  '-'}
                {data.result.villainWon ? ' 🎉 생존' : ' 검거됨'}
              </div>
              <div>
                <strong>조력자:</strong>{' '}
                {allNames[data.roles?.helper ?? ''] ??
                  data.roles?.helper ??
                  '-'}
                {data.result.helperWon ? ' 🎉 공동 수상' : ''}
              </div>
              {!data.result.villainWon && (
                <div>
                  <strong>정답자:</strong>{' '}
                  {(data.result.correctVoters ?? [])
                    .map((id) => allNames[id] ?? id)
                    .join(', ') || '없음'}
                </div>
              )}
            </ResultArea>
          )}
          {data?.result && isScoreGuessMission(data) && (
            <ResultArea>
              {(data.targets?.empIds ?? []).map((id) => (
                <div key={id}>
                  <strong>{allNames[id] ?? id}:</strong>{' '}
                  {data.result?.actualScores?.[id] ?? '-'}점
                </div>
              ))}
              <div>
                <strong>예측 성공:</strong>{' '}
                {(data.result.correctVoters ?? [])
                  .map((id) => allNames[id] ?? id)
                  .join(', ') || '없음'}
              </div>
            </ResultArea>
          )}
        </>
      )}

      <SmallText
        top="middle"
        onClick={goBack}
      >
        돌아가기
      </SmallText>

      <VillainMissionModal
        isOpen={villainPreviewOpen}
        onClose={() => setVillainPreviewOpen(false)}
        hidden={hiddenDraft.villain}
      />
    </AdminLayout>
  );
};

export default AdminMission;
