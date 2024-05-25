import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A function that receives functions that create promises and runs them in parallel with
 * a limit on the number of promises that can run at the same time.
 */
export const parallelWithLimit = async <T>(args: { limit: number; fns: (() => Promise<T>)[] }): Promise<T[]> => {
  const { limit, fns } = args;

  const results: T[] = new Array(fns.length);
  let index = 0;

  const worker = async () => {
    while (index < fns.length) {
      const currentIndex = index;
      index += 1;

      results[currentIndex] = await fns[currentIndex]();
    }
  };

  await Promise.all([...Array(limit)].map(worker));

  return results;
};
