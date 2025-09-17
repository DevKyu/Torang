export const EVENT_MATCH_PICKED = 'match-picked' as const;

export type MatchPickedDetail = {
  targetId: string;
  targetName: string;
};
