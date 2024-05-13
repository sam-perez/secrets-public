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

export type StringifiedUint8Array = ReturnType<typeof uint8ArrayToString>;

/**
 * Unpack a string into a uint8Array.
 *
 * Javascript strings are UTF-16 encoded, so we assume that two bytes are packed into each character.
 *
 * Returns the unpacked uint8Array.
 */
export function stringToUint8Array({ stringRepresentation, originalLength }: StringifiedUint8Array) {
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

/**
 * Derive an AES-GCM key from a password.
 */
const deriveAesGcmKeyFromPassword = async (password: string, salt?: Uint8Array) => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);

  if (salt === undefined) {
    // a secure random salt that should be stored alongside the encrypted data
    salt = window.crypto.getRandomValues(new Uint8Array(32));
  }

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return {
    key,
    salt,
  };
};

/**
 * Encrypt a string using AES-GCM.
 */
export async function encryptString(plainText: string, password: string) {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // AES-GCM 12-byte IV

  const { key, salt } = await deriveAesGcmKeyFromPassword(password);

  const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plainText));

  return {
    iv,
    ciphertext: new Uint8Array(ciphertext),
    salt,
  };
}

/**
 * Decrypt a string using AES-GCM. Requires the IV, ciphertext, salt, and password. Returns the decrypted string.
 */
export async function decryptString(iv: Uint8Array, ciphertext: Uint8Array, salt: Uint8Array, password: string) {
  const decoder = new TextDecoder();
  const { key } = await deriveAesGcmKeyFromPassword(password, salt);
  const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

  return decoder.decode(decrypted);
}
