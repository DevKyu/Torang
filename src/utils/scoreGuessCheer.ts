export type CheerVote = { targetEmpId?: string; message?: string };

export const countCheerMessagesByCandidate = (
  votes: Record<string, CheerVote> | undefined,
): Record<string, number> => {
  const counts: Record<string, number> = {};
  Object.values(votes ?? {}).forEach((vote) => {
    if (vote?.targetEmpId && vote.message) {
      counts[vote.targetEmpId] = (counts[vote.targetEmpId] ?? 0) + 1;
    }
  });
  return counts;
};

export const isCheerSatisfied = (
  readCount: number | undefined,
  messageCount: number | undefined,
): boolean => (readCount ?? 0) >= (messageCount ?? 0);
