import { useEffect, useState } from 'react';
import {
  ref,
  get,
  set,
  remove,
  onValue,
  update,
  increment,
  runTransaction,
} from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, empIdFromEmail } from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';

export type MissionType = 'villain' | 'scoreGuess' | 'teamGuess';
export type MissionStatus = 'draft' | 'active' | 'voting' | 'revealed';

type MissionConfigBase = {
  title: string;
  description: string;
  revealDays: number;
  rewardPin: number;
  status: MissionStatus;
};

export type VillainMissionConfig = MissionConfigBase & {
  type: 'villain';
  villainRewardPin: number;
  helperVoteThreshold: number;
  villainCatchThreshold: number;
};

export type ScoreGuessMissionConfig = MissionConfigBase & {
  type: 'scoreGuess';
  scoreDiffThreshold: number;
  targetRewardPin: number;
};

export type TeamGuessMissionConfig = MissionConfigBase & {
  type: 'teamGuess';
  bonusRewardPin: number;
};

export const DEFAULT_HELPER_VOTE_THRESHOLD = 3;
export const DEFAULT_VILLAIN_CATCH_THRESHOLD = 1;
export const DEFAULT_SCORE_DIFF_THRESHOLD = 5;

export type HiddenContent = {
  title: string;
  description: string;
  revealTitle?: string;
};

export type VillainMissionHidden = {
  villain: HiddenContent;
  helper: HiddenContent;
};

export type MissionRoles = {
  villain: string;
  helper: string;
  assignedAt: number;
};

export type ScoreGuessTargets = {
  empIds: string[];
  confirmedAt: number;
};

export type ScoreGuessVote = {
  targetEmpId: string;
  predictedScore: number;
  message?: string;
  anonymous?: boolean;
};

export type TeamGuessVote = {
  myGroupPick: 'team1' | 'team2' | 'draw';
  bonusGroupId?: string;
  bonusGroupPick?: 'team1' | 'team2' | 'draw';
};

export type MissionResult = {
  revealed: boolean;
  revealedAt: number;
  villainWon: boolean;
  helperWon: boolean;
  villainId: string;
  helperId: string;
  correctVoters: string[];
};

export type ScoreGuessMissionResult = {
  revealed: boolean;
  revealedAt: number;
  actualScores: Record<string, number>;
  correctVoters: string[];
  topTargets: string[];
};

export type TeamGuessMissionResult = {
  revealed: boolean;
  revealedAt: number;
  myGroupCorrectVoters: string[];
  bonusCorrectVoters: string[];
};

export type VillainMissionData = {
  config?: VillainMissionConfig;
  hidden?: VillainMissionHidden;
  roles?: MissionRoles;
  votes?: Record<string, string>;
  result?: MissionResult;
};

export type ScoreGuessMissionData = {
  config?: ScoreGuessMissionConfig;
  targets?: ScoreGuessTargets;
  votes?: Record<string, ScoreGuessVote>;
  result?: ScoreGuessMissionResult;
  cheerReads?: Record<string, number>;
};

export type TeamGuessMissionData = {
  config?: TeamGuessMissionConfig;
  votes?: Record<string, TeamGuessVote>;
  result?: TeamGuessMissionResult;
};

export type MissionData = VillainMissionData | ScoreGuessMissionData | TeamGuessMissionData;

export const isScoreGuessVote = (v: unknown): v is ScoreGuessVote =>
  typeof v === 'object' && v !== null && 'targetEmpId' in v;

export const isTeamGuessVote = (v: unknown): v is TeamGuessVote =>
  typeof v === 'object' && v !== null && 'myGroupPick' in v;

export type RawMissionSnapshot = {
  config?: VillainMissionConfig | ScoreGuessMissionConfig | TeamGuessMissionConfig;
  hidden?: VillainMissionHidden;
  roles?: MissionRoles;
  targets?: ScoreGuessTargets;
  result?: MissionResult | ScoreGuessMissionResult | TeamGuessMissionResult;
  villain?: VillainMissionData;
  scoreGuess?: ScoreGuessMissionData;
  teamGuess?: TeamGuessMissionData;
  votes?: Record<string, unknown>;
  cheerReads?: Record<string, number>;
};

export type ParsedMissionSnapshot = {
  villain: VillainMissionData | null;
  predict: ScoreGuessMissionData | TeamGuessMissionData | null;
  predictType: 'scoreGuess' | 'teamGuess' | null;
};

