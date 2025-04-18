import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { SecretField } from "~/components/shared/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A function that receives functions that create promises and runs them in parallel with
 * a limit on the number of promises that can run at the same time.
 */
export const parallelWithLimit = async <T>({
  promiseGenerators,
  limit,
}: {
  promiseGenerators: (() => Promise<T>)[];
  limit: number;
}): Promise<T[]> => {
  const results: T[] = new Array(promiseGenerators.length);
  let index = 0;

  const worker = async () => {
    while (index < promiseGenerators.length) {
      const currentIndex = index;
      index += 1;

      results[currentIndex] = await promiseGenerators[currentIndex]();
    }
  };

  await Promise.all([...Array(limit)].map(worker));

  return results;
};

/** A helper function to obscure an email address. */
export const obscureEmailAddress = (email: string) => {
  const [localPart, domainPart] = email.split("@");
  const domainSuffix = domainPart.split(".")[1];

  // we just take the first character of the local part and the domain part
  return `${localPart[0]}...@${domainPart[0]}...${domainSuffix}`;
};

/** A helper function that sends a message to discord */
export const sendDiscordMessage = async (message: string) => {
  const webhookUrl = process.env.DISCORD_ACTIVITY_CHANNEL_WEBHOOK;

  if (webhookUrl === undefined) {
    console.error("No discord webhook url found, skipping sending message.");
    return;
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  });
};

/**
 * A helper function that returns a human-readable size for a file size in bytes.
 */
export const humanReadableFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * A helper function that computes the total size of all the secret fields.
 */
export const computeTotalSizeOfSecretFields = (secretFields: SecretField[]) => {
  const totalBytesOfFields = secretFields.reduce((acc, field) => {
    if (field.value === null) {
      return acc;
    }

    if (field.type === "multi-line-text" || field.type === "single-line-text") {
      return acc + new Blob([field.value]).size;
    } else {
      return acc + field.value.reduce((acc, file) => acc + file.size, 0);
    }
  }, 0);

  return totalBytesOfFields;
};

/**
 * Chunks out packed secrets.
 *
 * This is a json blob that includes the packed secrets public info and the ciphertext.
 */
export const chunkOutPackedSecrets = (packedSecrets: string) => {
  // split up the json string into 4mb chunks, assuming 2 bytes per character
  const bytesPerCharacter = 2;
  const chunkSize = (4 * 1024 * 1024) / bytesPerCharacter;
  const chunkArrays: Array<Array<string>> = [[]];
  for (let i = 0; i < packedSecrets.length; i += 1) {
    let currentChunk = chunkArrays[chunkArrays.length - 1];

    if (currentChunk.length >= chunkSize) {
      chunkArrays.push([]);
      currentChunk = chunkArrays[chunkArrays.length - 1];
    }

    currentChunk.push(packedSecrets[i]);
  }

  const chunks = chunkArrays.map((chunk) => chunk.join(""));

  return chunks;
};

/**
 * Typescript helper function to ensure that we have handled all possible cases in a switch statements,
 * if statements, or other control flow that is based on a discriminated union or something similar.
 */
export function exhaustiveGuard(_value: never): never {
  throw new Error(`ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}
