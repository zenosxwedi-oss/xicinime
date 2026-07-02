// Web / Expo Go stub — AdMob only available in native production builds
export const ADMOB_BANNER_ID = 'ca-app-pub-3848627834535677/3573045936';
export const ADMOB_REWARDED_ID = 'ca-app-pub-3848627834535677/5316005468';
export const isAdMobAvailable = false;

export async function showRewardedAd(
  onReward: () => void,
  _onError: () => void
): Promise<void> {
  // Simulate reward on web/Expo Go
  onReward();
}
