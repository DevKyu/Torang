import { useCallback, useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { toast } from 'sonner';

import AdminLayout from './AdminLayout';

import { db, fetchAllUsers } from '../../services/firebase';
import { useEventStore } from '../../stores/eventStore';
import { useUiStore } from '../../stores/useUiStore';
import { isScoreGuessMission } from '../../hooks/useMission';
import {
  countCheerMessagesByCandidate,
  isCheerSatisfied,
} from '../../utils/scoreGuessCheer';
import {
  getDaysUntilMissionReveal,
  getMissionViewState,
} from '../../utils/missionViewState';

import type { Month, Year, UserInfo } from '../../types/UserInfo';
import type { MatchType } from '../../types/match';
import type { MissionData } from '../../hooks/useMission';

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
  TabRow,
  TabButton,
  StatusCircle,
  BottomSection,
  EmptyText,
} from '../../styles/admin/AdminMonthlyChecklistStyle';

const renderCheckCircle = (done: boolean) => (
  <CheckCircle checked={done}>{done ? '✓' : ''}</CheckCircle>
);

const renderStatusCircle = (applicable: boolean, done: boolean) => (
  <StatusCircle state={!applicable ? 'na' : done ? 'done' : 'pending'}>
    {!applicable ? '–' : done ? '✓' : ''}
  </StatusCircle>
);

const toDoneMapFromNonEmpty = (
  raw: Record<string, Record<string, unknown>>,
): Record<string, true> =>
  Object.fromEntries(
    Object.entries(raw)
      .filter(([, v]) => Object.keys(v ?? {}).length > 0)
      .map(([id]) => [id, true as const]),
  );

