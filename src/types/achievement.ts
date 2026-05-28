export type AchievementCategory =
  | 'participation'
  | 'activity'
  | 'score'
  | 'mission';

export type AchievementId =
  | 'participation_first'
  | 'participation_count_10'
  | 'participation_streak_3'
  | 'participation_streak_6'
  | 'participation_streak_12'
  | 'participation_streak_24'
  | 'participation_afterparty_3'
  | 'participation_afterparty_6'
  | 'active_3m'
  | 'active_6m'
  | 'active_1y'
  | 'active_2y'
  | 'active_3y'
  | 'active_invite_2'
  | 'active_gallery_upload'
  | 'active_gallery_comment'
  | 'score_100'
  | 'score_150'
  | 'score_180'
  | 'score_200'
  | 'score_220'
  | 'score_personal_best'
  | 'score_consistent_150'
  | 'score_consistent_150_6'
  | 'mission_rival_participate'
  | 'mission_rival_win1'
  | 'mission_pin_participate'
  | 'mission_pin_win1'
  | 'mission_rival_streak3'
  | 'mission_rival_revenge'
  | 'mission_villain_success'
  | 'mission_villain_found';

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
        id: 'participation_count_10',
        category: 'participation',
        label: '볼링 매니아',
        desc: '정기전 10회 참여',
        icon: '🤩',
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
        icon: '😵',
      },
      {
        id: 'participation_streak_24',
        category: 'participation',
        label: '개근왕',
        desc: '2년간 매달 출석',
        icon: '🏆',
      },
      {
        id: 'participation_afterparty_3',
        category: 'participation',
        label: '뒤풀이 러버',
        desc: '3개월 연속 참여중',
        icon: '🍻',
      },
      {
        id: 'participation_afterparty_6',
        category: 'participation',
        label: '뒤풀이 단골',
        desc: '6개월 연속 참여중',
        icon: '🥂',
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
      {
        id: 'active_3y',
        category: 'activity',
        label: '고인물',
        desc: '3년 이상 활동중',
        icon: '🧙‍♂️',
      },
      {
        id: 'active_invite_2',
        category: 'activity',
        label: '모집왕',
        desc: '신규회원 2명 초대',
        icon: '📣',
      },
      {
        id: 'active_gallery_upload',
        category: 'activity',
        label: '또랑 사진작가',
        desc: '사진 업로드 10회',
        icon: '📸',
      },
      {
        id: 'active_gallery_comment',
        category: 'activity',
        label: '리액션 부자',
        desc: '사진 댓글 30회 작성',
        icon: '💬',
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
      {
        id: 'score_220',
        category: 'score',
        label: '볼링 달인',
        desc: '220점 달성 성공',
        icon: '⭐',
      },
      {
        id: 'score_personal_best',
        category: 'score',
        label: '신기록',
        desc: '개인 최고 점수 갱신',
        icon: '🏁',
      },
      {
        id: 'score_consistent_150',
        category: 'score',
        label: '꾸준한 실력자',
        desc: '3개월간 150점 이상',
        icon: '🌱',
      },
      {
        id: 'score_consistent_150_6',
        category: 'score',
        label: '진정한 실력자',
        desc: '6개월간 150점 이상',
        icon: '🌳',
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
        icon: '💰',
      },
      {
        id: 'mission_rival_streak3',
        category: 'mission',
        label: '불패신화',
        desc: '라이벌전 3연승 달성',
        icon: '⚡',
      },
      {
        id: 'mission_rival_revenge',
        category: 'mission',
        label: '리벤지 매치',
        desc: '지난 패배 복수 성공',
        icon: '💥',
      },
      {
        id: 'mission_villain_success',
        category: 'mission',
        label: '또랑 빌런',
        desc: '빌런 미션 성공',
        icon: '😈',
      },
      {
        id: 'mission_villain_found',
        category: 'mission',
        label: '또랑 탐정',
        desc: '빌런 찾기 성공',
        icon: '🧐',
      },
    ],
  },
];

export type AchievementResult = Record<string, { achievedAt: string }>;
