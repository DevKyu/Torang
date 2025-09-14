import { getAllUserMatchResults, getCurrentUserId } from '../services/firebase';
import type { AchievementResult } from '../types/achievement';

const START_YYYYMM = 202508;
const getCurrentYyyymm = (): number => {
  const d = new Date();
  return d.getFullYear() * 100 + (d.getMonth() + 1);
};

type MatchResult = 'win' | 'lose' | 'draw';
type MatchRecord = { result?: MatchResult };
type UserMatchData = {
  rival?: Record<string, MatchRecord>;
  pin?: Record<string, MatchRecord>;
};
type AllMatchResults = Record<string, Record<string, UserMatchData>>;

export const checkMissionAchievements = async (
  existing: AchievementResult = {},
): Promise<AchievementResult> => {
  const empId = getCurrentUserId();
  if (!empId) return {};

  const allData = (await getAllUserMatchResults()) as AllMatchResults | null;
  if (!allData) return {};

  const currentYyyymm = getCurrentYyyymm();
  let rivalFirst: string | null = null;
  let rivalWin: string | null = null;
  let pinFirst: string | null = null;
  let pinWin: string | null = null;

  for (const ym of Object.keys(allData).sort()) {
    const numYm = Number(ym);
    if (numYm < START_YYYYMM || numYm > currentYyyymm) continue;

    const userData = allData[ym]?.[empId];
    if (!userData) continue;

    if (userData.rival && !rivalFirst) rivalFirst = ym;
    if (userData.rival && !rivalWin) {
      if (Object.values(userData.rival).some((m) => m.result === 'win')) {
        rivalWin = ym;
      }
    }

    if (userData.pin && !pinFirst) pinFirst = ym;
    if (userData.pin && !pinWin) {
      if (Object.values(userData.pin).some((m) => m.result === 'win')) {
        pinWin = ym;
      }
    }
  }

  const results: AchievementResult = {};
  if (rivalFirst && !existing['mission_rival_participate']) {
    results['mission_rival_participate'] = { achievedAt: rivalFirst };
  }
  if (rivalWin && !existing['mission_rival_win1']) {
    results['mission_rival_win1'] = { achievedAt: rivalWin };
  }
  if (pinFirst && !existing['mission_pin_participate']) {
    results['mission_pin_participate'] = { achievedAt: pinFirst };
  }
  if (pinWin && !existing['mission_pin_win1']) {
    results['mission_pin_win1'] = { achievedAt: pinWin };
  }

  return results;
};
