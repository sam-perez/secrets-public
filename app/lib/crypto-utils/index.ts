/**
 * Convert a number to a base62 string.
 *
 * Base 62 is a way to represent numbers using the characters 0-9, A-Z, and a-z.
 */
export function toBase62(num: number): string {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  do {
    result = characters[num % 62] + result;
    num = Math.floor(num / 62);
  } while (num > 0);
  return result;
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
