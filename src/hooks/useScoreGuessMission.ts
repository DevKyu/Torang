import { ref, set, update, get, remove } from 'firebase/database';
import { db } from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';
import { buildMissionPinReward, claimMissionReveal } from './useMission';
import type {
  ScoreGuessMissionData,
  ScoreGuessVote,
} from './useMission';

export async function markCheerRead(
  ym: string,
  empId: string,
  messageCount: number,
): Promise<void> {
  await set(ref(db, `missions/${ym}/cheerReads/${empId}`), messageCount);
}

export async function confirmScoreGuessTargets(
  ym: string,
  empIds: string[],
): Promise<void> {
  await set(ref(db, `missions/${ym}/targets`), {
    empIds,
    confirmedAt: useUiStore.getState().getServerNow().getTime(),
  });
}

export async function submitScoreGuessVote(
  ym: string,
  voterEmpId: string,
  targetEmpId: string,
  predictedScore: number,
  message?: string,
  anonymous?: boolean,
): Promise<void> {
  const vote: ScoreGuessVote = { targetEmpId, predictedScore };
  if (message) vote.message = message;
  if (anonymous) vote.anonymous = true;
  await set(ref(db, `missions/${ym}/votes/${voterEmpId}`), vote);
}

export async function deleteScoreGuessVote(
  ym: string,
  voterEmpId: string,
): Promise<void> {
  await remove(ref(db, `missions/${ym}/votes/${voterEmpId}`));
}

export async function revealScoreGuessMissionResult(
  ym: string,
  data: ScoreGuessMissionData,
): Promise<{
  actualScores: Record<string, number>;
  correctVoters: string[];
  topTargets: string[];
}> {
  if (data.result?.revealed === true) {
    await set(ref(db, `missions/${ym}/config/status`), 'revealed');
    return {
      actualScores: data.result.actualScores ?? {},
      correctVoters: data.result.correctVoters ?? [],
      topTargets: data.result.topTargets ?? [],
    };
  }

  const { config, targets, votes } = data;
  if (!config || !targets?.empIds?.length)
    throw new Error('확정된 신규회원 후보가 없습니다.');

  const year = ym.slice(0, 4);
  const month = String(Number(ym.slice(4)));

  const scoreSnaps = await Promise.all(
    targets.empIds.map((empId) =>
      get(ref(db, `users/${empId}/scores/${year}/${month}`)),
    ),
  );

  const actualScores: Record<string, number> = {};
  const missingEmpIds: string[] = [];
  targets.empIds.forEach((empId, i) => {
    if (scoreSnaps[i].exists()) actualScores[empId] = scoreSnaps[i].val() as number;
    else missingEmpIds.push(empId);
  });
  if (missingEmpIds.length > 0)
    throw new Error(`점수가 입력되지 않은 후보가 있습니다: ${missingEmpIds.join(', ')}`);

  await claimMissionReveal(ym);

  const threshold = config.scoreDiffThreshold ?? 5;
  const rewardPin = config.rewardPin ?? 0.5;
  const correctVoters: string[] = [];
  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const now = getServerNow().getTime();
  const createdAt = getServerTimestamp();
  const allWrites: Record<string, unknown> = {};

  for (const [voterEmpId, vote] of Object.entries(votes ?? {})) {
    if (targets.empIds.includes(voterEmpId)) continue;
    const actual = actualScores[vote.targetEmpId];
    if (actual === undefined) continue;
    const diff = Math.abs(vote.predictedScore - actual);
    if (diff > threshold) continue;

    correctVoters.push(voterEmpId);
    Object.assign(
      allWrites,
      buildMissionPinReward(
        voterEmpId,
        ym,
        rewardPin,
        '신규회원 점수 예측 성공 🎯',
        now,
        createdAt,
        '',
        { predictedScore: vote.predictedScore, actualScore: actual },
      ),
    );
  }

  const uniqueScoresDesc = [...new Set(targets.empIds.map((id) => actualScores[id]))].sort(
    (a, b) => b - a,
  );
  const cutoff = uniqueScoresDesc[Math.min(2, uniqueScoresDesc.length - 1)];
  const topTargets = targets.empIds.filter((id) => actualScores[id] >= cutoff);
  const targetRewardPin = config.targetRewardPin ?? 0.5;

  topTargets.forEach((targetEmpId) => {
    Object.assign(
      allWrites,
      buildMissionPinReward(
        targetEmpId,
        ym,
        targetRewardPin,
        '신규회원 점수 순위 보상 🏅',
        now,
        createdAt,
        '_rank',
      ),
    );
  });

  allWrites[`missions/${ym}/result`] = {
    revealed: true,
    revealedAt: now,
    actualScores,
    correctVoters,
    topTargets,
  };
  allWrites[`missions/${ym}/config/status`] = 'revealed';

  await update(ref(db), allWrites);

  return { actualScores, correctVoters, topTargets };
}
