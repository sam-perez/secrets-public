import { getRandomBase62String, toBase62 } from "../crypto-utils";

/**
 * A type for an id that is a unique identifier of that id.
 */
export type BrandedId<T extends string> = string & { __brand: T };

/**
 * Generate a unique ID.
 *
 * Does so by using a prefix, a timepart, and then a random part.
 *
 * We use base62 to represent the time part and random part, which gives us a nice balance between
 * length and randomness. Also, these ids should be compatible with s3 object keys.
 */
export function generateUniqueId<T extends string>(prefix: T, randomPartLength: number): BrandedId<T> {
  // Time part: current timestamp in milliseconds
  const timePart = toBase62(Date.now());

  const randomPart = getRandomBase62String(randomPartLength);

  // Concatenate prefix, time part, and random part
  return `${prefix}-${timePart}-${randomPart}` as BrandedId<T>;
}
