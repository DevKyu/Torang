import { getAllUserMatchResults, getCurrentUserId } from '../services/firebase';
import type { AchievementResult } from '../types/achievement';
import type { MatchType } from '../types/match';

const START_YYYYMM = 202508;
const getCurrentYyyymm = (): number => {
  const d = new Date();
  return d.getFullYear() * 100 + (d.getMonth() + 1);
};

type MatchResult = 'win' | 'lose' | 'draw';
type MatchRecord = { result?: MatchResult };

type AllMatchResults = Record<
  string,
  Record<MatchType, Record<string, Record<string, MatchRecord>>>
>;

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
  let rivalStreak3: string | null = null;
  let rivalRevenge: string | null = null;
  let pinFirst: string | null = null;
  let pinWin: string | null = null;

  let rivalWinCount = 0;
  const rivalHistory: Record<string, MatchResult> = {};

  const sortedYms = Object.keys(allData)
    .map(Number)
    .filter((ym) => ym >= START_YYYYMM && ym <= currentYyyymm)
    .sort((a, b) => a - b)
    .map(String);

  for (const ym of sortedYms) {
    const typeData = allData[ym];
    const rivalMatches = typeData?.rival?.[empId];
    const pinMatches = typeData?.pin?.[empId];

    if (rivalMatches) {
      if (!rivalFirst) rivalFirst = ym;

      let monthHasWin = false;

      for (const [opponentId, match] of Object.entries(rivalMatches)) {
        const result = match.result;
        const prev = rivalHistory[opponentId];

        if (prev === 'lose' && result === 'win' && !rivalRevenge) {
          rivalRevenge = ym;
        }

        if (result === 'win') {
          rivalWinCount++;
          monthHasWin = true;
          if (rivalWinCount >= 3 && !rivalStreak3) {
            rivalStreak3 = ym;
          }
        } else if (result === 'lose') {
          rivalWinCount = 0;
        }

        if (result) rivalHistory[opponentId] = result;
      }

      if (monthHasWin && !rivalWin) {
        rivalWin = ym;
      }
    }

    if (pinMatches) {
      if (!pinFirst) pinFirst = ym;
      const hasWin = Object.values(pinMatches).some((m) => m.result === 'win');
      if (hasWin && !pinWin) {
        pinWin = ym;
      }
    }
  }

  const results: AchievementResult = {};
  const addIfNew = (id: string, ym: string | null) => {
    if (ym && !existing[id]) results[id] = { achievedAt: ym };
  };

  addIfNew('mission_rival_participate', rivalFirst);
  addIfNew('mission_rival_win1', rivalWin);
  addIfNew('mission_pin_participate', pinFirst);
  addIfNew('mission_pin_win1', pinWin);
  addIfNew('mission_rival_streak3', rivalStreak3);
  addIfNew('mission_rival_revenge', rivalRevenge);

  return results;
};