const toDoneMapFromKeys = (obj: Record<string, unknown>): Record<string, true> =>
  Object.fromEntries(Object.keys(obj).map((id) => [id, true as const]));

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
  const pinReward = useEventStore((s) => s.pinReward);
  const getGalleryReward = useEventStore((s) => s.getGalleryReward);

  const monthOptions = useMemo(createMonthOptions, []);
  const [selectedYm, setSelectedYm] = useState(monthOptions[0]);
  const [activeTab, setActiveTab] = useState<'pre' | 'post'>('pre');

  const [monthMatchType, setMonthMatchType] = useState<MatchType>(matchType);
  const rivalNoun = monthMatchType === 'pin' ? '핀매치' : '라이벌';

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
  const [postStatus, setPostStatus] = useState<{
    activityYmd: string | null;
    matchDoneMap: Record<string, true>;
    galleryCountMap: Record<string, number>;
    villainActive: boolean;
    villainVoteDoneMap: Record<string, true>;
  }>({
    activityYmd: null,
    matchDoneMap: {},
    galleryCountMap: {},
    villainActive: false,
    villainVoteDoneMap: {},
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

  const loadStatusForMonth = useCallback(async (ym: string, fallbackType: MatchType) => {
    setLoading(true);
    const year = ym.slice(0, 4);
    const month = String(Number(ym.slice(4)));
    try {
      const [
        rivalMatchSnap,
        pinMatchSnap,
        participantsSnap,
        missionSnap,
        activityDateSnap,
        rivalResultsSnap,
        pinResultsSnap,
        gallerySnap,
      ] = await Promise.all([
        get(ref(db, `match/${ym}/rival`)),
        get(ref(db, `match/${ym}/pin`)),
        get(ref(db, `activityParticipants/${year}/${month}`)),
        get(ref(db, `missions/${ym}`)),
        get(ref(db, `activityDate/${year}/${month}`)),
        get(ref(db, `matchResults/${ym}/rival`)),
        get(ref(db, `matchResults/${ym}/pin`)),
        get(ref(db, `gallery/${ym}`)),
      ]);

      const hasChoices = (snap: typeof rivalMatchSnap): boolean => {
        if (!snap.exists()) return false;
        const val = snap.val() as Record<string, Record<string, unknown>>;
        return Object.values(val).some(
          (choices) => Object.keys(choices ?? {}).length > 0,
        );
      };
      const rivalHasData = hasChoices(rivalMatchSnap);
      const pinHasData = hasChoices(pinMatchSnap);
      const type: MatchType =
        pinHasData && !rivalHasData
          ? 'pin'
          : rivalHasData && !pinHasData
            ? 'rival'
            : fallbackType;
      setMonthMatchType(type);

      const matchSnap = type === 'pin' ? pinMatchSnap : rivalMatchSnap;
      const matchResultsSnap = type === 'pin' ? pinResultsSnap : rivalResultsSnap;

      const raw = matchSnap.exists()
        ? (matchSnap.val() as Record<string, Record<string, unknown>>)
        : {};
      const done = toDoneMapFromNonEmpty(raw);
      setRivalDoneMap(done);
      setParticipants(
        participantsSnap.exists()
          ? Object.keys(participantsSnap.val() as Record<string, true>)
          : [],
      );

      const activityYmdVal = activityDateSnap.exists()
        ? String(activityDateSnap.val())
        : null;

      const missionVal = missionSnap.exists()
        ? (missionSnap.val() as {
            config?: { type?: string; status?: string; revealDays?: number };
            targets?: { empIds?: string[] };
            votes?: Record<string, { targetEmpId?: string; message?: string }>;
            cheerReads?: Record<string, number>;
          })
        : null;
      const missionDaysUntilReveal = getDaysUntilMissionReveal(
        activityYmdVal,
        missionVal?.config,
        useUiStore.getState().getServerNow(),
      );
      const missionViewState = getMissionViewState(
        missionVal?.config,
        missionDaysUntilReveal,
      );
      const missionActive =
        missionViewState !== 'empty' && missionViewState !== 'upcoming';
      const isScoreGuess =
        missionActive && isScoreGuessMission(missionVal as MissionData | null);
      const votes = missionVal?.votes ?? {};
      const cheerMessageCount = countCheerMessagesByCandidate(votes);

      setPredictMission({
        active: isScoreGuess,
        candidates: isScoreGuess ? (missionVal?.targets?.empIds ?? []) : [],
        doneMap: isScoreGuess ? toDoneMapFromKeys(votes) : {},
        cheerMessageCount: isScoreGuess ? cheerMessageCount : {},
        cheerReadCount: isScoreGuess ? (missionVal?.cheerReads ?? {}) : {},
      });

      const matchResultsRaw = matchResultsSnap.exists()
        ? (matchResultsSnap.val() as Record<string, Record<string, unknown>>)
        : {};
      const matchDoneMap = toDoneMapFromNonEmpty(matchResultsRaw);

      const galleryRaw = gallerySnap.exists()
        ? (gallerySnap.val() as Record<string, { empId?: string }>)
        : {};
      const galleryCountMap: Record<string, number> = {};
      Object.values(galleryRaw).forEach((img) => {
        if (!img.empId) return;
        galleryCountMap[img.empId] = (galleryCountMap[img.empId] ?? 0) + 1;
      });

      const isVillain = missionActive && !isScoreGuess;

      setPostStatus({
        activityYmd: activityYmdVal,
        matchDoneMap,
        galleryCountMap,
        villainActive: isVillain,
        villainVoteDoneMap: isVillain ? toDoneMapFromKeys(votes) : {},
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
      setPostStatus({
        activityYmd: null,
        matchDoneMap: {},
        galleryCountMap: {},
        villainActive: false,
        villainVoteDoneMap: {},
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

  const monthReward = pinReward[selectedYm];
  const targetRewardEnabled = (monthReward?.targetScore ?? 0) > 0;
  const matchRewardEnabled =
    ((monthMatchType === 'pin'
      ? monthReward?.pinMatch
      : monthReward?.rivalMatch) ?? 0) > 0;
  const achievementRewardEnabled = (monthReward?.achievement ?? 0) > 0;
  const galleryRewardConfig = getGalleryReward(selectedYm);
  const galleryRewardEnabled =
    galleryRewardConfig.upload.pin > 0 && galleryRewardConfig.upload.threshold > 0;
  const galleryGoal = galleryRewardConfig.upload.threshold;

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

        const rivalDone = !!rivalDoneMap[empId];

        const myTargetScore = user.scores?.[year]?.[month as Month];
        const myTarget = user.targets?.[year]?.[month as Month];
        const targetAchieved =
          typeof myTargetScore === 'number' &&
          typeof myTarget === 'number' &&
          myTargetScore >= myTarget;
        const targetRewardApplicable = targetAchieved;
        const targetRewardDone = !!user.rewards?.[selectedYm]?.target;

        const matchResultApplicable = rivalDone;
        const matchResultDone = !!postStatus.matchDoneMap[empId];

        const achievementDone = postStatus.activityYmd
          ? Number(user.lastAchievementCheck ?? 0) >=
            Number(postStatus.activityYmd)
          : false;

        const galleryDone =
          (postStatus.galleryCountMap[empId] ?? 0) >= galleryGoal;

        const villainVoteApplicable = postStatus.villainActive;
        const villainVoteDone = !!postStatus.villainVoteDoneMap[empId];

        const postSatisfied =
          (!targetRewardEnabled || !targetRewardApplicable || targetRewardDone) &&
          (!matchRewardEnabled || !matchResultApplicable || matchResultDone) &&
          (!achievementRewardEnabled || achievementDone) &&
          (!galleryRewardEnabled || galleryDone) &&
          (!villainVoteApplicable || villainVoteDone);

        const targetDone = user.targets?.[year]?.[month as Month] !== undefined;
        const preSatisfied =
          (!targetRewardEnabled || targetDone) &&
          (!matchRewardEnabled || rivalDone) &&
          (!predictMission.active || predictSatisfied);

        return {
          empId,
          user,
          targetDone,
          rivalDone,
          isPredictCandidate,
          predictSatisfied,
          preSatisfied,
          targetRewardApplicable,
          targetRewardDone,
          matchResultApplicable,
          matchResultDone,
          achievementDone,
          galleryDone,
          villainVoteApplicable,
          villainVoteDone,
          postSatisfied,
        };
      })
      .sort((a, b) => a.empId.localeCompare(b.empId));
  }, [
    users,
    year,
    month,
    rivalDoneMap,
    participants,
    predictMission,
    selectedYm,
    targetRewardEnabled,
    matchRewardEnabled,
    achievementRewardEnabled,
    galleryRewardEnabled,
    galleryGoal,
    postStatus,
  ]);

  const incompleteCount = useMemo(
    () =>
      usersWithStatus.filter((row) =>
        activeTab === 'pre' ? !row.preSatisfied : !row.postSatisfied,
      ).length,
    [usersWithStatus, activeTab],
  );

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return usersWithStatus.filter((row) => {
      if (incompleteOnly) {
        const done = activeTab === 'pre' ? row.preSatisfied : row.postSatisfied;
        if (done) return false;
      }
      if (!keyword) return true;
      return (
        row.empId.toLowerCase().includes(keyword) ||
        row.user.name?.toLowerCase().includes(keyword)
      );
    });
  }, [usersWithStatus, search, incompleteOnly, activeTab]);

  return (
    <AdminLayout title="체크리스트 현황">
      <PageWrap>
        <TopSection>
          <TabRow>
            <TabButton
              active={activeTab === 'pre'}
              onClick={() => setActiveTab('pre')}
            >
              활동 전
            </TabButton>
            <TabButton
              active={activeTab === 'post'}
              onClick={() => setActiveTab('post')}
            >
              활동 후
            </TabButton>
          </TabRow>

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
            <ListSubText>
              {activeTab === 'pre' ? '설정 여부' : '완료 여부'}
            </ListSubText>
          </ListHeader>

          <UserList>
            {loading || !eventLoaded ? (
              <EmptyText>불러오는 중...</EmptyText>
            ) : usersWithStatus.length === 0 ? (
              <EmptyText>이번 달 활동 참여자가 없습니다.</EmptyText>
            ) : rows.length === 0 ? (
              <EmptyText>검색 결과가 없습니다.</EmptyText>
            ) : (
              rows.map((row) => {
                const {
                  empId,
                  user,
                  targetDone,
                  rivalDone,
                  predictSatisfied,
                  targetRewardApplicable,
                  targetRewardDone,
                  matchResultApplicable,
                  matchResultDone,
                  achievementDone,
                  galleryDone,
                  villainVoteApplicable,
                  villainVoteDone,
                } = row;
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

                    {activeTab === 'pre' ? (
                      <ChecksWrap>
                        {targetRewardEnabled && (
                          <CheckItem>
                            <CheckLabel>목표</CheckLabel>
                            {renderCheckCircle(targetDone)}
                          </CheckItem>
                        )}
                        {matchRewardEnabled && (
                          <CheckItem>
                            <CheckLabel>{rivalNoun}</CheckLabel>
                            {renderCheckCircle(rivalDone)}
                          </CheckItem>
                        )}
                        {predictMission.active && (
                          <CheckItem>
                            <CheckLabel>예측</CheckLabel>
                            {renderCheckCircle(predictSatisfied)}
                          </CheckItem>
                        )}
                      </ChecksWrap>
                    ) : (
                      <ChecksWrap>
                        {targetRewardEnabled && (
                          <CheckItem>
                            <CheckLabel>목표</CheckLabel>
                            {renderStatusCircle(targetRewardApplicable, targetRewardDone)}
                          </CheckItem>
                        )}
                        {matchRewardEnabled && (
                          <CheckItem>
                            <CheckLabel>{rivalNoun}</CheckLabel>
                            {renderStatusCircle(matchResultApplicable, matchResultDone)}
                          </CheckItem>
                        )}
                        {achievementRewardEnabled && (
                          <CheckItem>
                            <CheckLabel>업적</CheckLabel>
                            {renderCheckCircle(achievementDone)}
                          </CheckItem>
                        )}
                        {villainVoteApplicable && (
                          <CheckItem>
                            <CheckLabel>투표</CheckLabel>
                            {renderCheckCircle(villainVoteDone)}
                          </CheckItem>
                        )}
                        {galleryRewardEnabled && (
                          <CheckItem>
                            <CheckLabel>사진</CheckLabel>
                            {renderCheckCircle(galleryDone)}
                          </CheckItem>
                        )}
                      </ChecksWrap>
                    )}
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
