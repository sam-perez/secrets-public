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

  const results: T[] = [];
  let index = 0;

  const next = async () => {
    const i = index++;
    if (i >= fns.length) {
      return;
    }

    const result = await fns[i]();
    results.push(result);
    await next();
  };

  await Promise.all([...Array(limit)].map(next));

  return results;
};
