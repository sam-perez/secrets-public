/** ISO 8601 date string type. */
export type Iso8601DateTimeString = string & { __brand: "ISO_DATE_TIME_STRING" };

/**
 * Get an ISO 8601 date time string from a date.
 */
export const getIso8601DateTimeString = (date: Date): Iso8601DateTimeString => {
  return date.toISOString() as Iso8601DateTimeString;
};

/**
 * Get the current date time as an ISO 8601 date time string.
 */
export const nowIso8601DateTimeString = (): Iso8601DateTimeString => {
  return getIso8601DateTimeString(new Date());
};
