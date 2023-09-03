import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Dalivali, Prisma } from "@prisma/client";
// import LineChart from "horizon-tailwind-react/src/components/charts/LineChart"
// import {lineChartDataOverallRevenue, lineChartOptionsOverallRevenue} from "horizon-tailwind-react/src/variables/charts";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Card,
  Typography,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
} from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
// import DaliVali from "./dalivali";
import { Chart } from "chart.js/dist";
import { date } from "zod";
import { router } from "@trpc/server";
import { Router, useRouter } from "next/router";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend);

const TABLE_HEAD = ["From Date", "Tmax avg", "Tmin avg", "CreatedAt"];

const Home: NextPage = () => {
  //const user = useUser();

  const { data: dataCities } = api.cities.getAll.useQuery();

  const dataProviders: string[] = ["DaliVali", "Sinoptik", "Freemeteo"];
  const datee: Date = new Date();
  datee.setHours(0, 0, 0, 0);
  const router = useRouter()
  const currPage = router.pathname
  // ----------------------------------------------------

  // ✅ Format a date to YYYY-MM-DD (or any other format)
  function padTo2Digits(num: number) {
    return num.toString().padStart(2, "0");
  }

  function formatDate(datee: Date) {
    return [
      datee.getFullYear(),
      padTo2Digits(datee.getMonth() + 1),
      padTo2Digits(datee.getDate()),
    ]
      .join("-")
      .concat("T00:00:00.000Z");
  }
  // const currDate: Date = new Date(formatDate(new Date()));

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // This effect will run once when the component is mounted.
    setCurrentDate(new Date(formatDate(new Date())));
  }, []);

  const [city, setCity] = useState<number>();

  const [fdate, setFdate] = useState<Date>();

  const [provider, setProvider] = useState<string>();

  // const { data: dataFdateDaliVali } = api.providers.getForecastDate.useQuery({
  //   cityId: city,
  //   date: currentDate,
  // });

  const { data: dataDaliVali } = api.providers.getDaliVali.useQuery({
    cityId: city,
  });
  const { data: dataDaliValiForNextWeek } =
    api.providers.getForNextWeekDali.useQuery({ cityId: city });
  //console.log(dataDaliValiForNextWeek);
  const { data: dataSinoptikForNextWeek } =
    api.providers.getForNextWeekSino.useQuery({ cityId: city });
  const { data: dataFreemeteoForNextWeek } =
    api.providers.getForNextWeekFree.useQuery({ cityId: city });
  console.log(dataFreemeteoForNextWeek)
  function SumAvg(data:any[]): {
    avgTmax: number;
    avgTmin: number;
    avgThum: number;
  } {
    const sumTmax = data?.reduce((acc, obj) => acc + obj._avg.tmax, 0);
    const sumTmin = data?.reduce((acc, obj) => acc + obj._avg.tmin, 0);
    const sumThum = data?.reduce((acc, obj) => acc + obj._avg.humidity, 0);
    const avgTmax = sumTmax / data?.length;
    const avgTmin = sumTmin / data?.length;
    const avgThum = sumThum / data?.length;
    return { avgTmax, avgTmin, avgThum };
  }
  const groupedByCreateAtDali = dataDaliValiForNextWeek?.reduce(
    (groups, item) => {
      // returns an array of objects; Each property of the groupedByCreateAt object represents a date, and the corresponding value is an array containing objects with createdAt dates falling within that date.
      const dateD = item.forecastDay.getDate();
      if (!groups[dateD]) {
        groups[dateD] = [];
      }
      groups[dateD]?.push(item);
      return groups;
    },
    {} as {
      [key: number]: (Prisma.PickArray<
        Prisma.DalivaliGroupByOutputType,
        ("forecastDay" | "createdAt")[]
      > & {
        _avg: {
          tmax: number | null;
          tmin: number | null;
          humidity: number | null;
        };
      })[]
    }
  );
  const groupedByCreateAtFree = dataFreemeteoForNextWeek?.reduce(
    (groups, item) => {
      const dateF = item.forecastDay.getDate();
      if (!groups[dateF]) {
        groups[dateF] = [];
      }
      groups[dateF]?.push(item);
      return groups;
    },
    {} as {
      [key: number]: (Prisma.PickArray<
        Prisma.FreemeteoGroupByOutputType,
        ("forecastDay" | "createdAt")[]
      > & {
        _avg: {
          tmax: number | null;
          tmin: number | null;
          
        };
      })[]
    }
  );
  const groupedByCreateAtSino = dataSinoptikForNextWeek?.reduce(
    (groups, item) => {
      const dateS = item.forecastDate.getDate();
      if (!groups[dateS]) {
        groups[dateS] = [];
      }
      groups[dateS]?.push(item);
      return groups;
    },
    {} as {
      [key: number]: (Prisma.PickArray<
        Prisma.SinoptikGroupByOutputType,
        ("forecastDate" | "createdAt")[]
      > & {
        _avg: {
          tmax: number | null;
          tmin: number | null;
          
        };
      })[]
    }
  );
  type Result = {
    [key: string]: {
      avgTmax: number;
      avgTmin: number;
      avgHumidity: number;
    };
  };
  type avgRes = {
    [key: string]: {
      tmaxSum: number;
      tminSum: number;
      humiditySum: number;
      count: number;
    };
  };
  function calculateAveragesDay(data: any) {
    const reformattedData: avgRes = {};

    // Reformat the createdAt date and calculate averages
    for (const key in data) {
      const entries = data[key];
      for (const entry of entries) {
        const createdAt = new Date(entry.forecastDay)
          .toISOString()
          .slice(0, 10); // Extract date part
        if (!reformattedData[createdAt]) {
          reformattedData[createdAt] = {
            tmaxSum: 0,
            tminSum: 0,
            humiditySum: 0,
            count: 0,
          };
        }
        reformattedData[createdAt]!.tmaxSum += entry._avg.tmax;
        reformattedData[createdAt]!.tminSum += entry._avg.tmin;
        reformattedData[createdAt]!.humiditySum += entry._avg.humidity;
        reformattedData[createdAt]!.count++;
      }
    }

    // Calculate averages and format output
    const result: Result = {};
    for (const createdAt in reformattedData) {
      const avgEntry = reformattedData[createdAt];
      const avgTmax = avgEntry!.tmaxSum / avgEntry!.count;
      const avgTmin = avgEntry!.tminSum / avgEntry!.count;
      const avgHumidity = avgEntry!.humiditySum / avgEntry!.count;

      result[createdAt] = {
        avgTmax,
        avgTmin,
        avgHumidity,
      };
    }

    return result;
  }
  type avgResF = {
    [key: string]: {
      tmaxSum: number;
      tminSum: number;
      
      count: number;
    };
  };
  type ResultF ={ [key: string] : {
    avgTmax:number,
    avgTmin:number,
    //avgHumidity:number,
  };}
  
  function calculateAveragesDate(data: any) {
    const reformattedData:avgRes = {};

    // Reformat the createdAt date and calculate averages
    for (const key in data) {
      const entries = data[key];
      for (const entry of entries) {
        const createdAt = new Date(entry.forecastDate)
          .toISOString()
          .slice(0, 10); // Extract date part
        if (!reformattedData[createdAt]) {
          reformattedData[createdAt] = {
            tmaxSum: 0,
            tminSum: 0,
            humiditySum: 0,
            count: 0,
          };
        }
        reformattedData[createdAt]!.tmaxSum += entry._avg.tmax;
        reformattedData[createdAt]!.tminSum += entry._avg.tmin;
        reformattedData[createdAt]!.humiditySum += entry._avg.humidity;
        reformattedData[createdAt]!.count++;
      }
    }

    // Calculate averages and format output
    const result: Result = {};
    for (const createdAt in reformattedData) {
      const avgEntry = reformattedData[createdAt];
      const avgTmax = avgEntry!.tmaxSum / avgEntry!.count;
      const avgTmin = avgEntry!.tminSum / avgEntry!.count;
      const avgHumidity = avgEntry!.humiditySum / avgEntry!.count;

      result[createdAt] = {
        avgTmax,
        avgTmin,
        avgHumidity,
      };
    }

    return result;
  }
  function calculateAveragesDayF(data:any) {
    const reformattedData: avgResF = {};

    // Reformat the createdAt date and calculate averages
    for (const key in data) {
      const entries = data[key];
      for (const entry of entries) {
        const createdAt = new Date(entry.forecastDay).toISOString().slice(0, 10); // Extract date part
        if (!reformattedData[createdAt]) {
          reformattedData[createdAt] = {
            tmaxSum: 0,
            tminSum: 0,
            //humiditySum: 0,
            count: 0,
          };
        }
        if(entry._avg.tmax!==null){
        reformattedData[createdAt]!.tmaxSum += entry._avg.tmax;
        reformattedData[createdAt]!.tminSum += entry._avg.tmin;
        //reformattedData[createdAt]!.humiditySum += entry._avg.humidity;
        reformattedData[createdAt]!.count++;
        }
      }
    }

    // Calculate averages and format output
    const result:ResultF = {};
    for (const createdAt in reformattedData) {
      const avgEntry = reformattedData[createdAt];
      const avgTmax = avgEntry!.tmaxSum / avgEntry!.count;
      const avgTmin = avgEntry!.tminSum / avgEntry!.count;
      //const avgHumidity = avgEntry!.humiditySum / avgEntry!.count;

      result[createdAt] = {
        avgTmax,
        avgTmin,
        //avgHumidity,
      };
    }

    return result;
  }
  const averageDataForNextWeekDali = calculateAveragesDay(
    groupedByCreateAtDali
  );
  const averageDataForNextWeekFree = calculateAveragesDayF(
    groupedByCreateAtFree
  );
  const averageDataForNextWeekSino = calculateAveragesDate(
    groupedByCreateAtSino
  );
  // const { data: dataSinoptik } = api.providers.getDaliVali.useQuery({ cityId: city });
  // const { data: dataFreemeteo } = api.providers.getDaliVali.useQuery({ cityId: city });

  
  const chartOptions = {
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "chart examp",
      },
      tooltip: {
        enabled: false, // Disable default tooltip
      },
      datalabels: {
        display: true,
        color: "black",
        formatter: function (value: any) {
          return value; // Display the data value directly on the point
        },
      },
    },
  };
  function chartfuncDay(data: Result) {
    return {
      labels: Object.keys(data)
        .sort()
        .map((forecastDay) => forecastDay.toString()),
      // labels: dataFdateDaliVali?.map((date) => date.date.toString()).reverse(),
      datasets: [
        {
          label: "Max Temp",
          data: Object.keys(data)
            .sort()
            ?.map((date) => data[date]?.avgTmax),
          fill: false,
          borderColor: "rgb(255, 69, 0)",
          tention: 0.7,
          pointBackgroundColor: "red", // Color of the data points
          pointBorderColor: "red", // Border color of the data points
          pointRadius: 5, // Radius of the data points when not hovered
          pointHoverRadius: 7, // Radius of the data points when hovered
        },
        {
          label: "Min Temp",
          data: Object.keys(data)
            .sort()
            ?.map((date) => data[date]?.avgTmin),
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tention: 0.7,
          pointBackgroundColor: "blue", // Color of the data points
          pointBorderColor: "blue", // Border color of the data points
          pointRadius: 5, // Radius of the data points when not hovered
          pointHoverRadius: 7, // Radius of the data points when hovered
        },
      ],
    };
  }
  function chartfuncDate(data: Result) {
    return {
      labels: Object.keys(data)
        .sort()
        .map((forecastDate) => forecastDate.toString()),
      // labels: dataFdateDaliVali?.map((date) => date.date.toString()).reverse(),
      datasets: [
        {
          label: "Max Temp",
          data: Object.keys(data)
            .sort()
            ?.map((date) => data[date]?.avgTmax),
          fill: false,
          borderColor: "rgb(255, 69, 0)",
          tention: 0.7,
          pointBackgroundColor: "red", // Color of the data points
          pointBorderColor: "red", // Border color of the data points
          pointRadius: 5, // Radius of the data points when not hovered
          pointHoverRadius: 7, // Radius of the data points when hovered
        },
        {
          label: "Min Temp",
          data: Object.keys(data)
            .sort()
            ?.map((date) => data[date]?.avgTmin),
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tention: 0.7,
          pointBackgroundColor: "blue", // Color of the data points
          pointBorderColor: "blue", // Border color of the data points
          pointRadius: 5, // Radius of the data points when not hovered
          pointHoverRadius: 7, // Radius of the data points when hovered
        },
      ],
    };
  }
  function chartfuncF(data:ResultF){
    return {
      labels: Object.keys(data)
        .sort()
        .map((forecastDay) => forecastDay.toString()),
      // labels: dataFdateDaliVali?.map((date) => date.date.toString()).reverse(),
      datasets: [
        {
          label: "Max Temp",
          data: Object.keys(data)
            .sort()
            ?.map((date) => data[date]?.avgTmax),
          fill: false,
          borderColor: "rgb(255, 69, 0)",
          tention: 0.7,
          pointBackgroundColor: "red", // Color of the data points
          pointBorderColor: "red", // Border color of the data points
          pointRadius: 5, // Radius of the data points when not hovered
          pointHoverRadius: 7, // Radius of the data points when hovered
        },
        {
          label: "Min Temp",
          data: Object.keys(data)
            .sort()
            ?.map((date) => data[date]?.avgTmin),
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tention: 0.7,
          pointBackgroundColor: "blue", // Color of the data points
          pointBorderColor: "blue", // Border color of the data points
          pointRadius: 5, // Radius of the data points when not hovered
          pointHoverRadius: 7, // Radius of the data points when hovered
        },
      ],
    };
  };
  return (
    <>
      <Head>
        <title>MergeMeteo</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="body-font relative w-full rounded-b-lg border-b-2 bg-firstLayer text-gray-700">
        <div className="max-w-7x1 container mx-auto flex flex-col flex-wrap items-center justify-between py-5 md:flex-row">
          <a
            href="/"
            className="relative z-10 flex w-auto select-none items-center text-2xl font-extrabold leading-none text-white"
          >
            MergeMeteo.
          </a>

          <nav className="flex flex-row gap-1">
            {currPage=='/forecast'&& (
            <a
              className="border-slate-400 flex rounded-xl border-2 bg-thirdLayer p-3"
              href="/"
            >
              Last Week
            </a>
            )}
            {/* <div className="border-slate-400 flex rounded-xl border-2 bg-thirdLayer p-3">
              {!user.isSignedIn && (
                <div className="flex justify-center">
                  <SignInButton />
                </div>
              )}
              {user.isSignedIn && <SignOutButton />}
            </div> */}
          </nav>
        </div>
      </section>
      <main className="flex justify-center p-4">
        <div className="m-4 flex flex-col rounded-lg border-2 border-solidborder-gray-200 bg-firstLayer ">
          <ul className="flex flex-col flex-wrap justify-around border-gray-200 text-center text-xl font-bold leading-none text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {dataCities?.map((city) => (
              <li className="mr-2">
                <Button
                  key={city.id}
                  onClick={() => setCity(city.id)}
                  aria-current="page"
                  className="active m-6  inline-block rounded-lg bg-secondLayer p-10 text-white dark:bg-gray-800 dark:text-blue-500"
                >
                  {city.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-slate-600 m-4 p-4 flex flex-grow flex-col rounded-lg border-2 border-solid bg-secondLayer">
          {!city && (
            <div className="flex flex-col p-4 justify-center rounded-lg border-2 border-solid bg-thirdLayer">
            <p className="flex justify-center font-mono font-semibold text-xl">Please select a city</p>
            <div className="flex p-4 m-4 justify-center rounded-lg border-2 border-solid bg-gray-400">
              <p>After selecting a city, you will be presented with information about the <span className="underline">next week</span> from three different weather forecast sources.</p>
            </div>
          </div>
          )}
          {city && (
            <div className="border-slate-400 m-4 max-h-fit flex-grow flex-col rounded-lg border-2 border-solid bg-secondLayer ">
              {/* <div className="flex-row justify-center p-4">
                Today from the past week
                <p> current time: {dataDaliValiForNextWeek?.length}</p>
                <p>
                  {" "}
                  Tmax: {Math.round(SumAvg(dataDaliValiForNextWeek).avgTmax)}
                </p>
                <p>
                  {" "}
                  Tmin: {Math.round(SumAvg(dataDaliValiForNextWeek).avgTmin)}
                </p>
                <p>
                  {" "}
                  Thum: {Math.round(SumAvg(dataDaliValiForNextWeek).avgThum)}
                </p>
                <p>
                  {dataDaliValiForToday?.map(({ createdAt, forecastDay }) =>
              forecastDay.getDate()
            )}
                </p>
              </div> */}
              {/* {SumAvg(dataDaliValiForToday).avgTmax} */}
              {/* <div>
                <h1>Weather Averages</h1>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Average Max Temperature (°C)</th>
                      <th>Average Min Temperature (°C)</th>
                      <th>Average Humidity (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(averageDataForTodayDali).map((date) => (
                      <tr key={date}>
                        <td>{date}</td>
                        <td>{averageDataForTodayDali[date].avgTmax.toFixed(2)}</td>
                        <td>{averageDataForTodayDali[date].avgTmin.toFixed(2)}</td>
                        <td>
                          {averageDataForTodayDali[date].avgHumidity.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>*/}

              <div className="border-slate-400 m-4 flex max-h-fit flex-grow flex-col rounded-lg border-2 border-solid bg-thirdLayer p-4 ">
                <div className="flex flex-row justify-center p-4">
                  <p className="font-mono font-semibold underline-offset-8 underline text-lg">From DaliVali for next week</p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line
                      data={chartfuncDay(averageDataForNextWeekDali)}
                      options={chartOptions}
                    ></Line>
                  </div>
                  <div className="border-slate-400 flex w-1/2 flex-row flex-wrap gap-4">
                    {Object.keys(averageDataForNextWeekDali).map((date) => (
                      <div className=" rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">
                          For: {date}
                        </h2>
                        <p className="text-gray-600">
                          Max Temp:{" "}
                          {averageDataForNextWeekDali[date]?.avgTmax.toFixed(2)}{" "}
                          °C
                        </p>
                        <p className="text-gray-600">
                          Min Temp:{" "}
                          {averageDataForNextWeekDali[date]?.avgTmin.toFixed(2)}{" "}
                          °C
                        </p>
                        <p className="text-gray-600">
                          Hum:{" "}
                          {averageDataForNextWeekDali[
                            date
                          ]?.avgHumidity.toFixed(2)}{" "}
                          %
                        </p>
                        <div className="mt-4">
                        <Link
                              //onClick={() => fetchForDetailed(date, city.toString())}
                              className="text-gray-800 hover:underline" href={{
                                pathname:'/detailed',
                                query:{
                                  date: date,
                                  cityId: city,
                                  provider: 'dali'
                                }
                              }}                            >
                              Details about this day
                            </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* cards for freemeteo ----------------------------------------------------- */}
              <div className="border-slate-400 m-4 flex max-h-fit flex-grow flex-col rounded-lg border-2 border-solid bg-thirdLayer p-4 ">
                <div className="flex flex-row justify-center p-4">
                  <p className="font-mono font-semibold underline-offset-8 underline text-lg">From Freemeteo for next week</p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line
                      data={chartfuncF(averageDataForNextWeekFree)}
                      options={chartOptions}
                    ></Line>
                  </div>
                  <div className="border-slate-400 flex w-1/2 flex-row flex-wrap gap-4">
                    {Object.keys(averageDataForNextWeekFree).map((date) => (
                      <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">
                          For: {date}
                        </h2>
                        <p className="text-gray-600">
                          Max Temp:{" "}
                          {averageDataForNextWeekFree[date]?.avgTmax.toFixed(2)}{" "}
                          °C
                        </p>
                        <p className="text-gray-600">
                          Min Temp:{" "}
                          {averageDataForNextWeekFree[date]?.avgTmin.toFixed(2)}{" "}
                          °C
                        </p>
                        {/* <p className="text-gray-600">
                  Hum: {averageDataForTodayFree[date].avgHumidity.toFixed(2)} %
                </p> */}
                        <div className="mt-4">
                        <Link
                              //onClick={() => fetchForDetailed(date, city.toString())}
                              className="text-gray-800 hover:underline" href={{
                                pathname:'/detailed',
                                query:{
                                  date: date,
                                  cityId: city,
                                  provider: 'free'
                                }
                              }}                            >
                              Details about this day
                            </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* ---------------------------------------------- */}
              <div className="border-slate-400 m-4 flex max-h-fit flex-grow flex-col rounded-lg border-2 border-solid bg-thirdLayer p-4 ">
                <div className="flex flex-row justify-center p-4">
                  <p className="font-mono font-semibold underline-offset-8 underline text-lg">From Sinoptik for next week</p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line
                      data={chartfuncDate(averageDataForNextWeekSino)}
                      options={chartOptions}
                    ></Line>
                  </div>
                  <div className="border-slate-400 flex w-1/2 flex-row flex-wrap gap-4">
                    {Object.keys(averageDataForNextWeekSino).map((date) => (
                      <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">
                          For: {date}
                        </h2>
                        <p className="text-gray-600">
                          Max Temp:{" "}
                          {averageDataForNextWeekSino[date]?.avgTmax.toFixed(2)}{" "}
                          °C
                        </p>
                        <p className="text-gray-600">
                          Min Temp:{" "}
                          {averageDataForNextWeekSino[date]?.avgTmin.toFixed(2)}{" "}
                          °C
                        </p>
                        {/* <p className="text-gray-600">
                  Hum: {averageDataForTodayFree[date].avgHumidity.toFixed(2)} %
                </p> */}
                        <div className="mt-4">
                        <Link
                              //onClick={() => fetchForDetailed(date, city.toString())}
                              className="text-gray-800 hover:underline" href={{
                                pathname:'/detailed',
                                query:{
                                  date: date,
                                  cityId: city,
                                  provider: 'sino '
                                }
                              }}                            >
                              Details about this day
                            </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
// h-full w-full
