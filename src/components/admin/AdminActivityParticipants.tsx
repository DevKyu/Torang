import { useCallback, useEffect, useMemo, useState } from 'react';
import { get, ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AdminLayout from './AdminLayout';

import { db, fetchAllUsers } from '../../services/firebase';

import type { UserInfo } from '../../types/UserInfo';

import { SmallText } from '../../styles/commonStyle';

import {
  PageWrap,
  TopSection,
  SearchRow,
  MonthSelect,
  SearchInput,
  SummarySection,
  SummaryCard,
  SummaryValue,
  SummaryLabel,
  FilterSection,
  FilterButton,
  ListSection,
  ListHeader,
  ListCount,
  ListSubText,
  UserList,
  UserRow,
  UserInfoWrap,
  UserName,
  UserMeta,
  UserTypeBadge,
  CheckCircle,
  BottomSection,
  SaveButton,
  EmptyText,
} from './AdminActivityParticipantsStyle';

const createMonthOptions = () => {
  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const result: string[] = [];

  for (let y = 2025; y <= currentYear; y++) {
    const startMonth = y === 2025 ? 9 : 1;
    const endMonth = y === currentYear ? currentMonth : 12;

    for (let m = startMonth; m <= endMonth; m++) {
      result.push(`${y}${String(m).padStart(2, '0')}`);
    }
  }

  return result.reverse();
};

const buildParticipantMap = (
  entries: [string, UserInfo][],
  predicate?: (user: UserInfo) => boolean,
) =>
  Object.fromEntries(
    entries
      .filter(([, user]) => (predicate ? predicate(user) : true))
      .map(([empId]) => [empId, true]),
  ) as Record<string, true>;

const AdminActivityParticipants = () => {
  const navigate = useNavigate();

  const monthOptions = useMemo(createMonthOptions, []);

  const [selectedYm, setSelectedYm] = useState(monthOptions[0]);

  const [users, setUsers] = useState<Record<string, UserInfo>>({});

  const [originalParticipants, setOriginalParticipants] = useState<
    Record<string, true>
  >({});

  const [draftParticipants, setDraftParticipants] = useState<
    Record<string, true>
  >({});

  const [search, setSearch] = useState('');

  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchAllUsers();

      setUsers(data);
    } catch {
      toast.error('유저 정보를 불러오지 못했습니다.', {
        position: 'top-center',
      });
    }
  }, []);

  const loadParticipants = useCallback(async (ym: string) => {
    const year = ym.slice(0, 4);
    const month = String(Number(ym.slice(4)));

    try {
      const snap = await get(ref(db, `activityParticipants/${year}/${month}`));

      const data = snap.exists() ? (snap.val() as Record<string, true>) : {};

      setOriginalParticipants(data);
      setDraftParticipants(data);
    } catch {
      setOriginalParticipants({});
      setDraftParticipants({});
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadParticipants(selectedYm);
  }, [selectedYm, loadParticipants]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return Object.entries(users)
      .filter(([empId, user]) => {
        if (!keyword) {
          return true;
        }

        return (
          empId.toLowerCase().includes(keyword) ||
          user.name?.toLowerCase().includes(keyword)
        );
      })
      .sort(([aId], [bId]) => aId.localeCompare(bId));
  }, [users, search]);

  const selectedCount = useMemo(
    () => Object.keys(draftParticipants).length,
    [draftParticipants],
  );

  const dirty = useMemo(() => {
    const originalKeys = Object.keys(originalParticipants).sort();
    const draftKeys = Object.keys(draftParticipants).sort();

    return JSON.stringify(originalKeys) !== JSON.stringify(draftKeys);
  }, [originalParticipants, draftParticipants]);

  const toggleParticipant = useCallback((empId: string) => {
    setDraftParticipants((prev) => {
      const next = { ...prev };

      if (next[empId]) {
        delete next[empId];
      } else {
        next[empId] = true;
      }

      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setDraftParticipants(buildParticipantMap(filteredUsers));
  }, [filteredUsers]);

  const handleClearAll = useCallback(() => {
    setDraftParticipants({});
  }, []);

  const handleSelectMembers = useCallback(() => {
    setDraftParticipants(
      buildParticipantMap(filteredUsers, (user) => user.type === 'Member'),
    );
  }, [filteredUsers]);

  const handleSelectAssociates = useCallback(() => {
    setDraftParticipants(
      buildParticipantMap(filteredUsers, (user) => user.type === 'Associate'),
    );
  }, [filteredUsers]);

  const handleSave = async () => {
    const year = selectedYm.slice(0, 4);
    const month = String(Number(selectedYm.slice(4)));

    setSaving(true);

    try {
      await set(
        ref(db, `activityParticipants/${year}/${month}`),
        draftParticipants,
      );

      setOriginalParticipants(draftParticipants);

      toast.success('참여자 저장 완료', {
        position: 'top-center',
      });
    } catch {
      toast.error('저장 중 오류가 발생했습니다.', {
        position: 'top-center',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="활동 참여자 관리">
      <PageWrap>
        <TopSection>
          <SearchRow>
            <MonthSelect
              value={selectedYm}
              onChange={(e) => setSelectedYm(e.target.value)}
            >
              {monthOptions.map((ym) => (
                <option key={ym} value={ym}>
                  {ym.slice(0, 4)}년 {Number(ym.slice(4))}월
                </option>
              ))}
            </MonthSelect>

            <SearchInput
              placeholder="사번 또는 이름 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchRow>

          <SummarySection>
            <SummaryCard>
              <SummaryValue>{selectedCount}</SummaryValue>
              <SummaryLabel>참여자</SummaryLabel>
            </SummaryCard>

            <SummaryCard>
              <SummaryValue>{filteredUsers.length}</SummaryValue>
              <SummaryLabel>조회 결과</SummaryLabel>
            </SummaryCard>

            <SummaryCard active={dirty}>
              <SummaryValue>{dirty ? '수정됨' : '저장됨'}</SummaryValue>

              <SummaryLabel>현재 상태</SummaryLabel>
            </SummaryCard>
          </SummarySection>

          <FilterSection>
            <FilterButton onClick={handleSelectAll}>전체 선택</FilterButton>

            <FilterButton onClick={handleClearAll}>전체 해제</FilterButton>

            <FilterButton onClick={handleSelectMembers}>정회원</FilterButton>

            <FilterButton onClick={handleSelectAssociates}>준회원</FilterButton>
          </FilterSection>
        </TopSection>

        <ListSection>
          <ListHeader>
            <ListCount>총 {filteredUsers.length}명</ListCount>

            <ListSubText>터치해서 참여 여부를 변경할 수 있어요</ListSubText>
          </ListHeader>

          <UserList>
            {filteredUsers.length === 0 ? (
              <EmptyText>검색 결과가 없습니다.</EmptyText>
            ) : (
              filteredUsers.map(([empId, user]) => {
                const checked = !!draftParticipants[empId];
                const isMember = user.type === 'Member';

                return (
                  <UserRow
                    key={empId}
                    checked={checked}
                    onClick={() => toggleParticipant(empId)}
                  >
                    <UserInfoWrap>
                      <UserName>{user.name ?? '이름 없음'}</UserName>

                      <UserMeta>
                        {empId}

                        <UserTypeBadge member={isMember}>
                          {isMember ? '정회원' : '준회원'}
                        </UserTypeBadge>
                      </UserMeta>
                    </UserInfoWrap>

                    <CheckCircle checked={checked}>
                      {checked ? '✓' : ''}
                    </CheckCircle>
                  </UserRow>
                );
              })
            )}
          </UserList>
        </ListSection>

        <BottomSection>
          <SaveButton disabled={!dirty || saving} onClick={handleSave}>
            {saving ? '저장 중...' : '변경사항 저장'}
          </SaveButton>

          <SmallText
            top="narrow"
            onClick={() =>
              navigate('/admin', {
                replace: true,
              })
            }
          >
            돌아가기
          </SmallText>
        </BottomSection>
      </PageWrap>
    </AdminLayout>
  );
};

export default AdminActivityParticipants;
