import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db, auth, empIdFromEmail } from '../services/firebase';
import type { ActivityItem } from '../types/activity';
import { achievementGroups } from '../types/achievement';

type RewardCategory =
  | 'activity'
  | 'achievement'
  | 'target'
  | 'match'
  | 'referral'
  | 'gallery'
  | 'mission';

const CATEGORY_TITLE: Record<RewardCategory, string> = {
  activity: '활동 참여 보상',
  achievement: '업적 달성 보상',
  target: '목표 달성 보상',
  match: '매치 승리 보상',
  referral: '추천인 보상',
  gallery: '갤러리 활동 보상',
  mission: '미션 성공 보상',
};

const ACHIEVEMENT_NAMES: Record<string, string> = Object.fromEntries(
  achievementGroups.flatMap((g) => g.items.map((item) => [item.id, item.desc]))
);

const parseAchievementDetail = (detail: string): string => {
  const keys = detail.split(/,\s*/).filter(Boolean);
  const names = keys.map((k) => ACHIEVEMENT_NAMES[k] ?? k);
  if (names.length === 1) return names[0];
  return `${names[0]} 외 ${names.length - 1}건`;
};

const parseDate = (entry: Record<string, unknown>): number => {
  if (typeof entry.createdAtMs === 'number') return entry.createdAtMs;
  const s = String(entry.createdAt ?? '');
  if (s.length >= 12) {
    return new Date(
      `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:00`,
    ).getTime();
  }
  return Date.now();
};

const makeDescription = (
  category: RewardCategory,
  entry: Record<string, unknown>,
): string => {
  switch (category) {
    case 'match':
      return `${entry.opponentName ?? '상대방'}과의 매치 승리`;
    case 'target': {
      const special = entry.myScore === entry.target;
      return special
        ? `목표 ${entry.myScore}점 완벽 달성`
        : `${entry.myScore}점 달성 · 목표 ${entry.target}점`;
    }
    case 'achievement':
      return typeof entry.detail === 'string' && entry.detail
        ? parseAchievementDetail(entry.detail)
        : '';
    case 'referral':
    case 'gallery':
      return typeof entry.detail === 'string'
        ? entry.detail
        : CATEGORY_TITLE[category];
    case 'activity':
      return '활동 참여 PIN 지급';
    case 'mission':
      return typeof entry.detail === 'string' && entry.detail
        ? entry.detail
        : '미션 달성 PIN 지급';
  }
};

const toRewardItem = (
  category: RewardCategory,
  key: string,
  entry: Record<string, unknown>,
): ActivityItem => {
  const base = {
    id: `reward_${category}_${key}`,
    type: 'reward' as const,
    date: parseDate(entry),
    title: CATEGORY_TITLE[category],
    description: makeDescription(category, entry),
    delta: (() => {
      const p = typeof entry.pin === 'number' ? entry.pin : 0;
      return entry.direction === 'loss' ? -p : p;
    })(),
    category,
  };
  if (category === 'target') {
    return {
      ...base,
      targetMeta: {
        myScore: typeof entry.myScore === 'number' ? entry.myScore : 0,
        target: typeof entry.target === 'number' ? entry.target : 0,
        special: entry.myScore === entry.target,
      },
    };
  }
  return base;
};

export const useActivityRewards = (yyyymm: string) => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const empId = empIdFromEmail(auth.currentUser?.email);
    if (!empId) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const snap = await get(ref(db, `users/${empId}/rewards/${yyyymm}`));
        if (cancelled) return;

        if (!snap.exists()) {
          setItems([]);
          setLoading(false);
          return;
        }

        const data = snap.val() as Record<string, unknown>;
        const result: ActivityItem[] = [];

        for (const [category, entries] of Object.entries(data)) {
          const cat = category as RewardCategory;
          if (!CATEGORY_TITLE[cat]) continue;

          if (cat === 'target') {
            const e = entries as Record<string, unknown>;
            const pin = typeof e.pin === 'number' ? e.pin : 0;
            if (pin > 0) result.push(toRewardItem(cat, yyyymm, e));
          } else {
            for (const [key, entry] of Object.entries(
              entries as Record<string, unknown>,
            )) {
              const e = entry as Record<string, unknown>;
              const pin = typeof e.pin === 'number' ? e.pin : 0;
              if (pin <= 0) continue;
              result.push(toRewardItem(cat, key, e));
            }
          }
        }

        setItems(result);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [yyyymm]);

  return { items, loading };
};