export function parseMissionSnapshot(
  raw: RawMissionSnapshot | null,
): ParsedMissionSnapshot {
  if (!raw) return { villain: null, predict: null, predictType: null };

  if (raw.villain || raw.scoreGuess || raw.teamGuess) {
    const votes = raw.votes as
      | {
          villain?: Record<string, string>;
          scoreGuess?: Record<string, ScoreGuessVote>;
          teamGuess?: Record<string, TeamGuessVote>;
        }
      | undefined;
    const villain = raw.villain ? { ...raw.villain, votes: votes?.villain } : null;
    const predictType: ParsedMissionSnapshot['predictType'] = raw.scoreGuess
      ? 'scoreGuess'
      : raw.teamGuess
        ? 'teamGuess'
        : null;
    const predict =
      predictType === 'scoreGuess'
        ? { ...raw.scoreGuess!, votes: votes?.scoreGuess, cheerReads: raw.cheerReads }
        : predictType === 'teamGuess'
          ? { ...raw.teamGuess!, votes: votes?.teamGuess }
          : null;
    return { villain, predict, predictType };
  }

  if (!raw.config) return { villain: null, predict: null, predictType: null };

  const type = raw.config.type;
  if (type === 'scoreGuess') {
    return {
      villain: null,
      predictType: 'scoreGuess',
      predict: {
        config: raw.config as ScoreGuessMissionConfig,
        targets: raw.targets,
        votes: raw.votes as Record<string, ScoreGuessVote> | undefined,
        result: raw.result as ScoreGuessMissionResult | undefined,
        cheerReads: raw.cheerReads,
      },
    };
  }
  if (type === 'teamGuess') {
    return {
      villain: null,
      predictType: 'teamGuess',
      predict: {
        config: raw.config as TeamGuessMissionConfig,
        votes: raw.votes as Record<string, TeamGuessVote> | undefined,
        result: raw.result as TeamGuessMissionResult | undefined,
      },
    };
  }
  return {
    predict: null,
    predictType: null,
    villain: {
      config: raw.config as VillainMissionConfig,
      hidden: raw.hidden,
      roles: raw.roles,
      votes: raw.votes as Record<string, string> | undefined,
      result: raw.result as MissionResult | undefined,
    },
  };
}

export async function migrateLegacyIfNeeded(ym: string): Promise<void> {
  await runTransaction(ref(db, `missions/${ym}`), (raw: RawMissionSnapshot | null) => {
    if (!raw) return raw;
    if (!raw.config || raw.villain || raw.scoreGuess || raw.teamGuess) return raw;

    const type: MissionType = raw.config.type ?? 'villain';
    const slot: Record<string, unknown> = { config: raw.config };
    if (raw.hidden) slot.hidden = raw.hidden;
    if (raw.roles) slot.roles = raw.roles;
    if (raw.targets) slot.targets = raw.targets;
    if (raw.result) slot.result = raw.result;

    const next: Record<string, unknown> = { ...raw };
    delete next.config;
    delete next.hidden;
    delete next.roles;
    delete next.targets;
    delete next.result;
    if (raw.votes) {
      next.votes = { [type]: raw.votes };
    } else {
      delete next.votes;
    }
    next[type] = slot;
    return next;
  });
}

export const useMission = (ym: string) => {
  const [snapshot, setSnapshot] = useState<ParsedMissionSnapshot>({
    villain: null,
    predict: null,
    predictType: null,
  });
  const [myEmpId, setMyEmpId] = useState<string>('');
  const [authReady, setAuthReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!cancelled) {
        setMyEmpId(empIdFromEmail(user?.email));
        setAuthReady(true);
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    setDataReady(false);
    const r = ref(db, `missions/${ym}`);
    const unsub = onValue(
      r,
      (snap) => {
        setSnapshot(parseMissionSnapshot(snap.exists() ? (snap.val() as RawMissionSnapshot) : null));
        setDataReady(true);
      },
      () => {
        setSnapshot({ villain: null, predict: null, predictType: null });
        setDataReady(true);
      },
    );
    return unsub;
  }, [ym]);

  const { villain, predict, predictType } = snapshot;
  const myVillainVote = myEmpId && villain?.votes ? villain.votes[myEmpId] : undefined;
  const myPredictVote = myEmpId && predict?.votes ? predict.votes[myEmpId] : undefined;

  return {
    villain,
    predict,
    predictType,
    myEmpId,
    myVillainVote,
    myPredictVote,
    loading: !authReady || !dataReady,
  };
};

export async function saveVillainMissionContent(
  ym: string,
  config: Omit<VillainMissionConfig, 'status'>,
  hidden: VillainMissionHidden,
  currentStatus: MissionStatus | null = null,
): Promise<void> {
  await migrateLegacyIfNeeded(ym);
  await update(ref(db, `missions/${ym}/villain`), {
    config: { ...config, status: currentStatus ?? 'draft' },
    hidden,
  });
}

