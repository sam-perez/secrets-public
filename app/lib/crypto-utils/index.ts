/**
 * Convert a number to a base62 string.
 *
 * Base 62 is a way to represent numbers using the characters 0-9, A-Z, and a-z.
 */
export function toBase62(num: number): string {
  // this character set is in lexicographical order, which is important for sorting
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  const result: string[] = [];
  do {
    result.push(characters[num % 62]);
    num = Math.floor(num / 62);
  } while (num > 0);

  return result.join("");
}

/**
 * Get a random integer between min and max, inclusive.
 */
export function getRandomIntInclusive(min: number, max: number) {
  const randomBuffer = new Uint32Array(1);

  crypto.getRandomValues(randomBuffer);

  const randomNumber = randomBuffer[0] / (0xffffffff + 1);

  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(randomNumber * (max - min + 1)) + min;
}

/**
 * Get a random base62 string of a given length.
 */
export function getRandomBase62String(length: number) {
  const chars: string[] = [];

  for (let i = 0; i < length; i++) {
    const nextInt = getRandomIntInclusive(0, 61);
    chars.push(toBase62(nextInt));
  }

  return chars.join("");
}
