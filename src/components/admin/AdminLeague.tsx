import { useCallback, useEffect, useMemo, useState } from 'react';
import { ref, set, remove, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';
import { db } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { SmallText } from '../../styles/commonStyle';
import {
  CancelBtn,
  MonthSelect,
  GroupList,
  GroupRow,
  GroupBadge,
  GroupDate,
  EmptyMsg,
  AddGroupBtn,
  FormSection,
  FormTitle,
  FieldLabel,
  TeamSection,
  TeamHeader,
  PlayerInput,
  LookupBtn,
  AddPlayerBtn,
  RemoveBtn,
  WinnerRow,
  WinnerBtn,
  SaveRow,
  SaveBtn,
  DeleteBtn,
  EmpIdBadge,
  NameDropdown,
  NameDropdownItem,
  PlayerRowWrap,
  PlayerRowMain,
  PlayerRowSub,
} from './AdminLeagueStyle';
import type { RawGroup } from '../../hooks/useActivityLeague';

type PlayerEntry = {
  empId: string;
  name: string;
  score1: string;
  score2: string;
};

type GroupDraft = {
  groupId: string;
  date: string;
  team1: PlayerEntry[];
  team2: PlayerEntry[];
  winner: 'team1' | 'team2' | 'draw';
};

type RawPlayer = {
  name: string;
  score1: number;
  score2: number;
  order?: number;
};

const toDateInput = (n: number) => {
  const y = Math.floor(n / 10000);
  const m = String(Math.floor((n % 10000) / 100)).padStart(2, '0');
  const d = String(n % 100).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

const fromDateInput = (s: string) => Number(s.replace(/-/g, ''));

const rawToPlayerEntries = (raw?: Record<string, RawPlayer>): PlayerEntry[] =>
  raw
    ? Object.entries(raw)
        .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
        .map(([id, p]) => ({
          empId: id,
          name: p.name,
          score1: String(p.score1 ?? 0),
          score2: String(p.score2 ?? 0),
        }))
    : [];

const AdminLeague = () => {
  const navigate = useNavigate();

  const currentYm = useMemo(() => {
    const now = useUiStore.getState().getServerNow();

    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [yyyymm, setYyyymm] = useState(currentYm);
  const [groups, setGroups] = useState<Record<string, RawGroup>>({});
  const [editing, setEditing] = useState<GroupDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [allNames, setAllNames] = useState<Record<string, string>>({});
  const [playerDropdowns, setPlayerDropdowns] = useState<
    Record<string, [string, string][]>
  >({});

  const loadGroups = useCallback(async (ym: string) => {
    try {
      const snap = await get(ref(db, `team/${ym}`));

      setGroups(snap.exists() ? (snap.val() as Record<string, RawGroup>) : {});
    } catch {
      setGroups({});
    }
  }, []);

  useEffect(() => {
    loadGroups(yyyymm);
    setEditing(null);
  }, [yyyymm, loadGroups]);

  useEffect(() => {
    (async () => {
      try {
        const snap = await get(ref(db, 'names'));

        if (snap.exists()) {
          setAllNames(snap.val() as Record<string, string>);
        }
      } catch {}
    })();
  }, []);

  const openEdit = (groupId: string) => {
    const g = groups[groupId];

    setEditing({
      groupId,
      date: g.date ? toDateInput(g.date) : '',
      team1: rawToPlayerEntries(g.team1),
      team2: rawToPlayerEntries(g.team2),
      winner: g.winner ?? 'team1',
    });
  };

  const openNew = async () => {
    const existing = Object.keys(groups).sort();

    const nextId =
      existing.length === 0
        ? 'A'
        : String.fromCharCode(existing[existing.length - 1].charCodeAt(0) + 1);

    const year = yyyymm.slice(0, 4);
    const month = String(Number(yyyymm.slice(4)));

    let defaultDate = '';

    const snap = await get(ref(db, `activityDate/${year}/${month}`));

    if (snap.exists()) {
      defaultDate = toDateInput(snap.val() as number);
    }

    setEditing({
      groupId: nextId,
      date: defaultDate,
      team1: [{ empId: '', name: '', score1: '', score2: '' }],
      team2: [{ empId: '', name: '', score1: '', score2: '' }],
      winner: 'team1',
    });
  };

  const lookupByName = (teamKey: 'team1' | 'team2', idx: number) => {
    if (!editing) {
      return;
    }

    const query = editing[teamKey][idx].name.trim().toLowerCase();

    if (!query) {
      return;
    }

    const matches = Object.entries(allNames).filter(([, n]) =>
      n.toLowerCase().includes(query),
    );

    if (matches.length === 0) {
      setEditing((prev) => {
        if (!prev) {
          return prev;
        }

        const team = [...prev[teamKey]];

        team[idx] = {
          ...team[idx],
          empId: 'guest',
        };

        return {
          ...prev,
          [teamKey]: team,
        };
      });

      toast('등록되지 않은 회원입니다. 비회원으로 저장됩니다.', {
        position: 'top-center',
        duration: 1800,
      });

      return;
    }

    if (matches.length === 1) {
      const [empId, name] = matches[0];

      setEditing((prev) => {
        if (!prev) {
          return prev;
        }

        const team = [...prev[teamKey]];

        team[idx] = {
          ...team[idx],
          empId,
          name,
        };

        return {
          ...prev,
          [teamKey]: team,
        };
      });

      return;
    }

    setPlayerDropdowns((prev) => ({
      ...prev,
      [`${teamKey}_${idx}`]: matches,
    }));
  };

  const selectFromDropdown = (
    teamKey: 'team1' | 'team2',
    idx: number,
    empId: string,
    name: string,
  ) => {
    setEditing((prev) => {
      if (!prev) {
        return prev;
      }

      const team = [...prev[teamKey]];

      team[idx] = {
        ...team[idx],
        empId,
        name,
      };

      return {
        ...prev,
        [teamKey]: team,
      };
    });

    setPlayerDropdowns((prev) => {
      const next = { ...prev };

      delete next[`${teamKey}_${idx}`];

      return next;
    });
  };

  const updatePlayer = (
    teamKey: 'team1' | 'team2',
    idx: number,
    field: keyof PlayerEntry,
    value: string,
  ) => {
    setEditing((prev) => {
      if (!prev) {
        return prev;
      }

      const team = [...prev[teamKey]];

      team[idx] = {
        ...team[idx],
        [field]: value,
      };

      return {
        ...prev,
        [teamKey]: team,
      };
    });
  };

  const addPlayer = (teamKey: 'team1' | 'team2') => {
    setEditing((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [teamKey]: [
          ...prev[teamKey],
          {
            empId: '',
            name: '',
            score1: '',
            score2: '',
          },
        ],
      };
    });
  };

  const removePlayer = (teamKey: 'team1' | 'team2', idx: number) => {
    setEditing((prev) => {
      if (!prev) {
        return prev;
      }

      const team = [...prev[teamKey]];

      team.splice(idx, 1);

      return {
        ...prev,
        [teamKey]: team,
      };
    });
  };

  const handleSave = async () => {
    if (!editing) {
      return;
    }

    setSaving(true);

    const toFirebasePlayers = (players: PlayerEntry[]) =>
      Object.fromEntries(
        players
          .filter((p) => p.name.trim())
          .map((p, idx) => [
            p.empId === 'guest' ? `guest_${Date.now()}_${idx}` : p.empId.trim(),
            {
              name: p.name.trim(),
              score1: Number(p.score1) || 0,
              score2: Number(p.score2) || 0,
              order: idx,
            },
          ]),
      );

    const data = {
      winner: editing.winner,
      date: editing.date ? fromDateInput(editing.date) : 0,
      team1: toFirebasePlayers(editing.team1),
      team2: toFirebasePlayers(editing.team2),
    };

    try {
      await set(ref(db, `team/${yyyymm}/${editing.groupId}`), data);

      await loadGroups(yyyymm);

      setEditing(null);
      setConfirmDelete(false);

      toast(`✅ ${editing.groupId}조 저장되었습니다.`, {
        position: 'top-center',
        duration: 2000,
        style: {
          backgroundColor: '#f0fdf4',
          color: '#065f46',
          borderRadius: '10px',
          fontSize: '0.875rem',
        },
      });
    } catch {
      toast.error('저장 중 오류가 발생했습니다.', {
        position: 'top-center',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) {
      return;
    }

    try {
      await remove(ref(db, `team/${yyyymm}/${editing.groupId}`));

      toast(`🗑️ ${editing.groupId}조 삭제되었습니다.`, {
        position: 'top-center',
        duration: 2000,
        style: {
          backgroundColor: '#fef2f2',
          color: '#b91c1c',
          borderRadius: '10px',
          fontSize: '0.875rem',
        },
      });

      await loadGroups(yyyymm);

      setEditing(null);
      setConfirmDelete(false);
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.', {
        position: 'top-center',
      });
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

    return options;
  }, [currentYm]);

  const renderPlayers = (
    teamKey: 'team1' | 'team2',
    players: PlayerEntry[],
  ) => (
    <>
      {players.map((p, idx) => (
        <div key={`${teamKey}_${idx}`}>
          <PlayerRowWrap>
            <PlayerRowMain>
              <PlayerInput
                placeholder="이름 검색"
                value={p.name}
                onChange={(e) =>
                  updatePlayer(teamKey, idx, 'name', e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    lookupByName(teamKey, idx);
                  }
                }}
              />

              <LookupBtn
                type="button"
                onClick={() => lookupByName(teamKey, idx)}
              >
                조회
              </LookupBtn>
            </PlayerRowMain>

            <PlayerRowSub>
              <EmpIdBadge>
                {!p.empId
                  ? '사번'
                  : p.empId === 'guest' || p.empId.startsWith('guest_')
                    ? '비회원'
                    : p.empId}
              </EmpIdBadge>

              <PlayerInput
                type="number"
                placeholder="1차"
                value={p.score1}
                onChange={(e) =>
                  updatePlayer(teamKey, idx, 'score1', e.target.value)
                }
              />

              <PlayerInput
                type="number"
                placeholder="2차"
                value={p.score2}
                onChange={(e) =>
                  updatePlayer(teamKey, idx, 'score2', e.target.value)
                }
              />

              <RemoveBtn
                type="button"
                onClick={() => removePlayer(teamKey, idx)}
              >
                ×
              </RemoveBtn>
            </PlayerRowSub>
          </PlayerRowWrap>

          {playerDropdowns[`${teamKey}_${idx}`]?.length > 0 && (
            <NameDropdown>
              {playerDropdowns[`${teamKey}_${idx}`].map(([eid, n]) => (
                <NameDropdownItem
                  key={eid}
                  onClick={() => selectFromDropdown(teamKey, idx, eid, n)}
                >
                  {n}
                  <span>{eid}</span>
                </NameDropdownItem>
              ))}
            </NameDropdown>
          )}
        </div>
      ))}

      <AddPlayerBtn type="button" onClick={() => addPlayer(teamKey)}>
        + 선수 추가
      </AddPlayerBtn>
    </>
  );

  return (
    <AdminLayout title="정기전 관리">
      <MonthSelect value={yyyymm} onChange={(e) => setYyyymm(e.target.value)}>
        {monthOptions.map((ym) => (
          <option key={ym} value={ym}>
            {ym.slice(0, 4)}년 {Number(ym.slice(4))}월
          </option>
        ))}
      </MonthSelect>

      {!editing && (
        <>
          <GroupList>
            {Object.keys(groups).length === 0 ? (
              <EmptyMsg>이번 달 정기전 데이터가 없습니다.</EmptyMsg>
            ) : (
              Object.entries(groups)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([groupId, g]) => (
                  <GroupRow key={groupId} onClick={() => openEdit(groupId)}>
                    <GroupBadge>{groupId}조</GroupBadge>

                    <span>
                      {g.winner === 'team1'
                        ? '1팀 승'
                        : g.winner === 'team2'
                          ? '2팀 승'
                          : '무승부'}
                    </span>

                    <GroupDate>
                      {g.date
                        ? `${String(g.date).slice(4, 6)}/${String(g.date).slice(6)}`
                        : '날짜 미입력'}
                    </GroupDate>
                  </GroupRow>
                ))
            )}
          </GroupList>

          <AddGroupBtn onClick={openNew}>+ 새 조 추가</AddGroupBtn>
        </>
      )}

      {editing && (
        <FormSection>
          <FormTitle>
            {groups[editing.groupId]
              ? `${editing.groupId}조 편집`
              : `${editing.groupId}조 추가`}
          </FormTitle>

          <FieldLabel>경기 날짜</FieldLabel>

          <PlayerInput
            type="date"
            value={editing.date}
            onChange={(e) =>
              setEditing(
                (prev) =>
                  prev && {
                    ...prev,
                    date: e.target.value,
                  },
              )
            }
          />

          <TeamSection team="1">
            <TeamHeader team="1">1팀</TeamHeader>

            {renderPlayers('team1', editing.team1)}
          </TeamSection>

          <TeamSection team="2">
            <TeamHeader team="2">2팀</TeamHeader>

            {renderPlayers('team2', editing.team2)}
          </TeamSection>

          <FieldLabel
            style={{
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            결과
          </FieldLabel>

          <WinnerRow>
            {(['team1', 'team2', 'draw'] as const).map((w) => (
              <WinnerBtn
                key={w}
                active={editing.winner === w}
                onClick={() =>
                  setEditing(
                    (prev) =>
                      prev && {
                        ...prev,
                        winner: w,
                      },
                  )
                }
              >
                {w === 'team1' ? '1팀 승' : w === 'team2' ? '2팀 승' : '무승부'}
              </WinnerBtn>
            ))}
          </WinnerRow>

          <SaveRow>
            <SaveBtn onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </SaveBtn>

            {groups[editing.groupId] && !confirmDelete && (
              <DeleteBtn
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
              >
                삭제
              </DeleteBtn>
            )}

            {confirmDelete && (
              <>
                <DeleteBtn confirm onClick={handleDelete} disabled={saving}>
                  정말 삭제
                </DeleteBtn>

                <CancelBtn onClick={() => setConfirmDelete(false)}>
                  취소
                </CancelBtn>
              </>
            )}

            {!confirmDelete && (
              <CancelBtn
                onClick={() => {
                  setEditing(null);
                  setConfirmDelete(false);
                }}
              >
                취소
              </CancelBtn>
            )}
          </SaveRow>
        </FormSection>
      )}

      <SmallText
        top="middle"
        onClick={() =>
          navigate('/admin', {
            replace: true,
          })
        }
      >
        돌아가기
      </SmallText>
    </AdminLayout>
  );
};

export default AdminLeague;
