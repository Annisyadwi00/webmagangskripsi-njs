export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidScore(value: unknown) {
  const score = Number(value);

  return Number.isInteger(score) && score >= 0 && score <= 100;
}

export function parsePositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function trimString(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export function optionalTrimString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

export function isValidDate(value: unknown) {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

export function isStartDateBeforeEndDate(startDate: string, endDate: string) {
  return new Date(startDate) <= new Date(endDate);
}