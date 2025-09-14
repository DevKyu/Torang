export type AchievementCategory =
  | 'participation'
  | 'activity'
  | 'score'
  | 'mission';

export type AchievementId =
  | 'participation_first'
  | 'participation_streak_3'
  | 'participation_streak_6'
  | 'participation_streak_12'
  | 'active_3m'
  | 'active_6m'
  | 'active_1y'
  | 'active_2y'
  | 'score_100'
  | 'score_150'
  | 'score_180'
  | 'score_200'
  | 'mission_rival_participate'
  | 'mission_rival_win1'
  | 'mission_pin_participate'
  | 'mission_pin_win1';

export type Achievement = {
  id: AchievementId;
  category: AchievementCategory;
  label: string;
  desc: string;
  icon: string;
};

export type AchievementGroup = {
  category: AchievementCategory;
  title: string;
  items: Achievement[];
};

export const achievementGroups: AchievementGroup[] = [
  {
    category: 'participation',
    title: '참여',
    items: [
      {
        id: 'participation_first',
        category: 'participation',
        label: '볼린이',
        desc: '또랑 활동 첫 참여',
        icon: '🐣',
      },
      {
        id: 'participation_streak_3',
        category: 'participation',
        label: '열정 볼러',
        desc: '3개월 연속 참여중',
        icon: '🔥',
      },
      {
        id: 'participation_streak_6',
        category: 'participation',
        label: '프로 참석러',
        desc: '6개월 개근중',
        icon: '💪',
      },
      {
        id: 'participation_streak_12',
        category: 'participation',
        label: '볼링 중독',
        desc: '1년간 매달 출석',
        icon: '🏆',
      },
    ],
  },
  {
    category: 'activity',
    title: '활동',
    items: [
      {
        id: 'active_3m',
        category: 'activity',
        label: '볼링 입문',
        desc: '첫 분기 활동 완료',
        icon: '🎳',
      },
      {
        id: 'active_6m',
        category: 'activity',
        label: '또랑 멤버',
        desc: '2분기 연속 가입중',
        icon: '🤝',
      },
      {
        id: 'active_1y',
        category: 'activity',
        label: '베테랑',
        desc: '1년간 꾸준한 활동',
        icon: '🌟',
      },
      {
        id: 'active_2y',
        category: 'activity',
        label: '레전드',
        desc: '2년 이상 활동중',
        icon: '👑',
      },
    ],
  },
  {
    category: 'score',
    title: '점수',
    items: [
      {
        id: 'score_100',
        category: 'score',
        label: '초급 볼러',
        desc: '100점 돌파 성공',
        icon: '💯',
      },
      {
        id: 'score_150',
        category: 'score',
        label: '중급 볼러',
        desc: '150점 달성 성공',
        icon: '🎯',
      },
      {
        id: 'score_180',
        category: 'score',
        label: '또랑 랭커',
        desc: '180점 달성 성공',
        icon: '🥇',
      },
      {
        id: 'score_200',
        category: 'score',
        label: '프로 준비',
        desc: '200점 돌파 성공',
        icon: '🚀',
      },
    ],
  },
  {
    category: 'mission',
    title: '미션',
    items: [
      {
        id: 'mission_rival_participate',
        category: 'mission',
        label: '도전장',
        desc: '라이벌 매치 참여',
        icon: '⚔️',
      },
      {
        id: 'mission_rival_win1',
        category: 'mission',
        label: '승부사',
        desc: '라이벌 매치 승리',
        icon: '🏅',
      },
      {
        id: 'mission_pin_participate',
        category: 'mission',
        label: '도파민 중독',
        desc: '핀 쟁탈전 참여',
        icon: '🎲',
      },
      {
        id: 'mission_pin_win1',
        category: 'mission',
        label: '핀 털이범',
        desc: '핀 쟁탈전 승리',
        icon: '😎',
      },
    ],
  },
];

export type AchievementResult = Record<string, { achievedAt: string }>;
