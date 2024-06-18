import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
