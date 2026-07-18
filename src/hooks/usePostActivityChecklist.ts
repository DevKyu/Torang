import { useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '../services/firebase';
import useUserInfo from './useUserInfo';
import { useMission, isScoreGuessMission } from './useMission';
import { useMissionViewState } from './useMissionViewState';
import { useEventStore } from '../stores/eventStore';
import { useUiStore } from '../stores/useUiStore';
import { checkGalleryUploadAvailability } from '../utils/galleryUpload';
import { getInitialGalleryYm } from '../utils/gallery';
import { getDiffDaysServer } from '../utils/date';
import { getMatchTypeNouns } from '../utils/matchTypeLabel';
import type { ChecklistItem, SharedChecklistData } from './useMonthlyChecklist';
import type { Year, Month } from '../types/UserInfo';

export type PostActivityChecklistResult = {
  items: ChecklistItem[];
  loading: boolean;
};

export const usePostActivityChecklist = (
  myEmpId: string | null,
  {
    activityAll,
    activityLoading,
    activityYmdStr,
    monthParticipants,
    participantsLoading,
    matchChoices,
    matchChoicesLoading,
  }: SharedChecklistData,
): PostActivityChecklistResult => {
  const userInfo = useUserInfo();
  const postActivityWindowDays = useEventStore(
    (s) => s.postActivityChecklistDays,
  );

  const { formatServerDate } = useUiStore.getState();
  const serverYear = formatServerDate('year') as Year;
  const serverMonth = Number(formatServerDate('month'));
  const serverYm = formatServerDate('ym');

  const hasActivityDate = !!activityYmdStr;
  const activityYm = activityYmdStr?.slice(0, 6) ?? serverYm;
  const activityMonthNum = activityYmdStr
    ? Number(activityYmdStr.slice(4, 6))
    : serverMonth;

  const pastCutoff = useMemo(
    () => !useUiStore.getState().isBeforeCutoff(activityYmdStr, '18:30'),
    [activityYmdStr],
  );

  const diffDaysSinceActivity = useMemo(
    () => (activityYmdStr ? getDiffDaysServer(activityYmdStr) : null),
    [activityYmdStr],
  );

  const withinPostActivityWindow = useMemo(() => {
    if (diffDaysSinceActivity === null || diffDaysSinceActivity < 1) {
      return false;
    }
    if (postActivityWindowDays <= 0) return true;
    return diffDaysSinceActivity <= postActivityWindowDays;
  }, [diffDaysSinceActivity, postActivityWindowDays]);

  const targetPinEnabled = useEventStore(
    (s) => (s.pinReward[activityYm]?.targetScore ?? 0) > 0,
  );
  const targetYear = activityYmdStr?.slice(0, 4) as Year | undefined;
  const targetMonth = activityYmdStr
    ? (String(activityMonthNum) as Month)
    : undefined;
  const myTargetScore =
    targetYear && targetMonth ? userInfo?.scores?.[targetYear]?.[targetMonth] : undefined;
  const myTarget =
    targetYear && targetMonth ? userInfo?.targets?.[targetYear]?.[targetMonth] : undefined;
  const targetAchieved =
    typeof myTargetScore === 'number' &&
    typeof myTarget === 'number' &&
    myTargetScore >= myTarget;

  const withinTargetClaimWindow =
    diffDaysSinceActivity !== null &&
    diffDaysSinceActivity > 0 &&
    diffDaysSinceActivity <= 7;

  const [targetRewardClaimed, setTargetRewardClaimed] = useState(false);
  const [targetRewardLoaded, setTargetRewardLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTargetRewardLoaded(false);
    if (!myEmpId || !targetAchieved) {
      setTargetRewardClaimed(false);
      setTargetRewardLoaded(true);
      return;
    }
    get(ref(db, `users/${myEmpId}/rewards/${activityYm}/target`))
      .then((snap) => {
        if (cancelled) return;
        setTargetRewardClaimed(snap.exists());
      })
      .catch(() => {
        if (!cancelled) setTargetRewardClaimed(false);
      })
      .finally(() => {
        if (!cancelled) setTargetRewardLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [myEmpId, activityYm, targetAchieved]);

  const galleryYm = useMemo(
    () => getInitialGalleryYm(activityAll, Number(serverYear), serverMonth),
    [activityAll, serverYear, serverMonth],
  );

  const galleryAvailability = useMemo(() => {
    const y = Number(galleryYm.slice(0, 4));
    const m = Number(galleryYm.slice(4, 6));
    return checkGalleryUploadAvailability(activityAll, y, m);
  }, [activityAll, galleryYm]);

  const galleryUploadPin = useEventStore(
    (s) => s.getGalleryReward(galleryYm).upload.pin,
  );
  const galleryUploadThreshold = useEventStore(
    (s) => s.getGalleryReward(galleryYm).upload.threshold,
  );

  const [galleryUploadedCount, setGalleryUploadedCount] = useState(0);
  const [galleryLoaded, setGalleryLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setGalleryLoaded(false);
    if (!myEmpId) {
      setGalleryUploadedCount(0);
      setGalleryLoaded(true);
      return;
    }
    get(ref(db, `users/${myEmpId}/gallery/uploadedCount/${galleryYm}`))
      .then((snap) => {
        if (cancelled) return;
        setGalleryUploadedCount(snap.exists() ? Number(snap.val()) : 0);
      })
      .catch(() => {
        if (!cancelled) setGalleryUploadedCount(0);
      })
      .finally(() => {
        if (!cancelled) setGalleryLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [myEmpId, galleryYm]);

  const matchType = useEventStore((s) => s.matchType);

  const [matchResultReady, setMatchResultReady] = useState(false);
  const [matchResultLoaded, setMatchResultLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMatchResultLoaded(false);
    if (!myEmpId) {
      setMatchResultReady(false);
      setMatchResultLoaded(true);
      return;
    }
    get(ref(db, `matchResults/${activityYm}/${matchType}/${myEmpId}`))
      .then((snap) => {
        if (cancelled) return;
        setMatchResultReady(snap.exists());
      })
      .catch(() => {
        if (!cancelled) setMatchResultReady(false);
      })
      .finally(() => {
        if (!cancelled) setMatchResultLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [myEmpId, activityYm, matchType]);

  const {
    data: missionData,
    myVote: missionMyVote,
    loading: missionLoading,
  } = useMission(activityYm);

  const { viewState: missionViewState } = useMissionViewState(
    activityYmdStr,
    missionData,
  );

  const items = useMemo<ChecklistItem[]>(() => {
    const isParticipant = !!myEmpId && monthParticipants.includes(myEmpId);
    if (
      !hasActivityDate ||
      !isParticipant ||
      !pastCutoff ||
      !withinPostActivityWindow
    ) {
      return [];
    }

    const result: ChecklistItem[] = [];

    if (targetPinEnabled && targetAchieved && withinTargetClaimWindow) {
      result.push({
        key: 'targetScoreReward',
        emoji: '🎯',
        label: '목표 점수',
        description: targetRewardClaimed
          ? `${activityMonthNum}월 목표 점수 보상을 받았어요.`
          : `${activityMonthNum}월 목표 점수 결과 확인 전이에요.`,
        actionLabel: '확인하기',
        done: targetRewardClaimed,
        path: '/myinfo',
      });
    }

    if (Object.keys(matchChoices).length > 0) {
      const { labelNoun: matchLabelNoun, descNoun: matchDescNoun } =
        getMatchTypeNouns(matchType);
      result.push({
        key: 'matchResult',
        emoji: '⚔️',
        label: matchLabelNoun,
        description: matchResultReady
          ? `${activityMonthNum}월 ${matchDescNoun} 결과를 확인했어요.`
          : `${activityMonthNum}월 ${matchDescNoun} 결과 확인 전이에요.`,
        actionLabel: '확인하기',
        done: matchResultReady,
        path: '/ranking',
      });
    }

    const lastCheck = Number(userInfo?.lastAchievementCheck ?? 0);
    const achievementDone = lastCheck >= Number(activityYmdStr);

    result.push({
      key: 'achievementCheck',
      emoji: '🏆',
      label: '업적 달성',
      description: achievementDone
        ? `${activityMonthNum}월 활동 업적을 확인했어요.`
        : `${activityMonthNum}월 활동 업적 확인 전이에요.`,
      actionLabel: '확인하기',
      done: achievementDone,
      path: '/achievements',
    });

    const isVillainMission =
      !!missionData?.config && !isScoreGuessMission(missionData);

    if (isVillainMission && missionViewState === 'voting') {
      result.push({
        key: 'villainVote',
        emoji: '🕵️',
        label: '빌런 투표',
        description: missionMyVote
          ? `${activityMonthNum}월 빌런 투표를 완료했어요.`
          : `${activityMonthNum}월 빌런 투표 전이에요.`,
        actionLabel: '투표하기',
        done: !!missionMyVote,
        path: '/mission',
      });
    }

    if (galleryAvailability.allowed) {
      const rewardActive = galleryUploadPin > 0 && galleryUploadThreshold > 0;
      const goal = rewardActive ? galleryUploadThreshold : 1;
      const galleryDone = galleryUploadedCount >= goal;

      result.push({
        key: 'galleryUpload',
        emoji: '📸',
        label: '사진 업로드',
        description: galleryDone
          ? rewardActive
            ? `${activityMonthNum}월 활동 사진을 ${galleryUploadThreshold}장 이상 올렸어요.`
            : `${activityMonthNum}월 활동 사진을 올렸어요.`
          : rewardActive && galleryUploadedCount > 0
            ? `${activityMonthNum}월 활동 사진 ${galleryUploadedCount}/${galleryUploadThreshold}장 업로드했어요.`
            : `${activityMonthNum}월 활동 사진 업로드 전이에요.`,
        actionLabel: '올리기',
        done: galleryDone,
        path: '/gallery',
      });
    }

    return result;
  }, [
    hasActivityDate,
    pastCutoff,
    withinPostActivityWindow,
    monthParticipants,
    myEmpId,
    targetPinEnabled,
    targetAchieved,
    withinTargetClaimWindow,
    targetRewardClaimed,
    galleryAvailability,
    galleryUploadPin,
    galleryUploadThreshold,
    galleryUploadedCount,
    userInfo,
    activityYmdStr,
    activityMonthNum,
    matchChoices,
    matchType,
    matchResultReady,
    missionData,
    missionViewState,
    missionMyVote,
  ]);

  const loading =
    userInfo === null ||
    activityLoading ||
    missionLoading ||
    participantsLoading ||
    matchChoicesLoading ||
    !galleryLoaded ||
    !matchResultLoaded ||
    !targetRewardLoaded;

  return { items, loading };
};
