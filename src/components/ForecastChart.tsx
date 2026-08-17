import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { type DailyAverages } from "~/utils/aggregate";
import { type MaeByDate } from "~/utils/mae";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend);

const chartOptions: ChartOptions<"line"> = {
  plugins: {
    legend: { position: "top" },
    tooltip: { enabled: false },
  },
};

function series(label: string, data: number[], color: "red" | "blue") {
  const borderColor = color === "red" ? "rgb(255, 69, 0)" : "rgb(75, 192, 192)";
  return {
    label,
    data,
    fill: false,
    borderColor,
    tension: 0.7,
    pointBackgroundColor: color,
    pointBorderColor: color,
    pointRadius: 5,
    pointHoverRadius: 7,
  };
}

type TemperatureChartProps = {
  data: Record<string, DailyAverages>;
  maxLabel?: string;
  minLabel?: string;
};

/** Two-line chart of avgTmax/avgTmin per date, sorted ascending by date. */
export function TemperatureChart({
  data,
  maxLabel = "Max Temp",
  minLabel = "Min Temp",
}: TemperatureChartProps) {
  const dates = Object.keys(data).sort();
  return (
    <Line
      data={{
        labels: dates,
        datasets: [
          series(maxLabel, dates.map((date) => data[date]!.avgTmax), "red"),
          series(minLabel, dates.map((date) => data[date]!.avgTmin), "blue"),
        ],
      }}
      options={chartOptions}
    />
  );
}

type MaeChartProps = {
  data: MaeByDate[];
};

/** Two-line chart of the forecast-error (MAE) series produced by computeMaeByDate. */
export function MaeChart({ data }: MaeChartProps) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <Line
      data={{
        labels: sorted.map((entry) => entry.date),
        datasets: [
          series("Max Temp MAE", sorted.map((entry) => entry.maeTmax), "red"),
          series("Min Temp MAE", sorted.map((entry) => entry.maeTmin), "blue"),
        ],
      }}
      options={chartOptions}
    />
  );
}
