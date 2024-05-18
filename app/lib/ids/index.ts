import { getRandomIntInclusive, toBase62 } from "../crypto-utils";

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

  // get a 7 character random part
  // that's 3.5e12 possible combinations, which should be enough for our use case.
  const randomPart = Array.from({ length: randomPartLength })
    .map(() => {
      const nextInt = getRandomIntInclusive(0, 61);
      return toBase62(nextInt);
    })
    .join("");

  // Concatenate prefix, time part, and random part
  return `${prefix}-${timePart}-${randomPart}` as BrandedId<T>;
}
