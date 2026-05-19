const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com']);
const FALLBACK_INSTAGRAM_URL = 'https://www.instagram.com/';

export const getSafeInstagramUrl = (value: string): string => {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !INSTAGRAM_HOSTS.has(url.hostname.toLowerCase())) {
      return FALLBACK_INSTAGRAM_URL;
    }
    return url.toString();
  } catch {
    return FALLBACK_INSTAGRAM_URL;
  }
};

export const isSafeInstagramUrl = (value: string): boolean => {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && INSTAGRAM_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};
