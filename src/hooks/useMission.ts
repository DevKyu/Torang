import { useEffect, useState } from 'react';
import {
  ref,
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

export type MissionType = 'villain' | 'scoreGuess';
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

type ScoreGuessTargets = {
  empIds: string[];
  confirmedAt: number;
};

export type ScoreGuessVote = {
  targetEmpId: string;
  predictedScore: number;
  message?: string;
  anonymous?: boolean;
};

type MissionResult = {
  revealed: boolean;
  revealedAt: number;
  villainWon: boolean;
  helperWon: boolean;
  correctVoters: string[];
};

type ScoreGuessMissionResult = {
  revealed: boolean;
  revealedAt: number;
  actualScores: Record<string, number>;
  correctVoters: string[];
  topTargets: string[];
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
};

export type MissionData = VillainMissionData | ScoreGuessMissionData;

export const isScoreGuessMission = (
  data: MissionData | null,
): data is ScoreGuessMissionData => data?.config?.type === 'scoreGuess';

export const useMission = (ym: string) => {
  const [data, setData] = useState<MissionData | null>(null);
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
    const r = ref(db, `missions/${ym}`);
    const unsub = onValue(r, (snap) => {
      setData(snap.exists() ? (snap.val() as MissionData) : null);
      setDataReady(true);
    });
    return unsub;
  }, [ym]);

  const myVote = myEmpId && data?.votes ? data.votes[myEmpId] : undefined;

  return { data, myEmpId, myVote, loading: !authReady || !dataReady };
};

export async function saveVillainMissionContent(
  ym: string,
  config: Omit<VillainMissionConfig, 'status'>,
  hidden: VillainMissionHidden,
  currentStatus: MissionStatus | null = null,
): Promise<void> {
  await update(ref(db, `missions/${ym}`), {
    config: { ...config, status: currentStatus ?? 'draft' },
    hidden,
  });
}

export async function saveScoreGuessMissionContent(
  ym: string,
  config: Omit<ScoreGuessMissionConfig, 'status'>,
  currentStatus: MissionStatus | null = null,
): Promise<void> {
  await update(ref(db, `missions/${ym}`), {
    config: { ...config, status: currentStatus ?? 'draft' },
  });
}

export async function assignRoles(
  ym: string,
  villainId: string,
  helperId: string,
): Promise<void> {
  await set(ref(db, `missions/${ym}/roles`), {
    villain: villainId,
    helper: helperId,
    assignedAt: useUiStore.getState().getServerNow().getTime(),
  });
}

export async function setMissionStatus(
  ym: string,
  status: MissionStatus,
): Promise<void> {
  await set(ref(db, `missions/${ym}/config/status`), status);
}

export async function submitVote(
  ym: string,
  voterEmpId: string,
  targetEmpId: string,
): Promise<void> {
  await set(ref(db, `missions/${ym}/votes/${voterEmpId}`), targetEmpId);
}

export async function resetVotes(ym: string): Promise<void> {
  await remove(ref(db, `missions/${ym}/votes`));
}

export async function resetMissionState(ym: string): Promise<void> {
  await Promise.all([
    remove(ref(db, `missions/${ym}/votes`)),
    remove(ref(db, `missions/${ym}/result`)),
    set(ref(db, `missions/${ym}/config/status`), 'active'),
  ]);
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
    [`users/${empId}/rewards/${ym}/mission/${now}_${empId}${keySuffix}`]: {
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

export async function claimMissionReveal(ym: string): Promise<void> {
  const statusRef = ref(db, `missions/${ym}/config/status`);
  const tx = await runTransaction(statusRef, (cur) =>
    cur === 'revealed' ? undefined : 'revealed',
  );
  if (!tx.committed) {
    throw new Error(
      '이미 다른 곳에서 결과 공개가 진행 중이거나 완료되었습니다. 새로고침 후 확인해주세요.',
    );
  }
}

export async function revealMissionResult(
  ym: string,
  data: VillainMissionData,
): Promise<{ villainWon: boolean; helperWon: boolean; correctVoters: string[] }> {
  if (data.result?.revealed === true) {
    await set(ref(db, `missions/${ym}/config/status`), 'revealed');
    return {
      villainWon: data.result.villainWon,
      helperWon: data.result.helperWon,
      correctVoters: data.result.correctVoters ?? [],
    };
  }

  const { config, roles, votes } = data;
  if (!config || !roles) throw new Error('미션 데이터가 없습니다.');

  await claimMissionReveal(ym);

  const villainId = roles.villain;
  const helperId = roles.helper;
  const rewardPin = config.rewardPin ?? 1;
  const villainRewardPin = config.villainRewardPin ?? rewardPin;
  const helperThreshold = config.helperVoteThreshold ?? 3;
  const villainCatchThreshold = config.villainCatchThreshold ?? 1;

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
    [`missions/${ym}/result`]: {
      revealed: true,
      revealedAt: now,
      villainWon,
      helperWon,
      correctVoters,
    },
    [`missions/${ym}/config/status`]: 'revealed',
  };

  recipients.forEach((empId) => {
    const isVillainSide = empId === villainId || empId === helperId;
    const pinAmount = isVillainSide ? villainRewardPin : rewardPin;
    Object.assign(
      allWrites,
      buildMissionPinReward(empId, ym, pinAmount, recipientDetails[empId], now, createdAt),
    );
  });

  await update(ref(db), allWrites);

  return { villainWon, helperWon, correctVoters };
}
