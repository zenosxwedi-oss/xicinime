// Web/Expo Go stub — AdMob is only available on native builds
export async function showRewardedAd(
  onReward: () => void,
  _onError: () => void
): Promise<void> {
  // Simulate a reward on web/Expo Go
  onReward();
}

export const isAdMobAvailable = false;
