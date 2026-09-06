/**
 * Concurrency utilities for controlled parallel execution.
 */

export interface ConcurrencyResult<T> {
  ok: boolean;
  value: T;
  error?: Error;
}

/**
 * Map over an array with bounded parallelism.
 *
 * Unlike `Promise.all`, individual failures are captured and returned as
 * `ConcurrencyResult` entries rather than rejecting the entire batch.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<ConcurrencyResult<R>[]> {
  const results: ConcurrencyResult<R>[] = new Array(items.length);
  let index = 0;
  const workers: Promise<void>[] = [];

  for (let w = 0; w < concurrency; w++) {
    workers.push(
      (async (): Promise<void> => {
        while (index < items.length) {
          const i = index++;
          try {
            results[i] = { ok: true, value: await fn(items[i], i) };
          } catch (error) {
            results[i] = {
              ok: false,
              value: null as R,
              error: error instanceof Error ? error : new Error(String(error)),
            };
          }
        }
      })(),
    );
  }

  await Promise.all(workers);
  return results;
}
