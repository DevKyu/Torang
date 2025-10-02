import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '../../services/firebase';
import type { UserInfo, Year, Month } from '../../types/UserInfo';
import { CUR_YEAR } from '../../constants/date';
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
} from '../../styles/AdminUserManagementStyle';
import { SmallText } from '../../styles/commonStyle';

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
const YEARS: Year[] = ['2022', '2023', '2024', '2025', '2026'] as Year[];

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

  useEffect(() => {
    fetchAllUsers().then(setUsers);
  }, []);

  const handleSearchUser = async () => {
    if (!searchInput.trim()) return;
    const lowerInput = searchInput.toLowerCase();
    const results = Object.entries(users).filter(
      ([empId, u]) =>
        empId.toLowerCase().includes(lowerInput) ||
        u.name?.toLowerCase().includes(lowerInput),
    );
    if (results.length === 0) {
      alert('검색 결과가 없습니다.');
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
      alert('✅ 전체 유저 핀 초기화 완료');
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
      alert('❌ 입력이 일치하지 않아 삭제가 취소되었습니다.');
      return;
    }

    await deleteUser(selectedEmpId);
    alert(`✅ ${displayName} 삭제 완료`);
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
      alert('필수 항목을 모두 입력하세요.');
      return;
    }
    const joinYm = newJoin.replace('-', '');
    await addUser(newEmpId, {
      name: newName,
      pin: newPin,
      type: newType,
      join: joinYm,
    });
    alert(`✅ ${newEmpId} (${newName}) 유저 추가 완료`);
    const data = await fetchAllUsers();
    setUsers(data);
    await handleSelectUser(newEmpId);
    setNewEmpId('');
    setNewName('');
    setNewPin(0);
    setNewType('Member');
    setNewJoin(getCurrentMonthInput());
  };

  return (
    <AdminLayout title="유저 관리">
      <SearchRow>
        <input
          type="text"
          placeholder="사번 또는 이름 입력 (부분 검색 가능)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
        />
        <button onClick={handleSearchUser} disabled={loading}>
          조회
        </button>
      </SearchRow>

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
                  {YEARS.map((y) => (
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
                                  type="number"
                                  value={
                                    editMonth === m && openYear === y
                                      ? newScore
                                      : ''
                                  }
                                  onChange={(e) =>
                                    setNewScore(
                                      e.target.value === ''
                                        ? ''
                                        : Number(e.target.value),
                                    )
                                  }
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
                    type="number"
                    placeholder="핀"
                    value={newPin}
                    onChange={(e) => setNewPin(Number(e.target.value))}
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
                </BulkSection>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </UserCard>
      )}
      <SmallText
        top="far"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onClick={() => {
          navigate('/menu', { replace: true });
        }}
      >
        돌아가기
      </SmallText>
    </AdminLayout>
  );
};

export default AdminUserManagement;
