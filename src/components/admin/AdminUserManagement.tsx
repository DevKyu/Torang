import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import AdminLayout from './AdminLayout';
import {
  fetchAllUsers,
  checkEmpId,
  incrementPinsByEmpId,
  resetAllUserPins,
  getUserYearScores,
  setUserMonthScore,
  removeUserScore,
  addUser,
  deleteUser,
  adjustPinsForCurrentMonth,
} from '../../services/firebase';
import type { UserInfo, Year, Month } from '../../types/UserInfo';
import { CUR_MONTHN, CUR_YEAR } from '../../constants/date';
import { useUiStore } from '../../stores/useUiStore';
import {
  SearchRow,
  ResultList,
  ResultItem,
  UserCard,
  UserCardHeader,
  DeleteButton,
  ButtonRow,
  Divider,
  BulkSection,
  ScoreGrid,
  ScoreCell,
  ActionRow,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  InnerAccordion,
  InnerItem,
  InnerTrigger,
  InnerContent,
  NewUserForm,
  AdminLinkSection,
  AdminLinkGroup,
  AdminMainLink,
  AdminSubLinkRow,
  AdminSubLink,
} from '../../styles/admin/AdminUserManagementStyle';
import { SmallText } from '../../styles/global/commonStyle';

const MONTHS: Month[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
];
const FIRST_SCORE_YEAR = 2022;

