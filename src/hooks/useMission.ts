import { useEffect, useState } from 'react';
import { ref, set, remove, onValue, update, increment } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, empIdFromEmail } from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';

export type MissionStatus = 'draft' | 'active' | 'voting' | 'revealed';

export type MissionConfig = {
  title: string;
  description: string;
  revealDays: number;
  rewardPin: number;
  villainRewardPin: number;
  helperVoteThreshold: number;
  villainCatchThreshold: number;
  status: MissionStatus;
};

export type HiddenContent = {
  title: string;
  description: string;
  revealTitle?: string;
};

export type MissionHidden = {
  villain: HiddenContent;
  helper: HiddenContent;
};

export type MissionRoles = {
  villain: string;
  helper: string;
  assignedAt: number;
};

export type MissionResult = {
  revealed: boolean;
  revealedAt: number;
  villainWon: boolean;
  helperWon: boolean;
  correctVoters: string[];
};

export type MissionData = {
  config?: MissionConfig;
  hidden?: MissionHidden;
  roles?: MissionRoles;
  votes?: Record<string, string>;
  result?: MissionResult;
};

export const useMission = (ym: string) => {
  const [data, setData] = useState<MissionData | null>(null);
  const [myEmpId, setMyEmpId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!cancelled) setMyEmpId(empIdFromEmail(user?.email));
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
      setLoading(false);
    });
    return unsub;
  }, [ym]);

  const myVote = myEmpId && data?.votes ? data.votes[myEmpId] : undefined;

  return { data, myEmpId, myVote, loading };
};

export async function saveMissionContent(
  ym: string,
  config: Omit<MissionConfig, 'status'>,
  hidden: MissionHidden,
  currentStatus: MissionStatus | null = null,
): Promise<void> {
  await update(ref(db, `missions/${ym}`), {
    config: { ...config, status: currentStatus ?? 'draft' },
    hidden,
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

export async function revealMissionResult(
  ym: string,
  data: MissionData,
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
    allWrites[`users/${empId}/pin`] = increment(pinAmount);
    allWrites[`users/${empId}/rewards/${ym}/mission/${now}_${empId}`] = {
      type: 'mission',
      direction: 'gain',
      pin: pinAmount,
      ym,
      createdAt,
      createdAtMs: now,
      detail: recipientDetails[empId],
    };
  });

  await update(ref(db), allWrites);

  return { villainWon, helperWon, correctVoters };
}
