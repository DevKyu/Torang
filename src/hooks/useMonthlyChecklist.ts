import { useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '../services/firebase';
import useUserInfo from './useUserInfo';
import { useActivityDates } from './useActivityDates';
import { useMatch } from './useMatch';
import { useMission, isScoreGuessMission } from './useMission';
import { useEventStore } from '../stores/eventStore';
import { useUiStore } from '../stores/useUiStore';
import {
  getDaysUntilMissionReveal,
  getMissionViewState,
} from '../utils/missionViewState';
import {
  countCheerMessagesByCandidate,
  isCheerSatisfied,
} from '../utils/scoreGuessCheer';
import type { Year, Month } from '../types/UserInfo';
import type { YearMonth } from '../types/match';

export type ChecklistItemKey =
  | 'targetScore'
  | 'rivalMatch'
  | 'scoreGuessPredict'
  | 'scoreGuessCandidate';

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
): MonthlyChecklistResult => {
  const userInfo = useUserInfo();
  const { maps: activityAll, loading: activityLoading } = useActivityDates();
  const matchType = useEventStore((s) => s.matchType);
  const reminderDays = useEventStore((s) => s.checklistReminderDays);

  const { formatServerDate } = useUiStore.getState();
  const serverYear = formatServerDate('year') as Year;
  const serverMonth = Number(formatServerDate('month'));
  const serverYm = formatServerDate('ym');

  const activityYmdStr = useMemo(() => {
    let activityYmd = activityAll[serverYear]?.[String(serverMonth)];
    if (!activityYmd) {
      const prevMonth = serverMonth === 1 ? 12 : serverMonth - 1;
      const prevYear =
        serverMonth === 1 ? Number(serverYear) - 1 : Number(serverYear);
      activityYmd = activityAll[String(prevYear)]?.[String(prevMonth)];
    }
    return activityYmd ? String(activityYmd) : undefined;
  }, [activityAll, serverYear, serverMonth]);

  const hasActivityDate = !!activityYmdStr;
  const activityYm = activityYmdStr?.slice(0, 6) ?? serverYm;

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

  const { choices, loading: matchLoading } = useMatch(
    activityYm as YearMonth,
    myEmpId,
    matchType,
  );

  const currentMonthActivityYmd = activityAll[serverYear]?.[String(serverMonth)];

  const [monthParticipants, setMonthParticipants] = useState<string[]>([]);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setParticipantsLoaded(false);
    get(ref(db, `activityParticipants/${serverYear}/${serverMonth}`))
      .then((snap) => {
        if (cancelled) return;
        setMonthParticipants(
          snap.exists() ? Object.keys(snap.val() as Record<string, true>) : [],
        );
      })
      .catch(() => {
        if (!cancelled) setMonthParticipants([]);
      })
      .finally(() => {
        if (!cancelled) setParticipantsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [serverYear, serverMonth]);

  const {
    data: missionData,
    myVote: missionMyVote,
    loading: missionLoading,
  } = useMission(serverYm);

  const missionDaysUntilReveal = useMemo(
    () =>
      getDaysUntilMissionReveal(
        currentMonthActivityYmd,
        missionData?.config,
        useUiStore.getState().getServerNow(),
      ),
    [currentMonthActivityYmd, missionData],
  );

  const missionViewState = useMemo(
    () => getMissionViewState(missionData?.config, missionDaysUntilReveal),
    [missionData, missionDaysUntilReveal],
  );

  const items = useMemo<ChecklistItem[]>(() => {
    const isParticipant = !!myEmpId && monthParticipants.includes(myEmpId);
    if (!hasActivityDate || !isParticipant) return [];

    const result: ChecklistItem[] = [];

    if (withinReminderWindow && stillActionable) {
      const targetDone =
        userInfo?.targets?.[serverYear]?.[String(serverMonth) as Month] !==
        undefined;
      const rivalDone = Object.keys(choices).length > 0;
      const rivalNoun = matchType === 'pin' ? '핀 매치' : '라이벌 매치';

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
          label: rivalNoun,
          description: rivalDone
            ? `${serverMonth}월 ${rivalNoun} 상대를 선택했어요.`
            : `${serverMonth}월 ${rivalNoun} 설정 전이에요.`,
          actionLabel: '설정하기',
          done: rivalDone,
          path: '/ranking',
        },
      );
    }

    const scoreGuessData = isScoreGuessMission(missionData) ? missionData : null;
    const isCandidate =
      !!myEmpId && !!scoreGuessData?.targets?.empIds?.includes(myEmpId);

    if (scoreGuessData && missionViewState === 'preview') {
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
    choices,
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
    matchLoading ||
    missionLoading ||
    !participantsLoaded;

  return { items, loading };
};
