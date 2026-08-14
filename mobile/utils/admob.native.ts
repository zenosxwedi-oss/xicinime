// Stubbed AdMob for mobile — no-op implementation so mobile builds don't load AdMob SDK.

export async function showRewardedAd(onReward: () => void, onError: () => void): Promise<void> {
  // Immediately resolve and call onReward so UI that expects a reward continues to work.
  try {
    // If the app relies on rewarded ads to unlock features, we call onReward immediately.
    onReward && onReward();
  } catch (e) {
    // ignore
  }
  return Promise.resolve();
}

export const isAdMobAvailable = false;
