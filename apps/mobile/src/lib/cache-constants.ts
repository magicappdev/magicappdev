export const WIFI_ONLY_KEY = "magicappdev_wifi_only_caching";
export const CACHE_TTL_DAYS = 7;
export const CACHE_ANALYTICS_KEY = "magicappdev_cache_analytics";

export interface CacheAnalytics {
  hits: number;
  misses: number;
  lastCheck: string | null;
}
