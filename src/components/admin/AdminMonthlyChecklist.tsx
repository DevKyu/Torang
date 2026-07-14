import { useCallback, useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { toast } from 'sonner';

import AdminLayout from './AdminLayout';

import { db, fetchAllUsers } from '../../services/firebase';
import { useEventStore } from '../../stores/eventStore';
import {
  countCheerMessagesByCandidate,
  isCheerSatisfied,
} from '../../utils/scoreGuessCheer';

import type { Month, Year, UserInfo } from '../../types/UserInfo';
import type { MatchType } from '../../types/match';

import { SmallText } from '../../styles/global/commonStyle';

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
  ToggleButton,
  ListSection,
  ListHeader,
  ListCount,
  ListSubText,
  UserList,
  StatusRow,
  UserInfoWrap,
  UserName,
  UserMeta,
  UserTypeBadge,
  ChecksWrap,
  CheckItem,
  CheckLabel,
  CheckCircle,
  BottomSection,
  EmptyText,
} from '../../styles/admin/AdminMonthlyChecklistStyle';

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

const AdminMonthlyChecklist = () => {
  const goBack = useNavigateBack('/admin');
  const matchType = useEventStore((s) => s.matchType);
  const loadEventConfig = useEventStore((s) => s.loadEventConfig);
  const eventLoaded = useEventStore((s) => s.loaded);

  const rivalNoun = matchType === 'pin' ? '핀매치' : '라이벌';

  const monthOptions = useMemo(createMonthOptions, []);
  const [selectedYm, setSelectedYm] = useState(monthOptions[0]);

  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [rivalDoneMap, setRivalDoneMap] = useState<Record<string, true>>({});
  const [participants, setParticipants] = useState<string[]>([]);
  const [predictMission, setPredictMission] = useState<{
    active: boolean;
    candidates: string[];
    doneMap: Record<string, true>;
    cheerMessageCount: Record<string, number>;
    cheerReadCount: Record<string, number>;
  }>({
    active: false,
    candidates: [],
    doneMap: {},
    cheerMessageCount: {},
    cheerReadCount: {},
  });
  const [search, setSearch] = useState('');
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventLoaded) loadEventConfig();
  }, [eventLoaded, loadEventConfig]);

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

  const loadStatusForMonth = useCallback(async (ym: string, type: MatchType) => {
    setLoading(true);
    const year = ym.slice(0, 4);
    const month = String(Number(ym.slice(4)));
    try {
      const [rivalSnap, participantsSnap, missionSnap] = await Promise.all([
        get(ref(db, `match/${ym}/${type}`)),
        get(ref(db, `activityParticipants/${year}/${month}`)),
        get(ref(db, `missions/${ym}`)),
      ]);
      const raw = rivalSnap.exists()
        ? (rivalSnap.val() as Record<string, Record<string, unknown>>)
        : {};
      const done = Object.fromEntries(
        Object.entries(raw)
          .filter(([, choices]) => Object.keys(choices ?? {}).length > 0)
          .map(([empId]) => [empId, true as const]),
      );
      setRivalDoneMap(done);
      setParticipants(
        participantsSnap.exists()
          ? Object.keys(participantsSnap.val() as Record<string, true>)
          : [],
      );

      const missionVal = missionSnap.exists()
        ? (missionSnap.val() as {
            config?: { type?: string };
            targets?: { empIds?: string[] };
            votes?: Record<string, { targetEmpId?: string; message?: string }>;
            cheerReads?: Record<string, number>;
          })
        : null;
      const isScoreGuess = missionVal?.config?.type === 'scoreGuess';
      const votes = missionVal?.votes ?? {};
      const cheerMessageCount = countCheerMessagesByCandidate(votes);

      setPredictMission({
        active: isScoreGuess,
        candidates: isScoreGuess ? (missionVal?.targets?.empIds ?? []) : [],
        doneMap: isScoreGuess
          ? Object.fromEntries(
              Object.keys(votes).map((id) => [id, true as const]),
            )
          : {},
        cheerMessageCount: isScoreGuess ? cheerMessageCount : {},
        cheerReadCount: isScoreGuess ? (missionVal?.cheerReads ?? {}) : {},
      });
    } catch {
      setRivalDoneMap({});
      setParticipants([]);
      setPredictMission({
        active: false,
        candidates: [],
        doneMap: {},
        cheerMessageCount: {},
        cheerReadCount: {},
      });
      toast.error('현황 정보를 불러오지 못했습니다.', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStatusForMonth(selectedYm, matchType);
  }, [selectedYm, matchType, loadStatusForMonth]);

  const year = selectedYm.slice(0, 4) as Year;
  const month = String(Number(selectedYm.slice(4)));

  const usersWithStatus = useMemo(() => {
    const participantSet = new Set(participants);
    const candidateSet = new Set(predictMission.candidates);
    return Object.entries(users)
      .filter(([empId]) => participantSet.has(empId))
      .map(([empId, user]) => {
        const isPredictCandidate = candidateSet.has(empId);
        const predictSatisfied = !predictMission.active
          ? true
          : isPredictCandidate
            ? isCheerSatisfied(
                predictMission.cheerReadCount[empId],
                predictMission.cheerMessageCount[empId],
              )
            : !!predictMission.doneMap[empId];
        return {
          empId,
          user,
          targetDone: user.targets?.[year]?.[month as Month] !== undefined,
          rivalDone: !!rivalDoneMap[empId],
          isPredictCandidate,
          predictSatisfied,
        };
      })
      .sort((a, b) => a.empId.localeCompare(b.empId));
  }, [users, year, month, rivalDoneMap, participants, predictMission]);

  const incompleteCount = useMemo(
    () =>
      usersWithStatus.filter(
        (row) => !row.targetDone || !row.rivalDone || !row.predictSatisfied,
      ).length,
    [usersWithStatus],
  );

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return usersWithStatus.filter((row) => {
      if (
        incompleteOnly &&
        row.targetDone &&
        row.rivalDone &&
        row.predictSatisfied
      ) {
        return false;
      }
      if (!keyword) return true;
      return (
        row.empId.toLowerCase().includes(keyword) ||
        row.user.name?.toLowerCase().includes(keyword)
      );
    });
  }, [usersWithStatus, search, incompleteOnly]);

  return (
    <AdminLayout title="체크리스트 현황">
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
              <SummaryValue>{usersWithStatus.length}</SummaryValue>
              <SummaryLabel>활동 참여자</SummaryLabel>
            </SummaryCard>

            <SummaryCard>
              <SummaryValue>{incompleteCount}</SummaryValue>
              <SummaryLabel>미완료</SummaryLabel>
            </SummaryCard>

            <SummaryCard>
              <SummaryValue>{rows.length}</SummaryValue>
              <SummaryLabel>조회 결과</SummaryLabel>
            </SummaryCard>
          </SummarySection>

          <ToggleButton
            active={incompleteOnly}
            onClick={() => setIncompleteOnly((prev) => !prev)}
          >
            {incompleteOnly ? '전체 보기' : '미완료만 보기'}
          </ToggleButton>
        </TopSection>

        <ListSection>
          <ListHeader>
            <ListCount>총 {rows.length}명</ListCount>
            <ListSubText>설정 여부</ListSubText>
          </ListHeader>

          <UserList>
            {loading ? (
              <EmptyText>불러오는 중...</EmptyText>
            ) : usersWithStatus.length === 0 ? (
              <EmptyText>이번 달 활동 참여자가 없습니다.</EmptyText>
            ) : rows.length === 0 ? (
              <EmptyText>검색 결과가 없습니다.</EmptyText>
            ) : (
              rows.map(({ empId, user, targetDone, rivalDone, predictSatisfied }) => {
                const isMember = user.type === 'Member';

                return (
                  <StatusRow key={empId}>
                    <UserInfoWrap>
                      <UserName>{user.name ?? '이름 없음'}</UserName>

                      <UserMeta>
                        {empId}

                        <UserTypeBadge member={isMember}>
                          {isMember ? '정회원' : '준회원'}
                        </UserTypeBadge>
                      </UserMeta>
                    </UserInfoWrap>

                    <ChecksWrap>
                      <CheckItem>
                        <CheckLabel>목표</CheckLabel>
                        <CheckCircle checked={targetDone}>
                          {targetDone ? '✓' : ''}
                        </CheckCircle>
                      </CheckItem>
                      <CheckItem>
                        <CheckLabel>{rivalNoun}</CheckLabel>
                        <CheckCircle checked={rivalDone}>
                          {rivalDone ? '✓' : ''}
                        </CheckCircle>
                      </CheckItem>
                      {predictMission.active && (
                        <CheckItem>
                          <CheckLabel>예측</CheckLabel>
                          <CheckCircle checked={predictSatisfied}>
                            {predictSatisfied ? '✓' : ''}
                          </CheckCircle>
                        </CheckItem>
                      )}
                    </ChecksWrap>
                  </StatusRow>
                );
              })
            )}
          </UserList>
        </ListSection>

        <BottomSection>
          <SmallText top="narrow" onClick={goBack}>
            돌아가기
          </SmallText>
        </BottomSection>
      </PageWrap>
    </AdminLayout>
  );
};

export default AdminMonthlyChecklist;
