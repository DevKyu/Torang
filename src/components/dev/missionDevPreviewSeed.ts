import { ref, set, remove, get, update } from 'firebase/database';
import { db } from '../../services/firebase';
import {
  saveVillainMissionContent,
  saveScoreGuessMissionContent,
  assignRoles,
  setMissionStatus,
  submitVote,
  revealMissionResult,
  type VillainMissionConfig,
  type VillainMissionHidden,
  type VillainMissionData,
  type ScoreGuessMissionConfig,
  type ScoreGuessMissionData,
} from '../../hooks/useMission';
import {
  confirmScoreGuessTargets,
  submitScoreGuessVote,
  revealScoreGuessMissionResult,
} from '../../services/scoreGuessMission';
import {
  saveTeamGuessMissionContent,
  submitTeamGuessVote,
  revealTeamGuessMissionResult,
} from '../../services/teamGuessMission';
import type { TeamGuessMissionConfig, TeamGuessMissionData } from '../../hooks/useMission';
import { formationGroupsToFirebase, type FormationGroup } from '../../utils/teamFormation';

export const DEV_PREVIEW_YM = '209912';
export const DEV_YEAR = '2099';
export const DEV_MONTH = '12';
export const DEV_ME = 'devpreview_me';

export const MOCK_NAMES: Record<string, string> = {
  devpreview_me: '나(프리뷰)',
  devpreview_p1: '김도윤',
  devpreview_p2: '정하은',
  devpreview_p3: '강민재',
  devpreview_p4: '한지민',
  devpreview_p5: '오세훈',
  devpreview_p6: '노은채',
  devpreview_p7: '박서준',
  devpreview_p8: '윤소율',
  devpreview_p9: '배승우',
  devpreview_p10: '최유나',
  devpreview_p11: '이택수',
  devpreview_p12: '강도현',
  devpreview_p13: '서지우',
  devpreview_p14: '한소희',
  devpreview_p15: '이준호',
  devpreview_p16: '김태윤',
  devpreview_p17: '박지훈',
  devpreview_p18: '최서연',
  devpreview_p19: '정민수',
  devpreview_p20: '윤아름',
  devpreview_p21: '조현우',
  devpreview_p22: '임수빈',
  devpreview_p23: '황지안',
  devpreview_p24: '문가을',
  devpreview_p25: '신동엽',
  devpreview_p26: '유채원',
  devpreview_p27: '고은성',
  devpreview_p28: '장하율',
  devpreview_p29: '백나윤',
};

export const DEV_PARTICIPANTS = Object.keys(MOCK_NAMES);

