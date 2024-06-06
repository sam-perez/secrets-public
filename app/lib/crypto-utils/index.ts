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

  // reverse the result so that the least significant digit is first
  return result.reverse().join("");
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

/**
 * A simple function to convert a string to a UTF16 ArrayBuffer.
 *
 * Prepares the string to be uploaded to the server. The string contains all or part of the encrypted data.
 */
export function stringToUtf16ArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes per character
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/**
 * Convert an UTF16 ArrayBuffer to a string.
 *
 * This function is used to convert the raw octets received from the server into a string. The string contains all or
 * part of the encrypted data, and are meant to be concatenated together to form the full encrypted data and then
 * decrypted.
 */
export function utf16ArrayBufferToString(arrayBuffer: ArrayBuffer) {
  const reconstructedStringChars = [];
  const uint16Array = new Uint16Array(arrayBuffer);

  for (let i = 0; i < uint16Array.length; i++) {
    reconstructedStringChars.push(String.fromCharCode(uint16Array[i]));
  }

  return reconstructedStringChars.join("");
}
