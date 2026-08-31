export type DailyAverages = {
  avgTmax: number;
  avgTmin: number;
  avgHumidity: number | null;
};

type AvgRow = {
  _avg: { tmax: number | null; tmin: number | null; humidity?: number | null };
};

/**
 * Buckets forecast snapshots by calendar date and averages tmax/tmin (and
 * humidity, when the provider has it) within each bucket. `getDate` picks
 * which field a row is bucketed by — `createdAt` for "snapshots taken
 * today", `forecastDay`/`forecastDate` for "forecasts for the coming week".
 */
export function aggregateDailyAverages<T extends AvgRow>(
  rows: T[] | undefined,
  getDate: (row: T) => Date,
): Record<string, DailyAverages> {
  const sums = new Map<
    string,
    {
      tmaxSum: number;
      tminSum: number;
      humiditySum: number;
      humidityCount: number;
      count: number;
    }
  >();

  for (const row of rows ?? []) {
    const { tmax, tmin, humidity } = row._avg;
    if (tmax === null || tmin === null) continue;

    const date = getDate(row).toISOString().slice(0, 10)!;
    const bucket = sums.get(date) ?? {
      tmaxSum: 0,
      tminSum: 0,
      humiditySum: 0,
      humidityCount: 0,
      count: 0,
    };
    bucket.tmaxSum += tmax;
    bucket.tminSum += tmin;
    bucket.count += 1;
    if (humidity != null) {
      bucket.humiditySum += humidity;
      bucket.humidityCount += 1;
    }
    sums.set(date, bucket);
  }

  const result: Record<string, DailyAverages> = {};
  for (const [date, bucket] of sums) {
    result[date] = {
      avgTmax: bucket.tmaxSum / bucket.count,
      avgTmin: bucket.tminSum / bucket.count,
      avgHumidity:
        bucket.humidityCount > 0 ? bucket.humiditySum / bucket.humidityCount : null,
    };
  }
  return result;
}