export async function assignRoles(
  ym: string,
  villainId: string,
  helperId: string,
): Promise<void> {
  await migrateLegacyIfNeeded(ym);
  await set(ref(db, `missions/${ym}/villain/roles`), {
    villain: villainId,
    helper: helperId,
    assignedAt: useUiStore.getState().getServerNow().getTime(),
  });
}

export async function submitVote(
  ym: string,
  voterEmpId: string,
  targetEmpId: string,
): Promise<void> {
  await migrateLegacyIfNeeded(ym);
  await set(ref(db, `missions/${ym}/votes/villain/${voterEmpId}`), targetEmpId);
}

export async function setMissionStatus(
  ym: string,
  type: MissionType,
  status: MissionStatus,
): Promise<void> {
  await migrateLegacyIfNeeded(ym);
  await set(ref(db, `missions/${ym}/${type}/config/status`), status);
}

export async function resetVotes(ym: string, type: MissionType): Promise<void> {
  await migrateLegacyIfNeeded(ym);
  await remove(ref(db, `missions/${ym}/votes/${type}`));
}

export async function resetMissionState(
  ym: string,
  type: MissionType,
  data: VillainMissionData | ScoreGuessMissionData | TeamGuessMissionData | null,
): Promise<void> {
  await migrateLegacyIfNeeded(ym);
  const updates: Record<string, unknown> = {
    [`missions/${ym}/votes/${type}`]: null,
    [`missions/${ym}/${type}/result`]: null,
    [`missions/${ym}/${type}/config/status`]: 'active',
  };

  if (data?.result?.revealed) {
    const { revealedAt } = data.result;
    const recipientKeys: { empId: string; key: string }[] = [];

    if (type === 'scoreGuess') {
      const result = data.result as ScoreGuessMissionResult;
      (result.correctVoters ?? []).forEach((empId) =>
        recipientKeys.push({ empId, key: buildMissionRewardKey(revealedAt, empId) }),
      );
      (result.topTargets ?? []).forEach((empId) =>
        recipientKeys.push({ empId, key: buildMissionRewardKey(revealedAt, empId, '_rank') }),
      );
    } else if (type === 'teamGuess') {
      const result = data.result as TeamGuessMissionResult;
      (result.myGroupCorrectVoters ?? []).forEach((empId) =>
        recipientKeys.push({ empId, key: buildMissionRewardKey(revealedAt, empId) }),
      );
      (result.bonusCorrectVoters ?? []).forEach((empId) =>
        recipientKeys.push({ empId, key: buildMissionRewardKey(revealedAt, empId, '_bonus') }),
      );
    } else {
      const { villainWon, helperWon, villainId, helperId, correctVoters } =
        data.result as MissionResult;
      (correctVoters ?? []).forEach((empId) =>
        recipientKeys.push({ empId, key: buildMissionRewardKey(revealedAt, empId) }),
      );
      if (villainWon && villainId) {
        recipientKeys.push({ empId: villainId, key: buildMissionRewardKey(revealedAt, villainId) });
        if (helperWon && helperId) {
          recipientKeys.push({ empId: helperId, key: buildMissionRewardKey(revealedAt, helperId) });
        }
      }
    }

    const [rewardSnaps, currentPinSnaps] = await Promise.all([
      Promise.all(
        recipientKeys.map(({ empId, key }) =>
          get(ref(db, `users/${empId}/rewards/${ym}/mission/${key}`)),
        ),
      ),
      Promise.all(recipientKeys.map(({ empId }) => get(ref(db, `users/${empId}/pin`)))),
    ]);

    const pinDeltas: Record<string, number> = {};
    const currentPinByEmpId: Record<string, number> = {};

    recipientKeys.forEach(({ empId, key }, i) => {
      const snap = rewardSnaps[i];
      if (!snap.exists()) return;
      const pin = (snap.val() as { pin?: number })?.pin ?? 0;
      updates[`users/${empId}/rewards/${ym}/mission/${key}`] = null;
      if (pin <= 0) return;

      pinDeltas[empId] = (pinDeltas[empId] ?? 0) + pin;
      if (!(empId in currentPinByEmpId)) {
        const currentPinVal = currentPinSnaps[i].val();
        currentPinByEmpId[empId] = typeof currentPinVal === 'number' ? currentPinVal : 0;
      }
    });

    Object.entries(pinDeltas).forEach(([empId, totalPin]) => {
      const currentPin = currentPinByEmpId[empId] ?? 0;
      updates[`users/${empId}/pin`] = Math.max(0, currentPin - totalPin);
    });
  }

  await update(ref(db), updates);
}

function buildMissionRewardKey(
  timestamp: number,
  empId: string,
  keySuffix = '',
): string {
  return `${timestamp}_${empId}${keySuffix}`;
}

