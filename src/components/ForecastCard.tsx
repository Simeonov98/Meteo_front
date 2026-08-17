import Link from "next/link";

type ForecastCardProps = {
  datePrefix?: "From" | "For";
  date: string;
  avgTmax: number;
  avgTmin: number;
  avgHumidity?: number | null;
  detailsHref: { pathname: string; query: Record<string, string | number> };
};

export function ForecastCard({
  datePrefix = "From",
  date,
  avgTmax,
  avgTmin,
  avgHumidity,
  detailsHref,
}: ForecastCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">
        {datePrefix}: {date}
      </h2>
      <p className="text-gray-600">Max Temp: {avgTmax.toFixed(2)} °C</p>
      <p className="text-gray-600">Min Temp: {avgTmin.toFixed(2)} °C</p>
      {avgHumidity != null && (
        <p className="text-gray-600">Hum: {avgHumidity.toFixed(2)} %</p>
      )}
      <div className="mt-4">
        <Link className="text-gray-800 hover:underline" href={detailsHref}>
          Details about this day
        </Link>
      </div>
    </div>
  );
}
