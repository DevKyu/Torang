import { useCallback, useEffect, useMemo, useState } from 'react';
import VillainMissionModal from '../mission/VillainMissionModal';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';
import MissionRichEditor from './MissionRichEditor';
import { db } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { SmallText } from '../../styles/commonStyle';
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
} from '../../styles/AdminMissionStyle';
import {
  useMission,
  saveMissionContent,
  assignRoles,
  setMissionStatus,
  revealMissionResult,
  resetVotes,
  resetMissionState,
  type MissionConfig,
  type MissionHidden,
  type MissionStatus,
} from '../../hooks/useMission';

type RoleDraft = {
  villainName: string;
  villainId: string;
  helperName: string;
  helperId: string;
};

type ConfigDraft = Omit<MissionConfig, 'status'>;

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

const AdminMission = () => {
  const navigate = useNavigate();

  const currentYm = useMemo(() => {
    const now = useUiStore.getState().getServerNow();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [ym, setYm] = useState(currentYm);
  const { data, loading } = useMission(ym);

  const [configDraft, setConfigDraft] = useState<ConfigDraft>({
    title: '',
    description: '',
    revealDays: 7,
    rewardPin: 1,
    villainRewardPin: 1,
    helperVoteThreshold: 3,
    villainCatchThreshold: 1,
  });

  const [hiddenDraft, setHiddenDraft] = useState<MissionHidden>({
    villain: { title: '또랑 빌런 미션', description: '' },
    helper: { title: '빌런 조력자 미션', description: '' },
  });

  const [roleDraft, setRoleDraft] = useState<RoleDraft>({
    villainName: '',
    villainId: '',
    helperName: '',
    helperId: '',
  });

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
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (data) {
      setConfigDraft({
        title: data.config?.title ?? '',
        description: data.config?.description ?? '',
        revealDays: data.config?.revealDays ?? 7,
        rewardPin: data.config?.rewardPin ?? 1,
        villainRewardPin: data.config?.villainRewardPin ?? data.config?.rewardPin ?? 1,
        helperVoteThreshold: data.config?.helperVoteThreshold ?? 3,
        villainCatchThreshold: data.config?.villainCatchThreshold ?? 1,
      });
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
      setConfigDraft({
        title: '',
        description: '',
        revealDays: 7,
        rewardPin: 1,
        villainRewardPin: 1,
        helperVoteThreshold: 3,
        villainCatchThreshold: 1,
      });
      setHiddenDraft({
        villain: { title: '또랑 빌런 미션', description: '' },
        helper: { title: '빌런 조력자 미션', description: '' },
      });
      setRoleDraft({
        villainName: '',
        villainId: '',
        helperName: '',
        helperId: '',
      });
    }
  }, [data, loading, allNames]);

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
      await saveMissionContent(
        ym,
        configDraft,
        hiddenDraft,
        data?.config?.status ?? null,
      );
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
    setSaving(true);
    try {
      await assignRoles(ym, roleDraft.villainId, roleDraft.helperId);
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
    setRevealing(true);
    try {
      const res = await revealMissionResult(ym, data);
      const msg = res.villainWon
        ? `빌런 생존! ${res.helperWon ? '조력자 공동 수상 🎉' : '빌런 단독 수상 🎉'}`
        : `정답자 ${res.correctVoters.length}명 수상 🎉`;
      toast(`✅ 결과 공개 완료 — ${msg}`, {
        position: 'top-center',
        duration: 3000,
        style: toSuccessStyle,
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '오류가 발생했습니다.', {
        position: 'top-center',
      });
    } finally {
      setRevealing(false);
    }
  };

  const handleResetMission = async () => {
    setSaving(true);
    try {
      await resetMissionState(ym);
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
  const votes = data?.votes ?? {};
  const totalVotes = Object.keys(votes).length;

  const voteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const target of Object.values(votes)) {
      counts[target] = (counts[target] ?? 0) + 1;
    }
    return counts;
  }, [votes]);

  const renderVoteStats = () => {
    if (totalVotes === 0) return <EmptyMsg>아직 투표가 없습니다.</EmptyMsg>;
    const sorted = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);
    return (
      <VoteStatList>
        {sorted.map(([empId, count]) => (
          <VoteStatRow key={empId}>
            <VoteStatLabel>{allNames[empId] ?? empId}</VoteStatLabel>
            <VoteBar
              pct={totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0}
              color={
                empId === data?.roles?.villain
                  ? '#ef4444'
                  : empId === data?.roles?.helper
                    ? '#3b82f6'
                    : '#9ca3af'
              }
            />
            <VoteStatCount>{count}표</VoteStatCount>
          </VoteStatRow>
        ))}
        <VoteStatRow>
          <VoteStatLabel style={{ color: '#6b7280' }}>총 투표</VoteStatLabel>
          <VoteStatCount style={{ color: '#6b7280', marginLeft: 'auto' }}>
            {totalVotes}명
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
            <StatusBtn
              color="#f59e0b"
              disabled={saving}
              onClick={() => handleStatusChange('voting')}
            >
              투표 시작
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
          </>
        )}
        {status === 'revealed' && (
          <>
            <StatusBtn
              color="#f59e0b"
              disabled={saving}
              onClick={() => handleStatusChange('voting')}
            >
              투표중으로
            </StatusBtn>
            <StatusBtn
              color="#10b981"
              disabled={saving}
              onClick={() => handleStatusChange('active')}
            >
              미션공개로
            </StatusBtn>
          </>
        )}
      </StatusRow>

      <FormTitle>이달의 미션</FormTitle>

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
              type="number"
              min={1}
              max={30}
              value={configDraft.revealDays}
              onChange={(e) =>
                setConfigDraft((p) => ({
                  ...p,
                  revealDays: Number(e.target.value),
                }))
              }
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
                  type="number"
                  min={0}
                  step={0.1}
                  value={configDraft.rewardPin}
                  onChange={(e) =>
                    setConfigDraft((p) => ({
                      ...p,
                      rewardPin: Number(e.target.value),
                    }))
                  }
                />
                PIN
              </NumberRow>
            </SettingCell>
            <SettingCell>
              <SettingCellLabel>빌런 성공</SettingCellLabel>
              <NumberRow>
                <MissionInput
                  type="number"
                  min={0}
                  step={0.1}
                  value={configDraft.villainRewardPin}
                  onChange={(e) =>
                    setConfigDraft((p) => ({
                      ...p,
                      villainRewardPin: Number(e.target.value),
                    }))
                  }
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
                  type="number"
                  min={1}
                  value={configDraft.villainCatchThreshold}
                  onChange={(e) =>
                    setConfigDraft((p) => ({
                      ...p,
                      villainCatchThreshold: Number(e.target.value),
                    }))
                  }
                />
                표 이상
              </NumberRow>
            </SettingCell>
            <SettingCell>
              <SettingCellLabel>조력자 공동 수상</SettingCellLabel>
              <NumberRow>
                <MissionInput
                  type="number"
                  min={1}
                  value={configDraft.helperVoteThreshold}
                  onChange={(e) =>
                    setConfigDraft((p) => ({
                      ...p,
                      helperVoteThreshold: Number(e.target.value),
                    }))
                  }
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
          {saving ? '저장 중...' : '역할 저장'}
        </SaveBtn>
      </SaveRow>

      {(status === 'voting' || status === 'revealed') && (
        <>
          <Divider />
          <VoteHeaderRow>
            <FormTitle style={{ margin: 0 }}>투표 현황</FormTitle>
            <StatusBtn
              color="#6b7280"
              disabled={saving}
              onClick={async () => {
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
          {renderVoteStats()}
          {data?.result && (
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
        </>
      )}

      <SmallText
        top="middle"
        onTap={() => navigate('/admin', { replace: true })}
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
