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

import { format } from "date-fns";
import { create } from "domain";
import { get } from "http";
import { group } from "console";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend);

const TABLE_HEAD = ["From Date", "Tmax avg", "Tmin avg", "CreatedAt"];

const Home: NextPage = () => {
  const user = useUser();

  const { data: dataCities } = api.cities.getAll.useQuery();

  const dataProviders: string[] = ["DaliVali", "Sinoptik", "Freemeteo"];
  const datee: Date = new Date();
  datee.setHours(0, 0, 0, 0);

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

  // const { data: dataSinoptik } = api.providers.getDaliVali.useQuery({ cityId: city });
  // const { data: dataFreemeteo } = api.providers.getDaliVali.useQuery({ cityId: city });
  //////////////////

  const { data: dataDaliValiForToday } =
    api.providers.getForTodayDaysDali.useQuery({ cityId: city });
  const { data: dataFreemeteoForToday } =
    api.providers.getForTodayDaysFree.useQuery({ cityId: city });
  const { data: dataSoinoptikForToday } =
    api.providers.getForTodayDaysSino.useQuery({ cityId: city });

  function SumAvg(data: any[]): { avgTmax: number; avgTmin: number; avgThum: number } {
    const sumTmax = data?.reduce((acc: any, obj: { _avg: { tmax: any; }; }) => acc + obj._avg.tmax, 0);
    const sumTmin = data?.reduce((acc: any, obj: { _avg: { tmin: any; }; }) => acc + obj._avg.tmin, 0);
    const sumThum = data?.reduce((acc: any, obj: { _avg: { humidity: any; }; }) => acc + obj._avg.humidity, 0);
    const avgTmax = sumTmax / data.length;
    const avgTmin = sumTmin / data.length;
    const avgThum = sumThum / data.length;
    return { avgTmax, avgTmin, avgThum };
  }

  // const groupByTmax = dataDaliValiForToday?.reduce((acc, dataDaliValiForToday)=>{
  //   const tmaxGroup=dataDaliValiForToday._avg;
  //   if(!acc[tmaxGroup.tmax]){
  //     acc[tmaxGroup.tmax]=[];
  //   }
  //   acc[tmaxGroup.tmax].push(dataDaliValiForToday)
  //   return acc;
  // },{})
  // console.log(groupByTmax)

  //----------------------
  // const arrayForToday=dataDaliValiForToday?.map((dataDaliValiForToday)=>Object.values(dataDaliValiForToday))
  // console.log(arrayForToday)
  // console.log(dataDaliValiForToday?.values())
  //-------------------------------------------------------
  const groupedByCreateAtDali = dataDaliValiForToday?.reduce(
    (groups, item) => {
      // returns an array of objects; Each property of the groupedByCreateAt object represents a date, and the corresponding value is an array containing objects with createdAt dates falling within that date.
      const dateD = item.createdAt.getDate();
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
  console.log(groupedByCreateAtDali);
  //-------------------------------------------
  const groupedByCreateAtFree = dataFreemeteoForToday?.reduce(
    (groups, item) => {
      const dateF = item.createdAt.getDate();
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
  const groupedByCreateAtSino = dataSoinoptikForToday?.reduce(
    (groups, item) => {
      const dateS = item.createdAt.getDate();
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
  //----------------------------------- groups for the func

  //   const averagesByCreatedAt = {};

  // for (const key in groupedByCreateAt) {
  //   if (Object.hasOwnProperty.call(groupedByCreateAt, key)) {
  //     const arrayForCurrentKey = groupedByCreateAt[key];

  //     arrayForCurrentKey.forEach((item) => {
  //       const { createdAt, _avg } = item;
  //       const groupedByCreateAt = new Date(createdAt);
  //       const formattedDate = `${ groupedByCreateAt.getFullYear()}-${( groupedByCreateAt.getMonth() + 1).toString().padStart(2, '0')}-${ groupedByCreateAt.getDate().toString().padStart(2, '0')}`;

  //       if (!averagesByCreatedAt[formattedDate]) {
  //         averagesByCreatedAt[formattedDate] = {
  //           tmax: 0,
  //           tmin: 0,
  //           humidity: 0,
  //           count: 0,
  //         };
  //       }
  //       averagesByCreatedAt[formattedDate].tmax += _avg.tmax;
  //       averagesByCreatedAt[formattedDate].tmin += _avg.tmin;
  //       averagesByCreatedAt[formattedDate].humidity += _avg.humidity;
  //       averagesByCreatedAt[formattedDate].count++;
  //     });
  //   }
  // }

  // // Calculate averages for each createdAt
  // for (const formattedDate in averagesByCreatedAt) {
  //   if (Object.hasOwnProperty.call(averagesByCreatedAt, formattedDate)) {
  //     const { tmax, tmin, humidity, count } = averagesByCreatedAt[formattedDate];
  //     averagesByCreatedAt[formattedDate] = {
  //       tmax: tmax / count,
  //       tmin: tmin / count,
  //       humidity: humidity / count,
  //     };
  //   }
  // }

  // console.log(averagesByCreatedAt);
  //------------------------------ from line to line this returns the averages for each day

  type Result ={ [key: string] : {
    avgTmax:number,
    avgTmin:number,
    avgHumidity:number,
  };}
  type avgRes = {
    [key: string]: {
      tmaxSum: number;
      tminSum: number;
      humiditySum: number;
      count: number;
    };
  };
  function calculateAverages(data:any) {
    const reformattedData: avgRes = {};

    // Reformat the createdAt date and calculate averages
    for (const key in data) {
      const entries = data[key];
      for (const entry of entries) {
        const createdAt = new Date(entry.createdAt).toISOString().slice(0, 10); // Extract date part
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
    const result:Result = {};
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
  const averageDataForTodayDali = calculateAverages(groupedByCreateAtDali);
  const averageDataForTodayFree = calculateAverages(groupedByCreateAtFree);
  const averageDataForTodaySino = calculateAverages(groupedByCreateAtSino);
  console.log(averageDataForTodayDali);

  //---------------------func to do the same

  
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
  //////////
  function chartfunc(data:Result){
    return {
      labels: Object.keys(data)
        .sort()
        .map((forecastDay) => forecastDay.toString()),
      // labels: dataFdateDaliVali?.map((date) => date.date.toString()).reverse(),
      datasets: [
        {
          label: "Tmax",
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
          label: "Tmin",
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

  const currentrrDate = new Date();

  // Format the current date as a datetime string using date-fns
  const formattedDateTime = format(
    currentrrDate,
    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
  );

  //////////

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="body-font relative w-full rounded-b-lg border-b-2 bg-green-400 px-8 text-gray-700">
        <div className="max-w-7x1 container mx-auto flex flex-col flex-wrap items-center justify-between py-5 md:flex-row">
          <a
            href="/"
            className="relative z-10 flex w-auto select-none items-center text-2xl font-extrabold leading-none text-white"
          >
            MergeMeteo.
          </a>

          <nav className="flex flex-row gap-1">
            <a
              className="border-slate-400 flex rounded-xl border-2 bg-thirdLayer p-3"
              href="forecast"
            >
              Forecast
            </a>
            
            <div className="border-slate-400 flex rounded-xl border-2 bg-thirdLayer p-3">
              {!user.isSignedIn && (
                <div className="flex justify-center">
                  <SignInButton />
                </div>
              )}
              {user.isSignedIn && <SignOutButton />}
            </div>
          </nav>
        </div>
      </section>
      <main className="flex justify-center p-4">
        <div className="m-4 flex flex-col rounded-lg border-2 border-solid border-red-600 bg-firstLayer ">
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
        <div className="border-slate-600 m-4 flex flex-grow flex-col rounded-lg border-2 border-solid bg-white">
          {!city && (
            <div className="flex flex-row p-4">
              <p>Select a city</p>
            </div>
          )}
          {city && (
            <div className="border-slate-400 m-4 flex max-h-fit flex-grow flex-col rounded-lg border-2 border-solid bg-thirdLayer ">
              {/* <div className="flex-row justify-center p-4">
                Today from the past week
                <p> current time: {dataDaliValiForToday?.length}</p>
                <p> Tmax: {Math.round(SumAvg(dataDaliValiForToday).avgTmax)}</p>
                <p> Tmin: {Math.round(SumAvg(dataDaliValiForToday).avgTmin)}</p>
                <p> Thum: {Math.round(SumAvg(dataDaliValiForToday).avgThum)}</p>
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
                  <p className="text-white">From DaliVali for Today</p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line data={chartfunc(averageDataForTodayDali)} options={chartOptions}></Line>
                  </div>
                  <div className="border-slate-400 flex w-1/2 flex-row flex-wrap gap-4">
                    {Object.keys(averageDataForTodayDali)
                      .sort()
                      .map((date) => (
                        <div className="rounded-lg bg-white p-6 shadow-md">
                          <h2 className="mb-4 text-xl font-semibold">
                            From: {date}
                          </h2>
                          <p className="text-gray-600">
                            Max Temp:{" "}
                            {averageDataForTodayDali[date]?.avgTmax.toFixed(2)}{" "}
                            °C
                          </p>
                          <p className="text-gray-600">
                            Min Temp:{" "}
                            {averageDataForTodayDali[date]?.avgTmin.toFixed(2)}{" "}
                            °C
                          </p>
                          <p className="text-gray-600">
                            Hum:{" "}
                            {averageDataForTodayDali[date]?.avgHumidity.toFixed(
                              2
                            )}{" "}
                            %
                          </p>
                          <div className="mt-4">
                            <a
                              href="#"
                              className="text-blue-500 hover:underline"
                            >
                              Read more
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              {/* cards for freemeteo ----------------------------------------------------- */}
              <div className="border-slate-400 m-4 max-h-fit flex-grow flex-col items-center justify-center rounded-lg border-2 border-solid bg-thirdLayer p-4 ">
                <div className="flex flex-row justify-center p-4">
                  <p className="text-white">From Freemeteo for Today</p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line data={chartfunc(averageDataForTodayFree)} options={chartOptions}></Line>
                  </div>
                  <div className="border-slate-400 flex w-1/2 flex-row flex-wrap gap-4">
                    {Object.keys(averageDataForTodayFree).map((date) => (
                      <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">
                          From: {date}
                        </h2>
                        <p className="text-gray-600">
                          Max Temp:{" "}
                          {averageDataForTodayFree[date]?.avgTmax.toFixed(2)} °C
                        </p>
                        <p className="text-gray-600">
                          Min Temp:{" "}
                          {averageDataForTodayFree[date]?.avgTmin.toFixed(2)} °C
                        </p>
                        {/* <p className="text-gray-600">
                  Hum: {averageDataForTodayFree[date].avgHumidity.toFixed(2)} %
                </p> */}
                        <div className="mt-4">
                          <a href="#" className="text-blue-500 hover:underline">
                            Read more
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* ---------------------------------------------- */}
              <div className="border-slate-400 m-4 max-h-fit flex-grow flex-col items-center justify-center rounded-lg border-2 border-solid bg-thirdLayer p-4 ">
                <div className="flex flex-row justify-center p-4">
                  <p className="text-white">From Sinoptik for Today</p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line data={chartfunc(averageDataForTodaySino)} options={chartOptions}></Line>
                  </div>
                  <div className="border-slate-400 flex w-1/2 flex-row flex-wrap gap-4">
                    {Object.keys(averageDataForTodaySino)
                      .sort()
                      .map((date) => (
                        <div className="rounded-lg bg-white p-6 shadow-md">
                          <h2 className="mb-4 text-xl font-semibold">
                            From: {date}
                          </h2>
                          <p className="text-gray-600">
                            Max Temp:{" "}
                            {averageDataForTodaySino[date]?.avgTmax.toFixed(2)}{" "}
                            °C
                          </p>
                          <p className="text-gray-600">
                            Min Temp:{" "}
                            {averageDataForTodaySino[date]?.avgTmin.toFixed(2)}{" "}
                            °C
                          </p>
                          {/* <p className="text-gray-600">
                  Hum: {averageDataForTodayFree[date].avgHumidity.toFixed(2)} %
                </p> */}
                          <div className="mt-4">
                            <a
                              href="#"
                              className="text-blue-500 hover:underline"
                            >
                              Read more
                            </a>
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