export function buildMissionPinReward(
  empId: string,
  ym: string,
  pin: number,
  detail: string | undefined,
  now: number,
  createdAt: string,
  keySuffix = '',
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    [`users/${empId}/pin`]: increment(pin),
    [`users/${empId}/rewards/${ym}/mission/${buildMissionRewardKey(now, empId, keySuffix)}`]: {
      type: 'mission',
      direction: 'gain',
      pin,
      ym,
      createdAt,
      createdAtMs: now,
      detail,
      ...extra,
    },
  };
}

export async function claimMissionReveal(ym: string, type: MissionType): Promise<string | null> {
  const statusRef = ref(db, `missions/${ym}/${type}/config/status`);
  let previousStatus: string | null = null;
  const tx = await runTransaction(statusRef, (cur) => {
    if (cur === 'revealed') return undefined;
    previousStatus = cur;
    return 'revealed';
  });
  if (!tx.committed) {
    throw new Error('이미 다른 곳에서 결과 공개가 진행 중이거나 완료되었습니다. 새로고침 후 확인해주세요.');
  }
  return previousStatus;
}

export async function commitMissionReveal(
  ym: string,
  type: MissionType,
  previousStatus: string | null,
  allWrites: Record<string, unknown>,
): Promise<void> {
  try {
    await update(ref(db), allWrites);
  } catch (err) {
    await set(ref(db, `missions/${ym}/${type}/config/status`), previousStatus ?? 'voting').catch(() => {});
    throw err;
  }
}

export async function revealMissionResult(
  ym: string,
  data: VillainMissionData,
): Promise<{ villainWon: boolean; helperWon: boolean; correctVoters: string[] }> {
  if (data.result?.revealed === true) {
    await migrateLegacyIfNeeded(ym);
    await set(ref(db, `missions/${ym}/villain/config/status`), 'revealed');
    return {
      villainWon: data.result.villainWon,
      helperWon: data.result.helperWon,
      correctVoters: data.result.correctVoters ?? [],
    };
  }

  const { config, roles, votes } = data;
  if (!config || !roles) throw new Error('미션 데이터가 없습니다.');

  await migrateLegacyIfNeeded(ym);
  const previousStatus = await claimMissionReveal(ym, 'villain');

  const villainId = roles.villain;
  const helperId = roles.helper;
  const rewardPin = config.rewardPin ?? 1;
  const villainRewardPin = config.villainRewardPin ?? rewardPin;
  const helperThreshold = config.helperVoteThreshold ?? DEFAULT_HELPER_VOTE_THRESHOLD;
  const villainCatchThreshold = config.villainCatchThreshold ?? DEFAULT_VILLAIN_CATCH_THRESHOLD;

  const voteMap: Record<string, number> = {};
  const correctVoters: string[] = [];

  if (votes) {
    for (const [voterEmpId, targetEmpId] of Object.entries(votes)) {
      voteMap[targetEmpId] = (voteMap[targetEmpId] ?? 0) + 1;
      if (targetEmpId === villainId && voterEmpId !== villainId && voterEmpId !== helperId) {
        correctVoters.push(voterEmpId);
      }
    }
  }

  const villainVotes = voteMap[villainId] ?? 0;
  const helperVotes = voteMap[helperId] ?? 0;
  const villainWon = villainVotes < villainCatchThreshold;
  const helperWon = villainWon && helperVotes >= helperThreshold;

  const recipientDetails: Record<string, string> = {};
  if (!villainWon && correctVoters.length > 0) {
    correctVoters.forEach((id) => { recipientDetails[id] = '빌런 찾기 성공 🎯'; });
  }
  if (villainWon) {
    recipientDetails[villainId] = '빌런 미션 성공 🎭';
    if (helperWon) recipientDetails[helperId] = '조력자 미션 성공 🎉';
  }

  const recipients = Object.keys(recipientDetails);
  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const now = getServerNow().getTime();
  const createdAt = getServerTimestamp();
  const allWrites: Record<string, unknown> = {
    [`missions/${ym}/villain/result`]: {
      revealed: true,
      revealedAt: now,
      villainWon,
      helperWon,
      villainId,
      helperId,
      correctVoters,
    },
    [`missions/${ym}/villain/config/status`]: 'revealed',
  };

  recipients.forEach((empId) => {
    const isVillainSide = empId === villainId || empId === helperId;
    const pinAmount = isVillainSide ? villainRewardPin : rewardPin;
    Object.assign(
      allWrites,
      buildMissionPinReward(empId, ym, pinAmount, recipientDetails[empId], now, createdAt),
    );
  });

  await commitMissionReveal(ym, 'villain', previousStatus, allWrites);

  return { villainWon, helperWon, correctVoters };
}
