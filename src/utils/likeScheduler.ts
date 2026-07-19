const likeTimers: Record<string, number> = {};

export const scheduleLikeUpdate = (
  key: string,
  liked: boolean,
  callback: (liked: boolean) => Promise<void>,
  onError?: (liked: boolean) => void,
) => {
  if (likeTimers[key]) {
    clearTimeout(likeTimers[key]);
  }

  likeTimers[key] = window.setTimeout(async () => {
    try {
      await callback(liked);
    } catch {
      onError?.(liked);
    } finally {
      delete likeTimers[key];
    }
  }, 250);
};
