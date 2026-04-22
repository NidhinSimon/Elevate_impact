export function formatDateSafe(
  value: string | number | Date | null | undefined,
  fallback = "N/A",
  locales?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions
) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString(locales, options);
}

export function toIsoStringSafe(value: number | Date | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}