const getCurrentMonthInput = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<[string, UserInfo][]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const [scores, setScores] = useState<
    Record<Year, Partial<Record<Month, number>>>
  >({});
  const [newScore, setNewScore] = useState<number | ''>('');
  const [editMonth, setEditMonth] = useState<Month | null>(null);
  const [openYear, setOpenYear] = useState<Year | ''>(CUR_YEAR);

  const [newEmpId, setNewEmpId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState(0);
  const [newType, setNewType] = useState<'Member' | 'Associate'>('Member');
  const [newJoin, setNewJoin] = useState(getCurrentMonthInput());
  const navigate = useNavigate();
  const goBack = useNavigateBack();

  const years = useMemo<Year[]>(() => {
    const end = Number(useUiStore.getState().formatServerDate('year'));
    const list: Year[] = [];
    for (let y = FIRST_SCORE_YEAR; y <= end; y++) list.push(String(y) as Year);
    return list;
  }, []);

  useEffect(() => {
    fetchAllUsers().then(setUsers);
  }, []);

  const handleSearchUser = async () => {
    if (!searchInput.trim()) {
      const all = Object.entries(users);
      setSearchResults(all);
      setSelectedUser(null);
      setSelectedEmpId('');
      return;
    }
    const lowerInput = searchInput.toLowerCase();
    const results = Object.entries(users).filter(
      ([empId, u]) =>
        empId.toLowerCase().includes(lowerInput) ||
        u.name?.toLowerCase().includes(lowerInput),
    );
    if (results.length === 0) {
      toast('검색 결과가 없습니다.');
      setSearchResults([]);
      return;
    }
    if (results.length === 1) {
      const [empId] = results[0];
      await handleSelectUser(empId);
      setSearchResults([]);
      return;
    }
    setSearchResults(results);
    setSelectedUser(null);
    setSelectedEmpId('');
  };

  const handleSelectUser = async (empId: string) => {
    setLoading(true);
    try {
      const user = await checkEmpId(empId);
      setSelectedEmpId(empId);
      setSelectedUser(user);
      await loadScores(empId, CUR_YEAR);
      setOpenYear(CUR_YEAR);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePin = async (delta: number) => {
    if (!selectedEmpId) return;
    await incrementPinsByEmpId(selectedEmpId, delta);
    const updated = await checkEmpId(selectedEmpId);
    setSelectedUser(updated);
  };

  const handleBulkReset = async () => {
    if (!window.confirm('⚠️ 전체 유저의 핀을 0으로 초기화하시겠습니까?'))
      return;
    setLoading(true);
    try {
      await resetAllUserPins();
      const data = await fetchAllUsers();
      setUsers(data);
      toast.success('전체 유저 핀 초기화 완료');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedEmpId) return;
    const displayName = `${selectedEmpId} (${selectedUser?.name ?? '이름 없음'})`;
    const confirm1 = window.confirm(
      `⚠️ 정말 ${displayName} 유저를 삭제하시겠습니까?`,
    );
    if (!confirm1) return;

    const confirm2 = window.prompt(
      `"${selectedEmpId}" 를 다시 입력하면 삭제됩니다.`,
    );
    if (confirm2 !== selectedEmpId) {
      toast.error('입력이 일치하지 않아 삭제가 취소되었습니다.');
      return;
    }

    await deleteUser(selectedEmpId);
    toast.success(`${displayName} 삭제 완료`);
    setSelectedEmpId('');
    setSelectedUser(null);
    const data = await fetchAllUsers();
    setUsers(data);
  };

  const loadScores = async (empId: string, year: Year) => {
    const list = await getUserYearScores(empId, year);
    setScores((prev) => ({ ...prev, [year]: list }));
  };

  const handleSaveScore = async (year: Year, month: Month) => {
    if (!selectedEmpId || newScore === '') return;
    await setUserMonthScore(selectedEmpId, year, month, Number(newScore));
    await loadScores(selectedEmpId, year);
    setNewScore('');
    setEditMonth(null);
  };

  const handleDeleteScore = async (year: Year, month: Month) => {
    if (!selectedEmpId) return;
    if (!window.confirm(`${year}년 ${month}월 점수를 삭제하시겠습니까?`))
      return;
    await removeUserScore(selectedEmpId, year, month);
    await loadScores(selectedEmpId, year);
  };

  const handleAddUser = async () => {
    if (!newEmpId || !newName || !newJoin) {
      toast.error('필수 항목을 모두 입력하세요.');
      return;
    }
    const joinYm = newJoin.replace('-', '');
    await addUser(newEmpId, {
      name: newName,
      pin: newPin,
      type: newType,
      join: joinYm,
    });
    toast.success(`${newEmpId} (${newName}) 유저 추가 완료`);
    const data = await fetchAllUsers();
    setUsers(data);
    await handleSelectUser(newEmpId);
    setNewEmpId('');
    setNewName('');
    setNewPin(0);
    setNewType('Member');
    setNewJoin(getCurrentMonthInput());
  };

  const handleResetPassword = async () => {
    if (!selectedEmpId) return;

    const DEFAULT_PASSWORD = '00000000';

    if (
      !window.confirm(
        `⚠️ ${selectedEmpId}의 비밀번호를 '${DEFAULT_PASSWORD}'으로 초기화할까요?`,
      )
    )
      return;

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: selectedEmpId,
          newPassword: DEFAULT_PASSWORD,
        }),
      });

      if (!response.ok) {
        const { error } = await response
          .json()
          .catch(() => ({ error: '알 수 없는 오류' }));
        throw new Error(error || `HTTP ${response.status}`);
      }

      const { success } = await response.json();
      if (success) {
        toast.success(
          `${selectedEmpId}의 비밀번호가 '00000000'로 초기화되었습니다.`,
        );
      } else {
        toast.error('초기화에 실패했습니다.');
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : '비밀번호 초기화 중 오류가 발생했습니다.',
      );
    }
  };

  const handleCurrentMonthPinAdjustment = async () => {
    if (
      !window.confirm(
        `${CUR_YEAR}년 ${CUR_MONTHN}월 활동자에게 핀을 지급하시겠습니까?\n(정회원 +1, 준회원 +0.5)`,
      )
    )
      return;

    setLoading(true);
    const ok = await adjustPinsForCurrentMonth();

    if (ok) {
      const data = await fetchAllUsers();
      setUsers(data);
      toast.success(`${CUR_YEAR}년 ${CUR_MONTHN}월 활동자 핀 지급 완료`);
    } else {
      toast.error('대상자 없음 또는 오류 발생');
    }

    setLoading(false);
  };

  return (
    <AdminLayout title="유저 관리">
      <SearchRow>
        <input
          type="text"
          placeholder="사번 또는 이름 입력 (부분 검색 가능)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            if (e.key === 'Enter') handleSearchUser();
          }}
        />
        <button onClick={handleSearchUser} disabled={loading}>
          조회
        </button>
      </SearchRow>

      <AdminLinkSection>
        <AdminMainLink
          onClick={() => navigate('/admin/event')}
        >
          ⚙️ 이벤트 / 메뉴 운영 설정
        </AdminMainLink>

        <AdminLinkGroup>
          <AdminSubLinkRow>
            <AdminSubLink
              onClick={() =>
                navigate('/admin/team-formation')
              }
            >
              👥 팀 편성 관리
            </AdminSubLink>
            <AdminSubLink
              onClick={() => navigate('/admin/league')}
            >
              🏆 정기전 관리
            </AdminSubLink>
          </AdminSubLinkRow>
        </AdminLinkGroup>

        <AdminLinkGroup>
          <AdminSubLinkRow>
            <AdminSubLink
              onClick={() =>
                navigate('/admin/activity-participants')
              }
            >
              ✅ 활동 참여자 관리
            </AdminSubLink>
            <AdminSubLink
              onClick={() =>
                navigate('/admin/after-party-participants')
              }
            >
              🍻 뒤풀이 참여자 관리
            </AdminSubLink>
          </AdminSubLinkRow>
        </AdminLinkGroup>

        <AdminLinkGroup>
          <AdminSubLinkRow>
            <AdminSubLink
              onClick={() => navigate('/admin/mission')}
            >
              🎭 활동 미션 관리
            </AdminSubLink>
            <AdminSubLink
              onClick={() => navigate('/admin/products')}
            >
              📦 분기 상품 관리
            </AdminSubLink>
          </AdminSubLinkRow>
        </AdminLinkGroup>

        <AdminLinkGroup>
          <AdminSubLinkRow>
            <AdminSubLink
              style={{ gridColumn: '1 / -1' }}
              onClick={() => navigate('/admin/messages')}
            >
              📬 공지사항 관리
            </AdminSubLink>
          </AdminSubLinkRow>
        </AdminLinkGroup>

        <AdminLinkGroup>
          <AdminSubLinkRow>
            <AdminSubLink
              style={{ gridColumn: '1 / -1' }}
              onClick={() => navigate('/admin/monthly-checklist')}
            >
              📋 체크리스트 현황
            </AdminSubLink>
          </AdminSubLinkRow>
        </AdminLinkGroup>
      </AdminLinkSection>

      {searchResults.length > 0 && !selectedUser && (
        <ResultList>
          {searchResults.map(([empId, u]) => (
            <ResultItem key={empId} onClick={() => handleSelectUser(empId)}>
              <span className="emp">{empId}</span>
              <span className="name">{u.name ?? '이름 없음'}</span>
              <span className="pin">{u.pin ?? 0} 핀</span>
            </ResultItem>
          ))}
        </ResultList>
      )}

      {selectedUser && (
        <UserCard>
          <UserCardHeader>
            <h3>
              {selectedEmpId} ({selectedUser.name ?? '이름 없음'})
            </h3>
            <DeleteButton onClick={handleDeleteUser}>유저 삭제</DeleteButton>
          </UserCardHeader>
          <p>핀 : {selectedUser.pin ?? 0}</p>
          <p>타입 : {selectedUser.type === 'Member' ? '정회원' : '준회원'}</p>
          <p>가입일 : {selectedUser.join ?? '-'}</p>

          <ButtonRow>
            <button onClick={() => handleUpdatePin(0.5)}>+0.5</button>
            <button onClick={() => handleUpdatePin(-0.5)}>-0.5</button>
            <button onClick={() => handleUpdatePin(1)}>+1</button>
            <button onClick={() => handleUpdatePin(-1)}>-1</button>
            <button onClick={handleResetPassword}>비밀번호 초기화</button>
          </ButtonRow>

          <Divider />

          <AccordionRoot type="multiple">
            <AccordionItem value="scores">
              <AccordionHeader>
                <AccordionTrigger>📊 점수 관리</AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <InnerAccordion
                  type="single"
                  collapsible
                  value={openYear}
                  onValueChange={(val: string) => {
                    if (val && selectedEmpId)
                      loadScores(selectedEmpId, val as Year);
                    setOpenYear(val as Year);
                  }}
                >
                  {years.map((y) => (
                    <InnerItem key={y} value={y}>
                      <AccordionHeader>
                        <InnerTrigger>{y}년</InnerTrigger>
                      </AccordionHeader>
                      <InnerContent>
                        <ScoreGrid>
                          {MONTHS.map((m) => (
                            <ScoreCell key={m}>
                              <h5>{m}월</h5>
                              <p>{scores[y]?.[m] ?? '-'}</p>
                              <div className="input-wrapper">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  value={
                                    editMonth === m && openYear === y
                                      ? newScore
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const v = e.target.value.replace(/[^\d]/g, '');
                                    setNewScore(v === '' ? '' : Number(v));
                                  }}
                                  disabled={
                                    !(editMonth === m && openYear === y)
                                  }
                                  style={{
                                    visibility:
                                      editMonth === m && openYear === y
                                        ? 'visible'
                                        : 'hidden',
                                  }}
                                />
                              </div>
                              {editMonth === m && openYear === y ? (
                                <ActionRow>
                                  <button
                                    className="save"
                                    onClick={() => handleSaveScore(y, m)}
                                  >
                                    저장
                                  </button>
                                  <button
                                    className="delete"
                                    onClick={() => handleDeleteScore(y, m)}
                                  >
                                    삭제
                                  </button>
                                </ActionRow>
                              ) : (
                                <ActionRow>
                                  <button
                                    className="edit"
                                    onClick={() => {
                                      setEditMonth(m);
                                      setNewScore(scores[y]?.[m] ?? '');
                                    }}
                                  >
                                    수정
                                  </button>
                                  {scores[y]?.[m] !== undefined && (
                                    <button
                                      className="delete"
                                      onClick={() => handleDeleteScore(y, m)}
                                    >
                                      삭제
                                    </button>
                                  )}
                                </ActionRow>
                              )}
                            </ScoreCell>
                          ))}
                        </ScoreGrid>
                      </InnerContent>
                    </InnerItem>
                  ))}
                </InnerAccordion>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="new-user">
              <AccordionHeader>
                <AccordionTrigger>➕ 새 유저 추가</AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <NewUserForm>
                  <input
                    placeholder="사번"
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                  />
                  <input
                    placeholder="이름"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="핀"
                    value={newPin}
                    onChange={(e) => setNewPin(Number(e.target.value.replace(/[^\d]/g, '')))}
                  />
                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(e.target.value as 'Member' | 'Associate')
                    }
                  >
                    <option value="Member">정회원</option>
                    <option value="Associate">준회원</option>
                  </select>
                  <input
                    type="month"
                    value={newJoin}
                    onChange={(e) => setNewJoin(e.target.value)}
                  />
                  <button onClick={handleAddUser}>✅ 유저 추가</button>
                </NewUserForm>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="advanced">
              <AccordionHeader>
                <AccordionTrigger>⚙️ 고급 기능</AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <BulkSection>
                  <button onClick={handleBulkReset} disabled={loading}>
                    전체 핀 0으로 초기화
                  </button>
                  <button
                    onClick={handleCurrentMonthPinAdjustment}
                    disabled={loading}
                  >
                    이번 달 활동자 핀 조정 (+1 / +0.5)
                  </button>
                </BulkSection>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </UserCard>
      )}
      <SmallText
        top="far"
        style={{
          position: 'relative',
          zIndex: 20,
          pointerEvents: 'auto',
        }}
        onClick={goBack}
      >
        돌아가기
      </SmallText>
    </AdminLayout>
  );
};

export default AdminUserManagement;
