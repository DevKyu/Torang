const likeTimers: Record<string, number> = {};

export const scheduleLikeUpdate = (
  key: string,
  liked: boolean,
  callback: (liked: boolean) => Promise<void>,
) => {
  if (likeTimers[key]) {
    clearTimeout(likeTimers[key]);
  }

  likeTimers[key] = window.setTimeout(async () => {
    await callback(liked);
    delete likeTimers[key];
  }, 250);
};
