export type Month = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;
export type Year = `${number}`;

export type UserScores = {
  [year in Year]?: {
    [month in Month]?: number;
  };
};

export type UserTargets = {
  [year in Year]?: { [month in Month]?: number };
};

export type UserInfo = {
  name: string;
  pin: number;
  type: 'Member' | 'Associate';
  scores?: UserScores;
  targets?: UserTargets;
};
