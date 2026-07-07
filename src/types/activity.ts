export type MatchTeams = {
  my: string[];
  opponent: string[];
};

export type LeaguePlayer = {
  empId: string;
  name: string;
  scores: [number, number];
};

export type ActivityItem =
  | {
      id: string;
      type: 'match';
      date: number;
      title: string;
      delta: number;
      teams: MatchTeams;
      scores?: { my: number; opponent: number };
    }
  | {
      id: string;
      type: 'reward';
      date: number;
      title: string;
      description: string;
      delta: number;
      category?: 'activity' | 'achievement' | 'target' | 'match' | 'referral' | 'gallery' | 'mission';
      targetMeta?: { myScore: number; target: number; special: boolean };
      missionMeta?: { predictedScore: number; actualScore: number };
    }
  | {
      id: string;
      type: 'activity';
      date: number;
      title: string;
      description: string;
      stats?: {
        photos: number;
        likes: number;
        comments: number;
        achievements: number;
      };
    }
  | {
      id: string;
      type: 'league';
      date: number;
      title: string;
      group: string;
      result: 'win' | 'lose' | 'draw';
      myTeamNum: 'team1' | 'team2';
      myTeam: LeaguePlayer[];
      myTotalScore: number;
      opponentTeam: LeaguePlayer[];
      opponentTotalScore: number;
    }
  | {
      id: string;
      type: 'draw';
      date: number;
      title: string;
      description: string;
      productName: string;
      won: boolean;
      requiredPins: number;
    };