function relativeYmd(offsetDays: number): number {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`,
  );
}

async function clearMission() {
  await remove(ref(db, `missions/${DEV_PREVIEW_YM}`));
}

async function clearTeamFormation() {
  await remove(ref(db, `teamFormation/${DEV_PREVIEW_YM}`));
  await remove(ref(db, `team/${DEV_PREVIEW_YM}`));
}

async function clearMatchSignups() {
  await remove(ref(db, `match/${DEV_PREVIEW_YM}`));
}

async function seedActivityMeta(activityYmd: number) {
  await set(ref(db, `activityDate/${DEV_YEAR}/${DEV_MONTH}`), activityYmd);
  await set(
    ref(db, `activityParticipants/${DEV_YEAR}/${DEV_MONTH}`),
    Object.fromEntries(DEV_PARTICIPANTS.map((id) => [id, true])),
  );
}

export async function resetDevPreviewData(): Promise<void> {
  const updates: Record<string, null> = {
    [`missions/${DEV_PREVIEW_YM}`]: null,
    [`teamFormation/${DEV_PREVIEW_YM}`]: null,
    [`team/${DEV_PREVIEW_YM}`]: null,
    [`match/${DEV_PREVIEW_YM}`]: null,
    [`activityDate/${DEV_YEAR}/${DEV_MONTH}`]: null,
    [`activityParticipants/${DEV_YEAR}/${DEV_MONTH}`]: null,
  };
  DEV_PARTICIPANTS.forEach((empId) => {
    updates[`users/${empId}`] = null;
  });
  await update(ref(db), updates);
}

/* -------------------------------------------------------------------------- */
/* 빌런 찾기                                                                    */
/* -------------------------------------------------------------------------- */

export type VillainScenario =
  | 'empty'
  | 'upcoming'
  | 'preview'
  | 'votingOpen'
  | 'revealed_caught'
  | 'revealed_survived_solo'
  | 'revealed_survived_withHelper';

export async function seedVillainScenario(scenario: VillainScenario): Promise<void> {
  await clearMission();
  if (scenario === 'empty') {
    await seedActivityMeta(relativeYmd(10));
    return;
  }

  await seedActivityMeta(
    scenario === 'upcoming' ? relativeYmd(10) : scenario.startsWith('revealed') ? relativeYmd(-1) : relativeYmd(2),
  );

  const config: Omit<VillainMissionConfig, 'status'> = {
    type: 'villain',
    title: '[프리뷰] 이달의 빌런을 찾아라',
    description: '누군가 수상한 행동을 하고 있습니다... 스트라이크마다 이상하게 행동하는 사람을 지목해주세요!',
    revealDays: 5,
    rewardPin: 1,
    villainRewardPin: 1,
    helperVoteThreshold: 2,
    villainCatchThreshold: 1,
  };
  const hidden: VillainMissionHidden = {
    villain: { title: '또랑 빌런', description: '스트라이크마다 엄지 척 하기', revealTitle: '🎭 빌런에게 주어진 미션' },
    helper: { title: '조력자', description: '빌런이 지목당하지 않도록 다른 사람 지목 유도하기' },
  };
  await saveVillainMissionContent(DEV_PREVIEW_YM, config, hidden, 'active');
  if (scenario === 'upcoming') return;

  await assignRoles(DEV_PREVIEW_YM, 'devpreview_p1', 'devpreview_p2');
  if (scenario === 'preview') return;

  if (scenario === 'votingOpen') {
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p3', 'devpreview_p4');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p6', 'devpreview_p7');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p8', 'devpreview_p9');
    await setMissionStatus(DEV_PREVIEW_YM, 'voting');
    return;
  }

  if (scenario === 'revealed_caught') {
    await submitVote(DEV_PREVIEW_YM, DEV_ME, 'devpreview_p1');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p3', 'devpreview_p1');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p4', 'devpreview_p1');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p6', 'devpreview_p1');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p7', 'devpreview_p8');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p9', 'devpreview_p10');
  } else if (scenario === 'revealed_survived_solo') {
    await submitVote(DEV_PREVIEW_YM, DEV_ME, 'devpreview_p3');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p4', 'devpreview_p6');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p6', 'devpreview_p8');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p7', 'devpreview_p9');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p2', 'devpreview_p3');
  } else {
    await submitVote(DEV_PREVIEW_YM, DEV_ME, 'devpreview_p2');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p4', 'devpreview_p2');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p6', 'devpreview_p3');
    await submitVote(DEV_PREVIEW_YM, 'devpreview_p7', 'devpreview_p9');
  }
  await setMissionStatus(DEV_PREVIEW_YM, 'voting');
  const snap = await get(ref(db, `missions/${DEV_PREVIEW_YM}`));
  await revealMissionResult(DEV_PREVIEW_YM, snap.val() as VillainMissionData);
}

/* -------------------------------------------------------------------------- */
/* 신규회원 점수 맞추기                                                          */
/* -------------------------------------------------------------------------- */

export type ScoreGuessScenario =
  | 'empty'
  | 'upcoming'
  | 'notVotedOpen'
  | 'asCandidate'
  | 'asCandidateWithCheers'
  | 'votedOpen'
  | 'revealed';

const SG_TARGETS = ['devpreview_p1', 'devpreview_p8', 'devpreview_p9'];
const SG_TARGETS_WITH_ME = [DEV_ME, 'devpreview_p1', 'devpreview_p8'];

export async function seedScoreGuessScenario(scenario: ScoreGuessScenario): Promise<void> {
  await clearMission();
  if (scenario === 'empty') {
    await seedActivityMeta(relativeYmd(10));
    return;
  }

  await seedActivityMeta(
    scenario === 'upcoming' ? relativeYmd(10) : scenario === 'revealed' ? relativeYmd(-1) : relativeYmd(2),
  );

  const config: Omit<ScoreGuessMissionConfig, 'status'> = {
    type: 'scoreGuess',
    title: '[프리뷰] 신규회원과 함께하는 이번 달',
    description: '이번 달 신규회원의 점수를 예측해보세요! 오차범위 안이면 PIN을 드려요.',
    revealDays: 5,
    rewardPin: 0.5,
    scoreDiffThreshold: 5,
    targetRewardPin: 0.5,
  };
  await saveScoreGuessMissionContent(DEV_PREVIEW_YM, config, 'active');
  if (scenario === 'upcoming') return;

  const isMeCandidate = scenario === 'asCandidate' || scenario === 'asCandidateWithCheers';
  const targets = isMeCandidate ? SG_TARGETS_WITH_ME : SG_TARGETS;
  await confirmScoreGuessTargets(DEV_PREVIEW_YM, targets);
  if (scenario === 'notVotedOpen' || scenario === 'asCandidate') return;

  if (scenario === 'asCandidateWithCheers') {
    await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p2', DEV_ME, 140, '화이팅! 첫 활동 응원해요', false);
    await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p3', DEV_ME, 135);
    await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p4', DEV_ME, 150);
    await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p5', DEV_ME, 145);
    await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p6', DEV_ME, 138, '응원합니다! 다음에 같이 쳐요~', true);
    return;
  }

  if (scenario === 'votedOpen') {
    await submitScoreGuessVote(DEV_PREVIEW_YM, DEV_ME, targets[0], 145, '화이팅!', false);
    return;
  }

  await submitScoreGuessVote(DEV_PREVIEW_YM, DEV_ME, targets[0], 145);
  await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p2', targets[0], 130, '기대돼요', true);
  await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p3', targets[1], 120);
  await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p4', targets[2], 110, '화이팅', false);
  await submitScoreGuessVote(DEV_PREVIEW_YM, 'devpreview_p5', targets[2], 95);
  await set(ref(db, `users/${targets[0]}/scores/${DEV_YEAR}/${Number(DEV_MONTH)}`), 148);
  await set(ref(db, `users/${targets[1]}/scores/${DEV_YEAR}/${Number(DEV_MONTH)}`), 125);
  await set(ref(db, `users/${targets[2]}/scores/${DEV_YEAR}/${Number(DEV_MONTH)}`), 98);
  const snap = await get(ref(db, `missions/${DEV_PREVIEW_YM}`));
  await revealScoreGuessMissionResult(DEV_PREVIEW_YM, snap.val() as ScoreGuessMissionData);
}

/* -------------------------------------------------------------------------- */
/* 정기전 팀 승부 예측                                                          */
/* -------------------------------------------------------------------------- */

// 조별로 3vs3(내 조) / 2vs2 / 3vs2 / 4vs3 / 4vs4 등 다양한 인원 구성을 섞어
// 보너스 픽 목록에서 여러 케이스를 확인할 수 있게 한다.
const TEAM_GUESS_GROUPS: FormationGroup[] = [
  {
    team1: [
      { empId: DEV_ME, name: MOCK_NAMES[DEV_ME], average: 84.0 },
      { empId: 'devpreview_p1', name: MOCK_NAMES.devpreview_p1, average: 83.2 },
      { empId: 'devpreview_p2', name: MOCK_NAMES.devpreview_p2, average: 80.9 },
    ],
    team2: [
      { empId: 'devpreview_p3', name: MOCK_NAMES.devpreview_p3, average: 82.5 },
      { empId: 'devpreview_p4', name: MOCK_NAMES.devpreview_p4, average: 79.8 },
      { empId: 'devpreview_p5', name: MOCK_NAMES.devpreview_p5, average: 78.4 },
    ],
  },
  {
    team1: [
      { empId: 'devpreview_p6', name: MOCK_NAMES.devpreview_p6, average: 81.0 },
      { empId: 'devpreview_p7', name: MOCK_NAMES.devpreview_p7, average: 77.6 },
    ],
    team2: [
      { empId: 'devpreview_p8', name: MOCK_NAMES.devpreview_p8, average: 79.1 },
      { empId: 'devpreview_p9', name: MOCK_NAMES.devpreview_p9, average: 76.3 },
    ],
  },
  {
    team1: [
      { empId: 'devpreview_p10', name: MOCK_NAMES.devpreview_p10, average: 88.4 },
      { empId: 'devpreview_p11', name: MOCK_NAMES.devpreview_p11, average: 85.7 },
      { empId: 'devpreview_p12', name: MOCK_NAMES.devpreview_p12, average: 82.3 },
    ],
    team2: [
      { empId: 'devpreview_p13', name: MOCK_NAMES.devpreview_p13, average: 86.9 },
      { empId: 'devpreview_p14', name: MOCK_NAMES.devpreview_p14, average: 84.1 },
    ],
  },
  {
    team1: [
      { empId: 'devpreview_p15', name: MOCK_NAMES.devpreview_p15, average: 75.2 },
      { empId: 'devpreview_p16', name: MOCK_NAMES.devpreview_p16, average: 73.8 },
      { empId: 'devpreview_p17', name: MOCK_NAMES.devpreview_p17, average: 71.5 },
      { empId: 'devpreview_p18', name: MOCK_NAMES.devpreview_p18, average: 70.2 },
    ],
    team2: [
      { empId: 'devpreview_p19', name: MOCK_NAMES.devpreview_p19, average: 74.6 },
      { empId: 'devpreview_p20', name: MOCK_NAMES.devpreview_p20, average: 72.9 },
      { empId: 'devpreview_p21', name: MOCK_NAMES.devpreview_p21, average: 69.7 },
    ],
  },
  {
    team1: [
      { empId: 'devpreview_p22', name: MOCK_NAMES.devpreview_p22, average: 90.1 },
      { empId: 'devpreview_p23', name: MOCK_NAMES.devpreview_p23, average: 87.3 },
      { empId: 'devpreview_p24', name: MOCK_NAMES.devpreview_p24, average: 85.6 },
      { empId: 'devpreview_p25', name: MOCK_NAMES.devpreview_p25, average: 83.0 },
    ],
    team2: [
      { empId: 'devpreview_p26', name: MOCK_NAMES.devpreview_p26, average: 89.5 },
      { empId: 'devpreview_p27', name: MOCK_NAMES.devpreview_p27, average: 86.0 },
      { empId: 'devpreview_p28', name: MOCK_NAMES.devpreview_p28, average: 84.4 },
      { empId: 'devpreview_p29', name: MOCK_NAMES.devpreview_p29, average: 81.8 },
    ],
  },
];

function scoreForAverage(average: number, seed: number): [number, number] {
  const wobble = (n: number) => Math.max(40, Math.round(average + (((seed * 7 + n * 13) % 21) - 10)));
  return [wobble(1), wobble(2)];
}

function buildTeamResultPayload(group: FormationGroup, winner: 'team1' | 'team2' | 'draw', seedBase: number) {
  const toTeamPayload = (players: FormationGroup['team1'], seedOffset: number) =>
    Object.fromEntries(
      players.map((p, i) => {
        const [score1, score2] = scoreForAverage(p.average, seedBase + seedOffset + i);
        return [p.empId, { name: p.name, score1, score2, order: i }];
      }),
    );
  return {
    winner,
    date: Date.now(),
    team1: toTeamPayload(group.team1, 0),
    team2: toTeamPayload(group.team2, 100),
  };
}

async function seedTeamFormationGroups() {
  await set(ref(db, `teamFormation/${DEV_PREVIEW_YM}`), {
    status: 'confirmed',
    limitScore: 10,
    defaultAverage: 80,
    confirmedAt: Date.now(),
    groups: formationGroupsToFirebase(TEAM_GUESS_GROUPS),
  });
}

export type TeamGuessScenario =
  | 'empty'
  | 'upcoming'
  | 'formationPending'
  | 'notVotedOpen'
  | 'votedOpen'
  | 'revealed_bothCorrect'
  | 'revealed_myGroupOnly';

async function seedTeamGuessRivals() {
  const chosenAt = Date.now();
  await Promise.all(
    ['devpreview_p4', 'devpreview_p8'].map((targetEmpId) =>
      set(ref(db, `match/${DEV_PREVIEW_YM}/rival/${DEV_ME}/${targetEmpId}`), {
        chosenAt,
        message: '',
        anonymous: false,
      }),
    ),
  );
}

export async function seedTeamGuessScenario(scenario: TeamGuessScenario): Promise<void> {
  await clearMission();
  await clearTeamFormation();
  await clearMatchSignups();
  if (scenario === 'empty') {
    await seedActivityMeta(relativeYmd(10));
    return;
  }

  await seedActivityMeta(
    scenario === 'upcoming'
      ? relativeYmd(10)
      : scenario.startsWith('revealed')
        ? relativeYmd(-1)
        : relativeYmd(2),
  );

  const config: Omit<TeamGuessMissionConfig, 'status'> = {
    type: 'teamGuess',
    title: '[프리뷰] 정기전 팀 승부 예측',
    description: '우리 조가 이길지 예측해보세요! 다른 조에 보너스로 배팅하면 추가 PIN 기회도 있어요.',
    revealDays: 5,
    rewardPin: 1,
    bonusRewardPin: 1,
  };
  await saveTeamGuessMissionContent(DEV_PREVIEW_YM, config, 'active');
  if (scenario === 'upcoming' || scenario === 'formationPending') return;

  await seedTeamFormationGroups();
  await seedTeamGuessRivals();
  if (scenario === 'notVotedOpen') return;

  if (scenario === 'votedOpen') {
    await submitTeamGuessVote(DEV_PREVIEW_YM, DEV_ME, {
      myGroupPick: 'team1',
      bonusGroupId: 'B',
      bonusGroupPick: 'team1',
    });
    return;
  }

  await submitTeamGuessVote(DEV_PREVIEW_YM, DEV_ME, {
    myGroupPick: 'team1',
    bonusGroupId: 'B',
    bonusGroupPick: scenario === 'revealed_bothCorrect' ? 'team1' : 'team2',
  });
  await submitTeamGuessVote(DEV_PREVIEW_YM, 'devpreview_p3', { myGroupPick: 'team1' });
  await submitTeamGuessVote(DEV_PREVIEW_YM, 'devpreview_p6', {
    myGroupPick: 'team1',
    bonusGroupId: 'C',
    bonusGroupPick: 'team2',
  });
  await submitTeamGuessVote(DEV_PREVIEW_YM, 'devpreview_p10', { myGroupPick: 'team1' });
  await submitTeamGuessVote(DEV_PREVIEW_YM, 'devpreview_p14', { myGroupPick: 'team2' });
  await submitTeamGuessVote(DEV_PREVIEW_YM, 'devpreview_p18', { myGroupPick: 'team1' });
  const winners: Array<'team1' | 'team2' | 'draw'> = ['team1', 'team1', 'team2', 'team1', 'team2'];
  await Promise.all(
    TEAM_GUESS_GROUPS.map((group, idx) =>
      set(
        ref(db, `team/${DEV_PREVIEW_YM}/${String.fromCharCode(65 + idx)}`),
        buildTeamResultPayload(group, winners[idx], idx * 1000),
      ),
    ),
  );
  const snap = await get(ref(db, `missions/${DEV_PREVIEW_YM}`));
  await revealTeamGuessMissionResult(DEV_PREVIEW_YM, snap.val() as TeamGuessMissionData);
}
