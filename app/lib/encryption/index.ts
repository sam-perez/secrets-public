/**
 * Pack a uint8Array into a string.
 *
 * Javascript strings are UTF-16 encoded, so we can pack two bytes into each character. Will pad with a null byte
 * if necessary.
 *
 * Returns the packed string and the original length of the uint8Array.
 */
export function uint8ArrayToString(uint8Array: Uint8Array) {
  const chars = [];

  for (let i = 0; i < uint8Array.length; i += 2) {
    const firstByte = uint8Array[i];
    // If we're at the end of the array, use 0 for the second byte aka pad with a null byte
    const secondByte = i + 1 < uint8Array.length ? uint8Array[i + 1] : 0;

    const num = firstByte + (secondByte << 8);
    chars.push(String.fromCharCode(num));
  }

  return { stringRepresentation: chars.join(""), originalLength: uint8Array.length };
}

/**
 * Unpack a string into a uint8Array.
 *
 * Javascript strings are UTF-16 encoded, so we assume that two bytes are packed into each character.
 *
 * Returns the unpacked uint8Array.
 */
export function stringToUint8Array({
  stringRepresentation,
  originalLength,
}: {
  stringRepresentation: string;
  originalLength: number;
}) {
  const uint8Array = new Uint8Array(originalLength);
  for (let i = 0, j = 0; i < stringRepresentation.length; i++, j += 2) {
    const num = stringRepresentation.charCodeAt(i);

    // need to do & 0xff to get the lower byte since charCodeAt returns a 16-bit number
    uint8Array[j] = num & 0xff; // Lower byte

    // Only write the higher byte if we're not at the end of the array
    if (j + 1 < originalLength) {
      uint8Array[j + 1] = (num >> 8) & 0xff; // Higher byte
    }
  }

  return uint8Array;
}

/**
 * Compute the SHA-256 hash of a Uint8Array.
 */
export async function computeSHA256HashOfUint8Array(data: Uint8Array) {
  // data should be a Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer); // Convert buffer to byte array

  const hashHexParts: string[] = [];
  hashArray.forEach((byte) => hashHexParts.push(byte.toString(16).padStart(2, "0")));

  return hashHexParts.join("");
}
