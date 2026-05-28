import {
  getAfterPartyParticipation,
  getCurrentUserId,
  getUserGalleryUploadCount,
  getUserGalleryCommentCount,
} from '../services/firebase';
import type { UserInfo, UserScores } from '../types/UserInfo';
import type { AchievementResult } from '../types/achievement';
import {
  findFirstParticipationYm,
  findStreakYms,
  findScoreYms,
  getActiveAchievementYm,
  todayYm,
  findScoreStreakYm,
  findPersonalBestYm,
  findAfterPartyStreakYms,
  findNthParticipationYm,
} from '../utils/achievementHelpers';

export const checkBaseAchievements = async (
  user: UserInfo,
  existing: AchievementResult = {},
): Promise<AchievementResult> => {
  const results: AchievementResult = {};
  const scores: UserScores = user.scores ?? {};
  const empId = getCurrentUserId();

  const firstYm = findFirstParticipationYm(scores);
  if (firstYm && !existing['participation_first']) {
    results['participation_first'] = { achievedAt: firstYm };
  }

  const count10Ym = !existing['participation_count_10']
    ? findNthParticipationYm(scores, 10)
    : null;
  if (count10Ym) results['participation_count_10'] = { achievedAt: count10Ym };

  const streaks = findStreakYms(scores, [3, 6, 12, 24]);
  for (const [months, ym] of Object.entries(streaks)) {
    const key = `participation_streak_${months}`;
    if (ym && !existing[key]) {
      results[key] = { achievedAt: ym };
    }
  }

  const afterPartyMap = empId ? await getAfterPartyParticipation(empId) : {};
  const afterStreaks = findAfterPartyStreakYms(afterPartyMap, [3, 6]);
  const after3m = afterStreaks[3];
  if (after3m && !existing['participation_afterparty_3']) {
    results['participation_afterparty_3'] = { achievedAt: after3m };
  }
  const after6m = afterStreaks[6];
  if (after6m && !existing['participation_afterparty_6']) {
    results['participation_afterparty_6'] = { achievedAt: after6m };
  }

  if (user.join) {
    const targets = [
      { m: 3, k: 'active_3m' },
      { m: 6, k: 'active_6m' },
      { m: 12, k: 'active_1y' },
      { m: 24, k: 'active_2y' },
      { m: 36, k: 'active_3y' },
    ];
    for (const { m, k } of targets) {
      if (!existing[k]) {
        const ym = getActiveAchievementYm(user.join, m);
        if (ym) results[k] = { achievedAt: ym };
      }
    }
  }

  if (user.invitedCount && user.invitedCount >= 2 && !existing['active_invite_2']) {
    results['active_invite_2'] = { achievedAt: todayYm() };
  }

  if (empId && !existing['active_gallery_upload']) {
    const uploadCount = await getUserGalleryUploadCount(empId);
    if (uploadCount >= 10) results['active_gallery_upload'] = { achievedAt: todayYm() };
  }

  if (empId && !existing['active_gallery_comment']) {
    const commentCount = await getUserGalleryCommentCount(empId);
    if (commentCount >= 30) results['active_gallery_comment'] = { achievedAt: todayYm() };
  }

  const milestones = [100, 150, 180, 200, 220];
  const scoreResults = findScoreYms(scores, milestones);
  for (const ms of milestones) {
    const key = `score_${ms}`;
    const ym = scoreResults[ms];
    if (ym && !existing[key]) {
      results[key] = { achievedAt: ym };
    }
  }

  const consistentYm = findScoreStreakYm(scores, 150, 3);
  if (consistentYm && !existing['score_consistent_150']) {
    results['score_consistent_150'] = { achievedAt: consistentYm };
  }

  const consistent6Ym = findScoreStreakYm(scores, 150, 6);
  if (consistent6Ym && !existing['score_consistent_150_6']) {
    results['score_consistent_150_6'] = { achievedAt: consistent6Ym };
  }

  const bestYm = findPersonalBestYm(scores);
  if (bestYm && !existing['score_personal_best']) {
    results['score_personal_best'] = { achievedAt: bestYm };
  }

  return results;
};
