import {
  computeSHA256HashOfUint8Array,
  decryptString,
  encryptString,
  uint8ArrayToString,
  StringifiedUint8Array,
  stringToUint8Array,
} from "../encryption";

// TODO: not sure what these names should be yet, just a placeholder for now

/**
 * Represents a secret value. Is a response to a secret prompt within a send
 * or receive operation.
 */
type SecretValue = {
  /** Text values. */
  textValues: string[];

  /** File uploads. Note, we purposefully do not retain any metadata. */
  files: {
    /** The name of the file. */
    name: string;

    /** The sha 256 hash of the file data, for integrity purposes. */
    sha256Hash: string;

    /** The file data. */
    data: Uint8Array;
  }[];
};

/***
 * Represents a collection of secret values. Is a response to a secret data request.
 * It is an ordered array of secret values, each corresponding to a secret prompt.
 */
type SecretResponses = Array<SecretValue>;

/**
 * Represents a packed secret response.
 */
type PackedSecrets = {
  iv: StringifiedUint8Array;
  ciphertext: StringifiedUint8Array;
  salt: StringifiedUint8Array;
  password: string;
};

/**
 * Packs a secret response into an encrypted form.
 *
 * We do this by converting the secret values into a JSON string, then encrypting
 * the JSON string using AES-GCM with a key derived randomly. We return the encrypted
 * contents and the other necessary information to decrypt the contents.
 */
export const packSecrets = async (secretResponse: SecretResponses): Promise<PackedSecrets> => {
  const jsonSerializableSecretValues = secretResponse.map((secretValue) => {
    return {
      textValues: secretValue.textValues,
      files: secretValue.files.map((file) => {
        return {
          name: file.name,
          sha256Hash: file.sha256Hash,
          stringifiedUintArray8Data: uint8ArrayToString(file.data),
        };
      }),
    };
  });

  const jsonSecretValues = JSON.stringify(jsonSerializableSecretValues);

  // TODO: we should compress the JSON string before encrypting it.

  // generate a random password using the character set [A-Za-z0-9]
  // we are going with 20 characters for now, which is a good balance between security and usability.
  // we will have 62^20 possible passwords, which should take "forever" to brute force.
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const getRandomChar = () => alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  const password = Array.from({ length: 20 }, getRandomChar).join("");

  const { iv, ciphertext, salt } = await encryptString(jsonSecretValues, password);

  // one more layer of conferting the arrays to strings "efficiently"
  return {
    iv: uint8ArrayToString(iv),
    ciphertext: uint8ArrayToString(ciphertext),
    salt: uint8ArrayToString(salt),
    password,
  };
};

/**
 * Unpacks an encrypted secret response.
 *
 * We do this by decrypting the encrypted contents using the provided key and salt.
 * We then parse the JSON string into an array of secret values.
 */
export const unpackSecrets = async (packedSecrets: PackedSecrets) => {
  const iv = stringToUint8Array(packedSecrets.iv);
  const ciphertext = stringToUint8Array(packedSecrets.ciphertext);
  const salt = stringToUint8Array(packedSecrets.salt);
  const password = packedSecrets.password;

  const jsonSecretValues = await decryptString(iv, ciphertext, salt, password);

  const jsonSerializableSecretValues = JSON.parse(jsonSecretValues) as Array<{
    textValues: string[];
    files: Array<{ name: string; sha256Hash: string; stringifiedUintArray8Data: StringifiedUint8Array }>;
  }>;

  const retrievedSecretResponse: SecretResponses = jsonSerializableSecretValues.map((jsonSerializableSecretValue) => {
    return {
      textValues: jsonSerializableSecretValue.textValues,
      files: jsonSerializableSecretValue.files.map((file) => {
        const originalData = stringToUint8Array(file.stringifiedUintArray8Data);

        return {
          name: file.name,
          sha256Hash: file.sha256Hash,
          data: originalData,
        };
      }),
    };
  });

  // let's do a quick integrity check, just to be sure
  for (const secretValue of retrievedSecretResponse) {
    for (const file of secretValue.files) {
      const hash = await computeSHA256HashOfUint8Array(file.data);
      if (hash !== file.sha256Hash) {
        throw new Error("Data integrity check failed.");
      }
    }
  }

  return retrievedSecretResponse;
};
