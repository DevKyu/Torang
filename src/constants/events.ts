export const EVENT_RIVAL_PICKED = 'rival-picked' as const;

export type RivalPickedDetail = {
  targetId: string;
  targetName: string;
};
