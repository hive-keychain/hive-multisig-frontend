export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'themePreference';

export const readThemePreference = (): ThemePreference => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // ignore
  }
  return 'system';
};

export const writeThemePreference = (preference: ThemePreference) => {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // ignore
  }
};

export const getSystemTheme = (): ResolvedTheme => {
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
};

export const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === 'light' || preference === 'dark') return preference;
  return getSystemTheme();
};

export const applyResolvedThemeToDocument = (theme: ResolvedTheme) => {
  try {
    document.documentElement.setAttribute('data-bs-theme', theme);
  } catch {
    // ignore
  }
};

export const cycleThemePreference = (current: ThemePreference): ThemePreference => {
  switch (current) {
    case 'system':
      return 'light';
    case 'light':
      return 'dark';
    case 'dark':
      return 'system';
    default:
      return 'system';
  }
};
