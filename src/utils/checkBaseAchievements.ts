import type { UserInfo, UserScores } from '../types/UserInfo';
import type { AchievementResult } from '../types/achievement';
import {
  findFirstParticipationYm,
  findStreakYms,
  findScoreYms,
  getActiveAchievementYm,
} from '../utils/achievementHelpers';

export const checkBaseAchievements = (
  user: UserInfo,
  existing: AchievementResult = {},
): AchievementResult => {
  const results: AchievementResult = {};
  const scores: UserScores = user.scores ?? {};

  const firstYm = findFirstParticipationYm(scores);
  if (firstYm && !existing['participation_first']) {
    results['participation_first'] = { achievedAt: firstYm };
  }

  const streaks = findStreakYms(scores, [3, 6, 12]);
  for (const [months, ym] of Object.entries(streaks)) {
    const key = `participation_streak_${months}`;
    if (ym && !existing[key]) {
      results[key] = { achievedAt: ym };
    }
  }

  if (user.join) {
    const targets = [
      { m: 3, k: 'active_3m' },
      { m: 6, k: 'active_6m' },
      { m: 12, k: 'active_1y' },
      { m: 24, k: 'active_2y' },
    ];
    for (const { m, k } of targets) {
      if (!existing[k]) {
        const ym = getActiveAchievementYm(user.join, m);
        if (ym) {
          results[k] = { achievedAt: ym };
        }
      }
    }
  }

  const milestones = [100, 150, 180, 200];
  const scoreResults = findScoreYms(scores, milestones);
  for (const ms of milestones) {
    const key = `score_${ms}`;
    const ym = scoreResults[ms];
    if (ym && !existing[key]) {
      results[key] = { achievedAt: ym };
    }
  }

  return results;
};
