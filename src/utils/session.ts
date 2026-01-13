import { getElapsedTimestampSeconds, getTimestampInSeconds } from './utils';

export const LOGIN_TIMESTAMP_STORAGE_KEY = 'loginTimestap' as const;

export const parseLoginTimestampSeconds = (value: unknown): number | null => {
  const ts = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN;
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return ts;
};

export const getSessionAgeSeconds = (
  loginTimestampSeconds: number,
  nowSeconds: number = getTimestampInSeconds(),
): number | null => {
  const age = getElapsedTimestampSeconds(loginTimestampSeconds, nowSeconds);
  if (!Number.isFinite(age) || age < 0) return null;
  return age;
};

export const isSessionValid = (
  loginTimestampValue: unknown,
  expirationInSec: number,
  nowSeconds: number = getTimestampInSeconds(),
): boolean => {
  if (!Number.isFinite(expirationInSec) || expirationInSec <= 0) return false;
  const ts = parseLoginTimestampSeconds(loginTimestampValue);
  if (ts === null) return false;
  const age = getSessionAgeSeconds(ts, nowSeconds);
  if (age === null) return false;
  return age < expirationInSec;
};

export const isSessionExpired = (
  loginTimestampValue: unknown,
  expirationInSec: number,
  nowSeconds: number = getTimestampInSeconds(),
): boolean => {
  if (!Number.isFinite(expirationInSec) || expirationInSec <= 0) return true;
  const ts = parseLoginTimestampSeconds(loginTimestampValue);
  if (ts === null) return true;
  const age = getSessionAgeSeconds(ts, nowSeconds);
  if (age === null) return true;
  return age >= expirationInSec;
};
