export type MaeByDate = {
  date: string;
  maeTmax: number;
  maeTmin: number;
};

type AvgRow = {
  _avg: { tmax: number | null; tmin: number | null };
};

/**
 * Mean absolute error, per calendar date, of earlier same-day forecast
 * snapshots against the most recent one.
 *
 * `rows` must already be sorted `createdAt desc` (all the "today" queries
 * are) — the first row is treated as ground truth and excluded from its own
 * error. The old version tried to detect "the reference row" by comparing
 * `arrayOfObjects[index - 1]`'s day to the current row's day, which only
 * ever worked because a "today" query never actually spanned two calendar
 * days; here the reference row is excluded explicitly instead.
 */
export function computeMaeByDate<T extends AvgRow>(
  rows: T[] | undefined,
  getDate: (row: T) => Date,
): MaeByDate[] {
  if (!rows || rows.length === 0) return [];

  const [reference, ...predictions] = rows as [T, ...T[]];
  const referenceTmax = reference._avg.tmax;
  const referenceTmin = reference._avg.tmin;
  if (referenceTmax === null || referenceTmin === null) return [];

  const sums = new Map<string, { tmaxSum: number; tminSum: number; count: number }>();
  for (const row of predictions) {
    const { tmax, tmin } = row._avg;
    if (tmax === null || tmin === null) continue;

    const date = getDate(row).toISOString().slice(0, 10)!;
    const bucket = sums.get(date) ?? { tmaxSum: 0, tminSum: 0, count: 0 };
    bucket.tmaxSum += Math.abs(tmax - referenceTmax);
    bucket.tminSum += Math.abs(tmin - referenceTmin);
    bucket.count += 1;
    sums.set(date, bucket);
  }

  return Array.from(sums, ([date, bucket]) => ({
    date,
    maeTmax: bucket.tmaxSum / bucket.count,
    maeTmin: bucket.tminSum / bucket.count,
  }));
}

/** Average of `maeTmax`/`maeTmin` across all dates — 0 when there's no data yet. */
export function averageMae(entries: MaeByDate[]) {
  if (entries.length === 0) return { avgMaeTmax: 0, avgMaeTmin: 0 };
  const avgMaeTmax = entries.reduce((sum, e) => sum + e.maeTmax, 0) / entries.length;
  const avgMaeTmin = entries.reduce((sum, e) => sum + e.maeTmin, 0) / entries.length;
  return { avgMaeTmax, avgMaeTmin };
}
