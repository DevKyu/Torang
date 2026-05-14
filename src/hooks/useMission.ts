import { useEffect, useState } from 'react';
import { ref, set, get, remove, onValue, update } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, empIdFromEmail } from '../services/firebase';
import { getReadableTimestamp } from '../utils/date';

export type MissionStatus = 'draft' | 'active' | 'voting' | 'revealed';

export type MissionConfig = {
  title: string;
  description: string;
  revealDays: number;
  rewardPin: number;
  helperVoteThreshold: number;
  status: MissionStatus;
};

export type HiddenContent = {
  title: string;
  description: string;
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

export const useMission = (yyyymm: string) => {
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
    const r = ref(db, `missions/${yyyymm}`);
    const unsub = onValue(r, (snap) => {
      setData(snap.exists() ? (snap.val() as MissionData) : null);
      setLoading(false);
    });
    return unsub;
  }, [yyyymm]);

  const myVote = myEmpId && data?.votes ? data.votes[myEmpId] : undefined;

  return { data, myEmpId, myVote, loading };
};

export async function saveMissionContent(
  yyyymm: string,
  config: Omit<MissionConfig, 'status'>,
  hidden: MissionHidden,
): Promise<void> {
  const existing = (await get(ref(db, `missions/${yyyymm}/config/status`))).val() as MissionStatus | null;
  await update(ref(db, `missions/${yyyymm}`), {
    config: { ...config, status: existing ?? 'draft' },
    hidden,
  });
}

export async function assignRoles(
  yyyymm: string,
  villainId: string,
  helperId: string,
): Promise<void> {
  await set(ref(db, `missions/${yyyymm}/roles`), {
    villain: villainId,
    helper: helperId,
    assignedAt: Date.now(),
  });
}

export async function setMissionStatus(
  yyyymm: string,
  status: MissionStatus,
): Promise<void> {
  await set(ref(db, `missions/${yyyymm}/config/status`), status);
}

export async function submitVote(
  yyyymm: string,
  voterEmpId: string,
  targetEmpId: string,
): Promise<void> {
  await set(ref(db, `missions/${yyyymm}/votes/${voterEmpId}`), targetEmpId);
}

export async function resetVotes(yyyymm: string): Promise<void> {
  await remove(ref(db, `missions/${yyyymm}/votes`));
}

export async function revealMissionResult(
  yyyymm: string,
  data: MissionData,
): Promise<{ villainWon: boolean; helperWon: boolean; correctVoters: string[] }> {
  const { config, roles, votes } = data;
  if (!config || !roles) throw new Error('미션 데이터가 없습니다.');

  const villainId = roles.villain;
  const helperId = roles.helper;
  const rewardPin = config.rewardPin ?? 1;
  const helperThreshold = config.helperVoteThreshold ?? 3;

  const voteMap: Record<string, number> = {};
  const correctVoters: string[] = [];

  if (votes) {
    for (const [voterEmpId, targetEmpId] of Object.entries(votes)) {
      voteMap[targetEmpId] = (voteMap[targetEmpId] ?? 0) + 1;
      if (targetEmpId === villainId) correctVoters.push(voterEmpId);
    }
  }

  const villainVotes = voteMap[villainId] ?? 0;
  const helperVotes = voteMap[helperId] ?? 0;
  const villainWon = villainVotes === 0;
  const helperWon = villainWon && helperVotes >= helperThreshold;

  const recipientDetails: Record<string, string> = {};
  if (!villainWon && correctVoters.length > 0) {
    correctVoters.forEach((id) => { recipientDetails[id] = '빌런 적중 🎯'; });
  }
  if (villainWon) {
    recipientDetails[villainId] = '또랑 빌런 생존 🎭';
    if (helperWon) recipientDetails[helperId] = '빌런 조력자 공동 수상 🎉';
  }

  const recipients = Object.keys(recipientDetails);
  const now = Date.now();
  const createdAt = getReadableTimestamp(new Date(now));
  const allWrites: Record<string, unknown> = {
    [`missions/${yyyymm}/result`]: {
      revealed: true,
      revealedAt: now,
      villainWon,
      helperWon,
      correctVoters,
    },
    [`missions/${yyyymm}/config/status`]: 'revealed',
  };

  await Promise.all(
    recipients.map(async (empId) => {
      const pinSnap = await get(ref(db, `users/${empId}/pin`));
      const currentPin = (pinSnap.val() as number) ?? 0;
      allWrites[`users/${empId}/pin`] = currentPin + rewardPin;
      allWrites[`users/${empId}/rewards/${yyyymm}/mission/${now}_${empId}`] = {
        type: 'mission',
        direction: 'gain',
        pin: rewardPin,
        ym: yyyymm,
        createdAt,
        createdAtMs: now,
        detail: recipientDetails[empId],
      };
    }),
  );

  await update(ref(db), allWrites);

  return { villainWon, helperWon, correctVoters };
}
