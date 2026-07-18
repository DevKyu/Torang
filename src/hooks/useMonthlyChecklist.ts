import { useMemo } from 'react';
import useUserInfo from './useUserInfo';
import { useMission, isScoreGuessMission } from './useMission';
import { useMissionViewState } from './useMissionViewState';
import { useEventStore } from '../stores/eventStore';
import { useUiStore } from '../stores/useUiStore';
import {
  countCheerMessagesByCandidate,
  isCheerSatisfied,
} from '../utils/scoreGuessCheer';
import { getMatchTypeNouns } from '../utils/matchTypeLabel';
import type { Year, Month } from '../types/UserInfo';
import type { MatchChoices } from './useMatch';
import type { ActivityDateAll } from '../services/firebase';

export type SharedChecklistData = {
  activityAll: ActivityDateAll;
  activityLoading: boolean;
  activityYmdStr: string | undefined;
  monthParticipants: string[];
  participantsLoading: boolean;
  matchChoices: MatchChoices;
  matchChoicesLoading: boolean;
};

export type ChecklistItemKey =
  | 'targetScore'
  | 'rivalMatch'
  | 'scoreGuessPredict'
  | 'scoreGuessCandidate'
  | 'galleryUpload'
  | 'achievementCheck'
  | 'matchResult'
  | 'targetScoreReward'
  | 'villainVote';

export type ChecklistItem = {
  key: ChecklistItemKey;
  emoji: string;
  label: string;
  description: string;
  actionLabel: string;
  done: boolean;
  path: string;
};

export type MonthlyChecklistResult = {
  items: ChecklistItem[];
  loading: boolean;
};

export const useMonthlyChecklist = (
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
): MonthlyChecklistResult => {
  const userInfo = useUserInfo();
  const matchType = useEventStore((s) => s.matchType);
  const reminderDays = useEventStore((s) => s.checklistReminderDays);

  const { formatServerDate } = useUiStore.getState();
  const serverYear = formatServerDate('year') as Year;
  const serverMonth = Number(formatServerDate('month'));
  const serverYm = formatServerDate('ym');

  const hasActivityDate = !!activityYmdStr;

  const withinReminderWindow = useMemo(() => {
    if (!activityYmdStr) return false;
    if (reminderDays <= 0) return true;

    const y = Number(activityYmdStr.slice(0, 4));
    const m = Number(activityYmdStr.slice(4, 6)) - 1;
    const d = Number(activityYmdStr.slice(6, 8));
    const activityDate = new Date(y, m, d);

    const now = useUiStore.getState().getServerNow();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const daysUntil = Math.round(
      (activityDate.getTime() - today.getTime()) / 86400000,
    );
    return daysUntil <= reminderDays;
  }, [activityYmdStr, reminderDays]);

  const stillActionable = useMemo(
    () => useUiStore.getState().isBeforeCutoff(activityYmdStr, '18:30'),
    [activityYmdStr],
  );

  const currentMonthActivityYmd = activityAll[serverYear]?.[String(serverMonth)];

  const {
    data: missionData,
    myVote: missionMyVote,
    loading: missionLoading,
  } = useMission(serverYm);

  const { viewState: missionViewState } = useMissionViewState(
    currentMonthActivityYmd,
    missionData,
  );

  const items = useMemo<ChecklistItem[]>(() => {
    const isParticipant = !!myEmpId && monthParticipants.includes(myEmpId);
    if (!hasActivityDate || !isParticipant) return [];

    const result: ChecklistItem[] = [];

    if (withinReminderWindow && stillActionable) {
      const targetDone =
        userInfo?.targets?.[serverYear]?.[String(serverMonth) as Month] !==
        undefined;
      const rivalDone = Object.keys(matchChoices).length > 0;
      const { labelNoun: rivalLabelNoun, descNoun: rivalDescNoun } =
        getMatchTypeNouns(matchType);

      result.push(
        {
          key: 'targetScore',
          emoji: '🎯',
          label: '목표 점수',
          description: targetDone
            ? `${serverMonth}월 목표 점수를 저장했어요.`
            : `${serverMonth}월 목표 점수 저장 전이에요.`,
          actionLabel: '저장하기',
          done: targetDone,
          path: '/myinfo',
        },
        {
          key: 'rivalMatch',
          emoji: '⚔️',
          label: rivalLabelNoun,
          description: rivalDone
            ? `${serverMonth}월 ${rivalDescNoun} 상대를 선택했어요.`
            : `${serverMonth}월 ${rivalDescNoun} 설정 전이에요.`,
          actionLabel: '설정하기',
          done: rivalDone,
          path: '/ranking',
        },
      );
    }

    const scoreGuessData = isScoreGuessMission(missionData) ? missionData : null;
    const isCandidate =
      !!myEmpId && !!scoreGuessData?.targets?.empIds?.includes(myEmpId);

    if (scoreGuessData && missionViewState === 'preview' && stillActionable) {
      if (isCandidate) {
        const cheerMessageCount =
          countCheerMessagesByCandidate(scoreGuessData.votes)[myEmpId ?? ''] ??
          0;
        const cheerReadCount =
          (myEmpId && scoreGuessData.cheerReads?.[myEmpId]) || 0;
        const cheerRead = isCheerSatisfied(cheerReadCount, cheerMessageCount);

        if (cheerMessageCount > 0) {
          result.push({
            key: 'scoreGuessCandidate',
            emoji: '🎉',
            label: '신규회원 미션',
            description: cheerRead
              ? `${serverMonth}월 응원 메시지를 확인했어요.`
              : `${serverMonth}월 새 응원 메시지가 도착했어요.`,
            actionLabel: '확인하기',
            done: cheerRead,
            path: '/mission',
          });
        }
      } else {
        const predictDone = !!missionMyVote;
        result.push({
          key: 'scoreGuessPredict',
          emoji: '🔮',
          label: '신규회원 점수 예측',
          description: predictDone
            ? `${serverMonth}월 신규회원 점수 예측을 완료했어요.`
            : `${serverMonth}월 신규회원 점수 예측 전이에요.`,
          actionLabel: '예측하기',
          done: predictDone,
          path: '/mission',
        });
      }
    }

    return result;
  }, [
    hasActivityDate,
    withinReminderWindow,
    stillActionable,
    userInfo,
    serverYear,
    serverMonth,
    matchChoices,
    matchType,
    missionData,
    missionViewState,
    missionMyVote,
    monthParticipants,
    myEmpId,
  ]);

  const loading =
    userInfo === null ||
    activityLoading ||
    matchChoicesLoading ||
    missionLoading ||
    participantsLoading;

  return { items, loading };
};
