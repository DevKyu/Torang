import type { UserInfo } from '../types/UserInfo';
import type { AchievementResult } from '../types/achievement';
import { checkBaseAchievements } from './checkBaseAchievements';
import { checkMissionAchievements } from './checkMissionAchievements';

export const checkAllAchievements = async (
  user: UserInfo,
  existing: AchievementResult = {},
): Promise<AchievementResult> => {
  const [baseResults, missionResults] = await Promise.all([
    checkBaseAchievements(user, existing),
    checkMissionAchievements(existing),
  ]);

  return { ...baseResults, ...missionResults };
};
