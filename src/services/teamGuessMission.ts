import { ref, set, get, remove, update, increment } from 'firebase/database';
import { db } from './firebase';
import { useUiStore } from '../stores/useUiStore';
import {
  buildMissionPinReward,
  claimMissionReveal,
  commitMissionReveal,
  migrateLegacyIfNeeded,
} from '../hooks/useMission';
import type {
  MissionStatus,
  TeamGuessMissionConfig,
  TeamGuessMissionData,
  TeamGuessVote,
} from '../hooks/useMission';
import { firebaseToFormationGroups, type RawFormationGroups } from '../utils/teamFormation';
import type { WinnerMap } from '../hooks/useTeamFormation';

export async function saveTeamGuessMissionContent(
  ym: string,
  config: Omit<TeamGuessMissionConfig, 'status'>,
  currentStatus: MissionStatus | null = null,
): Promise<void> {
  await migrateLegacyIfNeeded(ym);
  await update(ref(db, `missions/${ym}/teamGuess`), {
    config: { ...config, status: currentStatus ?? 'draft' },
  });
}

export async function submitTeamGuessVote(
  ym: string,
  voterEmpId: string,
  vote: TeamGuessVote,
): Promise<void> {
  await set(ref(db, `missions/${ym}/votes/teamGuess/${voterEmpId}`), vote);
}

export async function deleteTeamGuessVote(
  ym: string,
  voterEmpId: string,
): Promise<void> {
  await remove(ref(db, `missions/${ym}/votes/teamGuess/${voterEmpId}`));
}

function extractWinnerMap(
  raw: Record<string, { winner?: string }> | null,
): WinnerMap {
  const map: WinnerMap = {};
  if (!raw) return map;
  Object.entries(raw).forEach(([gid, g]) => {
    if (g.winner === 'team1' || g.winner === 'team2' || g.winner === 'draw') {
      map[gid] = g.winner;
    }
  });
  return map;
}

export async function revealTeamGuessMissionResult(
  ym: string,
  data: TeamGuessMissionData,
): Promise<{ myGroupCorrectVoters: string[]; bonusCorrectVoters: string[] }> {
  if (data.result?.revealed === true) {
    await set(ref(db, `missions/${ym}/teamGuess/config/status`), 'revealed');
    return {
      myGroupCorrectVoters: data.result.myGroupCorrectVoters ?? [],
      bonusCorrectVoters: data.result.bonusCorrectVoters ?? [],
    };
  }

  const { config, votes } = data;
  if (!config) throw new Error('미션 데이터가 없습니다.');

  const formationSnap = await get(ref(db, `teamFormation/${ym}`));
  const formationVal = formationSnap.val() as
    | { status?: string; groups?: RawFormationGroups }
    | null;
  if (!formationVal || formationVal.status !== 'confirmed' || !formationVal.groups) {
    throw new Error('팀 편성이 확정되지 않았습니다.');
  }
  const groups = firebaseToFormationGroups(formationVal.groups);

  const teamSnap = await get(ref(db, `team/${ym}`));
  const winnerMap = extractWinnerMap(
    teamSnap.val() as Record<string, { winner?: string }> | null,
  );

  const groupIds = groups.map((_, i) => String.fromCharCode(65 + i));
  const missingGroupIds = groupIds.filter((gid) => !winnerMap[gid]);
  if (missingGroupIds.length > 0) {
    throw new Error(`아직 결과가 입력되지 않은 조가 있습니다: ${missingGroupIds.join(', ')}조`);
  }

  const voterGroupMap: Record<string, string> = {};
  groups.forEach((group, i) => {
    const groupId = groupIds[i];
    [...group.team1, ...group.team2].forEach((p) => {
      voterGroupMap[p.empId] = groupId;
    });
  });

  await migrateLegacyIfNeeded(ym);
  const previousStatus = await claimMissionReveal(ym, 'teamGuess');

  const rewardPin = config.rewardPin ?? 1;
  const bonusRewardPin = config.bonusRewardPin ?? 1;
  const myGroupCorrectVoters: string[] = [];
  const bonusCorrectVoters: string[] = [];
  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const now = getServerNow().getTime();
  const createdAt = getServerTimestamp();
  const allWrites: Record<string, unknown> = {};
  const pinDeltas: Record<string, number> = {};

  for (const [voterEmpId, vote] of Object.entries(votes ?? {})) {
    const groupId = voterGroupMap[voterEmpId];
    if (!groupId) continue;

    const myCorrect = vote.myGroupPick === winnerMap[groupId];
    if (!myCorrect) continue;

    myGroupCorrectVoters.push(voterEmpId);
    pinDeltas[voterEmpId] = (pinDeltas[voterEmpId] ?? 0) + rewardPin;
    Object.assign(
      allWrites,
      buildMissionPinReward(voterEmpId, ym, rewardPin, '정기전 팀 승부 예측 성공 ⚡', now, createdAt),
    );

    if (vote.bonusGroupId && vote.bonusGroupPick) {
      const bonusCorrect = vote.bonusGroupPick === winnerMap[vote.bonusGroupId];
      if (bonusCorrect) {
        bonusCorrectVoters.push(voterEmpId);
        pinDeltas[voterEmpId] = (pinDeltas[voterEmpId] ?? 0) + bonusRewardPin;
        Object.assign(
          allWrites,
          buildMissionPinReward(
            voterEmpId,
            ym,
            bonusRewardPin,
            '정기전 보너스 픽 적중 🎯',
            now,
            createdAt,
            '_bonus',
          ),
        );
      }
    }
  }

  Object.entries(pinDeltas).forEach(([empId, totalPin]) => {
    allWrites[`users/${empId}/pin`] = increment(totalPin);
  });

  allWrites[`missions/${ym}/teamGuess/result`] = {
    revealed: true,
    revealedAt: now,
    myGroupCorrectVoters,
    bonusCorrectVoters,
  };
  allWrites[`missions/${ym}/teamGuess/config/status`] = 'revealed';

  await commitMissionReveal(ym, 'teamGuess', previousStatus, allWrites);

  return { myGroupCorrectVoters, bonusCorrectVoters };
}
