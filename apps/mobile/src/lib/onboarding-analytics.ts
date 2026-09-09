export interface OnboardingAnalytics {
  startedAt: string;
  completedAt: string | null;
  skippedAt: string | null;
  lastSlideIndex: number;
  totalSlides: number;
}

import { secureStorage } from "./api";

const ONBOARDING_ANALYTICS_KEY = "magicappdev_onboarding_analytics";

export async function getOnboardingAnalytics(): Promise<OnboardingAnalytics | null> {
  try {
    const stored = await secureStorage.getItem(ONBOARDING_ANALYTICS_KEY);
    if (stored) {
      return JSON.parse(stored) as OnboardingAnalytics;
    }
  } catch {
    // best-effort
  }
  return null;
}

export async function saveOnboardingAnalytics(analytics: OnboardingAnalytics): Promise<void> {
  try {
    await secureStorage.setItem(ONBOARDING_ANALYTICS_KEY, JSON.stringify(analytics));
  } catch {
    // best-effort
  }
}

export async function trackOnboardingStart(totalSlides: number): Promise<OnboardingAnalytics> {
  const analytics: OnboardingAnalytics = {
    startedAt: new Date().toISOString(),
    completedAt: null,
    skippedAt: null,
    lastSlideIndex: 0,
    totalSlides,
  };
  await saveOnboardingAnalytics(analytics);
  return analytics;
}

export async function trackOnboardingComplete(analytics: OnboardingAnalytics): Promise<OnboardingAnalytics> {
  const updated: OnboardingAnalytics = {
    ...analytics,
    completedAt: new Date().toISOString(),
  };
  await saveOnboardingAnalytics(updated);
  return updated;
}

export async function trackOnboardingSkip(analytics: OnboardingAnalytics): Promise<OnboardingAnalytics> {
  const updated: OnboardingAnalytics = {
    ...analytics,
    skippedAt: new Date().toISOString(),
  };
  await saveOnboardingAnalytics(updated);
  return updated;
}

export async function trackOnboardingSlideChange(
  analytics: OnboardingAnalytics,
  slideIndex: number
): Promise<OnboardingAnalytics> {
  const updated: OnboardingAnalytics = {
    ...analytics,
    lastSlideIndex: slideIndex,
  };
  await saveOnboardingAnalytics(updated);
  return updated;
}
