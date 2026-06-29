import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-3848627834535677/5316005468";

export async function showRewardedAd(
  onReward: () => void,
  onError: () => void
): Promise<void> {
  return new Promise((resolve) => {
    const ad = RewardedAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
      keywords: ["anime", "streaming", "entertainment"],
    });

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      ad.show();
      resolve();
    });

    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      onReward();
    });

    ad.addAdEventListener(AdEventType.ERROR, () => {
      unsubLoaded();
      onError();
      resolve();
    });

    ad.load();
  });
}

export const isAdMobAvailable = true;
