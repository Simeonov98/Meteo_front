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
  ListItem,
} from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SetStateAction, useEffect, useState } from "react";
import { api } from "~/utils/api";
// import DaliVali from "./dalivali";
import { Chart } from "chart.js/dist";
import { array, date, symbol } from "zod";

import { format } from "date-fns";
import { create } from "domain";
import { get } from "http";
import { group } from "console";
import { router } from "@trpc/server";
import { Router, useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { exit } from "process";
import { ObjectType } from "@clerk/nextjs/dist/types/server";
import { keys, shift } from ".eslintrc.cjs";
import { ar } from "date-fns/locale";
import { json } from "stream/consumers";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend);

//const TABLE_HEAD = ["From Date", "Tmax avg", "Tmin avg", "CreatedAt"];

const Home: NextPage = () => {
  //const user = useUser();

  const { data: dataCities } = api.cities.getAll.useQuery();

  //const dataProviders: string[] = ["DaliVali", "Sinoptik", "Freemeteo"];
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

  //const [currentDate, setCurrentDate] = useState(new Date());

  //useEffect(() => {
  // This effect will run once when the component is mounted.
  // setCurrentDate(new Date(formatDate(new Date())));
  // }, []);

  const [city, setCity] = useState<number>();

  // const [fdate, setFdate] = useState<Date>();

  //const [provider, setProvider] = useState<string>();

  // const { data: dataFdateDaliVali } = api.providers.getForecastDate.useQuery({
  //   cityId: city,
  //   date: currentDate,
  // });

  // const { data: dataDaliVali } = api.providers.getDaliVali.useQuery({
  //   cityId: city,
  // });

  // const { data: dataSinoptik } = api.providers.getDaliVali.useQuery({ cityId: city });
  // const { data: dataFreemeteo } = api.providers.getDaliVali.useQuery({ cityId: city });
  //////////////////

  const { data: dataDaliValiForToday } =
    api.providers.getForTodayDaysDali.useQuery({ cityId: city });
  const { data: dataFreemeteoForToday } =
    api.providers.getForTodayDaysFree.useQuery({ cityId: city });
  const { data: dataSoinoptikForToday } =
    api.providers.getForTodayDaysSino.useQuery({ cityId: city });
  const { data: LatestDali } = api.providers.getForTodayDaysDaliLatest.useQuery(
    {
      cityId: city,
    }
  );
  const { data: LatestSino } = api.providers.getForTodayDaysSinoLatest.useQuery(
    {
      cityId: city,
    }
  );
  const { data: LatestFree } = api.providers.getForTodayDaysFreeLatest.useQuery(
    {
      cityId: city,
    }
  );
  //console.log(ErrorDataDali)
  function SumAvg(data: any[]): {
    avgTmax: number;
    avgTmin: number;
    avgThum: number;
  } {
    const sumTmax = data?.reduce(
      (acc: any, obj: { _avg: { tmax: any } }) => acc + obj._avg.tmax,
      0
    );
    const sumTmin = data?.reduce(
      (acc: any, obj: { _avg: { tmin: any } }) => acc + obj._avg.tmin,
      0
    );
    const sumThum = data?.reduce(
      (acc: any, obj: { _avg: { humidity: any } }) => acc + obj._avg.humidity,
      0
    );
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
      })[];
    }
  );
  // console.log(groupedByCreateAtDali)
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
      })[];
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
      })[];
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
  function groupBy(arr: any[], property: string) {
    return arr.reduce(function (memo, x) {
      if (!memo[x[property]]) {
        memo[x[property]] = [];
      }
      memo[x[property]].push(x);
      return memo;
    }, {});
  }
  // function shit() {
  //   if (groupedByCreateAtDali) {
  //     // Iterate over the keys (which are numbers)
  //     //console.log(new Date().getDate() , new Date().toTimeString())
  //     for (const key in groupedByCreateAtDali) {
  //       if (groupedByCreateAtDali.hasOwnProperty(key)) {
  //         const arrayOfObjects = groupedByCreateAtDali[key];
  //         // console.log(arrayOfObjects?.length)
  //         const grouped = groupBy(arrayOfObjects, "forecastDay");
  //         //console.log(grouped)
  //         //console.log(JSON.stringify(grouped,null,2))
  //         //console.log(grouped['undefined'][0]['createdAt'])
  //       }
  //     }
  //   }
  // }

  //shit();
  //const latestDaliTmax=LatestDali![0]?._avg.tmax
  // const latestDaliTmin=LatestDali![0]?._avg.tmin
  // const latestDalihumid=LatestDali![0]?._avg.humidity
  function calculateMAE(predicted: number, actual: number) {
    return Math.abs(predicted - actual);
  }
  function calcMaeDali() {
    if (groupedByCreateAtDali) {
      // console.log(groupedByCreateAtDali)
      const latestDaliTmax = LatestDali![0]?._avg.tmax;
      const latestDaliTmin = LatestDali![0]?._avg.tmin;
      const latestDalihumid = LatestDali![0]?._avg.humidity;
      //  console.log(latestDaliTmax)
      const arrRes: {
        Tmax: number;
        Tmin: number;
        Humidity: number;
        Date: Date;
      }[] = [];
      const rezrez: {
        maeTmax: number;
        maeTmin: number;
        date: string;
      }[] = [];
      for (const key in groupedByCreateAtDali) {
        if (groupedByCreateAtDali.hasOwnProperty(key)) {
          const arrayOfObjects = groupedByCreateAtDali[key];
          //console.log(arrayOfObjects)
          // for(let i=0;i < arrayOfObjects!.length;i++){
          //   console.log(`Element ${i} of array ${key}:`, arrayOfObjects![i]);
          // }

          arrayOfObjects?.forEach(function (item, index) {
            const curr = item.createdAt.getDate();

            let accObj = {
              Tmax: 0,
              Tmin: 0,
              Humidity: 0,
              Date: new Date(),
            };

            if (curr == arrayOfObjects[index - 1]?.createdAt.getDate()) {
              accObj.Tmax = +item._avg.tmax!;
              accObj.Tmin = +item._avg.tmin!;
              accObj.Humidity = +item._avg.humidity!;
              accObj.Date = item.createdAt;
              arrRes.push(accObj);
            }
            if (curr != arrayOfObjects[index - 1]?.createdAt.getDate()) {
              accObj.Tmax = 0;
              accObj.Tmin = 0;
              accObj.Humidity = 0;
              accObj.Date = item.createdAt;
            }
          });
        }
      }
      //console.log(arrRes);
      const objByDate: { [key: string]: typeof arrRes }[] = [];
      arrRes.forEach((obj) => {
        const dateString = obj.Date.toISOString().split("T")[0];
        if (!objByDate[dateString!]) {
          objByDate[dateString!] = [];
        }

        objByDate[dateString]?.push(obj);
      });
      //console.log(objByDate);

      for (const date in objByDate) {
        if (Object.prototype.hasOwnProperty.call(objByDate, date)) {
          let dailyMax = 0;
          let dailyMin = 0;
          let rezzz = {
            maeTmax: 0,
            maeTmin: 0,
            date: "",
          };
          const smsh = objByDate[date];
          smsh.forEach((obj: any) => {
            const predictTmax = obj.Tmax;
            const predictTmin = obj.Tmin;
            const maeTmax = calculateMAE(predictTmax, latestDaliTmax!);
            const maeTmin = calculateMAE(predictTmin, latestDaliTmin!);
            dailyMax += maeTmax;
            dailyMin += maeTmin;
          });
          const avgMaeMax = dailyMax / smsh.length;
          const avgMaeMin = dailyMin / smsh.length;
          rezzz.maeTmax = avgMaeMax;
          rezzz.maeTmin = avgMaeMin;
          rezzz.date = date;
          //console.log(avgMaeMax,avgMaeMin,date,latestDaliTmax)
          rezrez.push(rezzz);
        }
      }
      //console.log(rezrez)
      return rezrez;
    }
  }
  function calcMaeFree() {
    if (groupedByCreateAtFree) {
      // console.log(groupedByCreateAtDali)
      const latestFreeTmax = LatestFree![0]?._avg!.tmax;
      const latestFreeTmin = LatestFree![0]?._avg!.tmin;
      console.log(LatestFree);
      const arrRes: {
        Tmax: number;
        Tmin: number;

        Date: Date;
      }[] = [];
      const rezrez: {
        maeTmax: number;
        maeTmin: number;
        date: string;
      }[] = [];
      for (const key in groupedByCreateAtFree) {
        if (groupedByCreateAtFree.hasOwnProperty(key)) {
          const arrayOfObjects = groupedByCreateAtFree[key];
          //console.log(arrayOfObjects)
          // for(let i=0;i < arrayOfObjects!.length;i++){
          //   console.log(`Element ${i} of array ${key}:`, arrayOfObjects![i]);
          // }

          arrayOfObjects?.forEach(function (item, index) {
            const curr = item.createdAt.getDate();

            let accObj = {
              Tmax: 0,
              Tmin: 0,

              Date: new Date(),
            };

            if (curr == arrayOfObjects[index - 1]?.createdAt.getDate()) {
              accObj.Tmax = +item._avg.tmax!;
              accObj.Tmin = +item._avg.tmin!;

              accObj.Date = item.createdAt;
              arrRes.push(accObj);
            }
            if (curr != arrayOfObjects[index - 1]?.createdAt.getDate()) {
              accObj.Tmax = 0;
              accObj.Tmin = 0;

              accObj.Date = item.createdAt;
            }
          });
        }
      }
      //console.log(arrRes);
      const objByDate: { [key: string]: typeof arrRes }[] = [];
      arrRes.forEach((obj) => {
        const dateString = obj.Date.toISOString().split("T")[0];
        if (!objByDate[dateString!]) {
          objByDate[dateString!] = [];
        }

        objByDate[dateString]?.push(obj);
      });
      //console.log(objByDate);

      for (const date in objByDate) {
        if (Object.prototype.hasOwnProperty.call(objByDate, date)) {
          let dailyMax = 0;
          let dailyMin = 0;
          let rezzz = {
            maeTmax: 0,
            maeTmin: 0,
            date: "",
          };
          const smsh = objByDate[date];
          smsh.forEach((obj: any) => {
            const predictTmax = obj.Tmax;
            const predictTmin = obj.Tmin;
            const maeTmax = calculateMAE(predictTmax, latestFreeTmax!);
            const maeTmin = calculateMAE(predictTmin, latestFreeTmin!);
            dailyMax += maeTmax;
            dailyMin += maeTmin;
          });
          const avgMaeMax = dailyMax / smsh.length;
          const avgMaeMin = dailyMin / smsh.length;
          rezzz.maeTmax = avgMaeMax;
          rezzz.maeTmin = avgMaeMin;
          rezzz.date = date;
          //console.log(avgMaeMax,avgMaeMin,date,latestDaliTmax)
          rezrez.push(rezzz);
        }
      }
      //console.log(rezrez)
      return rezrez;
    }
  }
  function calcMaeSino() {
    if (groupedByCreateAtSino) {
      // console.log(groupedByCreateAtDali)
      const latestSinoTmax = LatestSino![0]?._avg.tmax;
      const latestSinoTmin = LatestSino![0]?._avg.tmin;
      //console.log(latestSinoTmax)
      const arrRes: {
        Tmax: number;
        Tmin: number;

        Date: Date;
      }[] = [];
      const rezrez: {
        maeTmax: number;
        maeTmin: number;
        date: string;
      }[] = [];
      for (const key in groupedByCreateAtSino) {
        if (groupedByCreateAtSino.hasOwnProperty(key)) {
          const arrayOfObjects = groupedByCreateAtSino[key];
          //console.log(arrayOfObjects)
          // for(let i=0;i < arrayOfObjects!.length;i++){
          //   console.log(`Element ${i} of array ${key}:`, arrayOfObjects![i]);
          // }

          arrayOfObjects?.forEach(function (item, index) {
            const curr = item.createdAt.getDate();

            let accObj = {
              Tmax: 0,
              Tmin: 0,

              Date: new Date(),
            };

            if (curr == arrayOfObjects[index - 1]?.createdAt.getDate()) {
              accObj.Tmax = +item._avg.tmax!;
              accObj.Tmin = +item._avg.tmin!;

              accObj.Date = item.createdAt;
              arrRes.push(accObj);
            }
            if (curr != arrayOfObjects[index - 1]?.createdAt.getDate()) {
              accObj.Tmax = 0;
              accObj.Tmin = 0;

              accObj.Date = item.createdAt;
            }
          });
        }
      }
      //console.log(arrRes);
      const objByDate: { [key: string]: typeof arrRes }[] = [];
      arrRes.forEach((obj) => {
        const dateString = obj.Date.toISOString().split("T")[0];
        if (!objByDate[dateString!]) {
          objByDate[dateString!] = [];
        }

        objByDate[dateString]?.push(obj);
      });
      //console.log(objByDate);

      for (const date in objByDate) {
        if (Object.prototype.hasOwnProperty.call(objByDate, date)) {
          let dailyMax = 0;
          let dailyMin = 0;
          let rezzz = {
            maeTmax: 0,
            maeTmin: 0,
            date: "",
          };
          const smsh = objByDate[date];
          smsh.forEach((obj: any) => {
            const predictTmax = obj.Tmax;
            const predictTmin = obj.Tmin;
            const maeTmax = calculateMAE(predictTmax, latestSinoTmax!);
            const maeTmin = calculateMAE(predictTmin, latestSinoTmin!);
            dailyMax += maeTmax;
            dailyMin += maeTmin;
          });
          const avgMaeMax = dailyMax / smsh.length;
          const avgMaeMin = dailyMin / smsh.length;
          rezzz.maeTmax = avgMaeMax;
          rezzz.maeTmin = avgMaeMin;
          rezzz.date = date;
          //console.log(avgMaeMax,avgMaeMin,date,latestDaliTmax)
          rezrez.push(rezzz);
        }
      }
      //console.log(rezrez)  //  console.log(latestFreeTmax)

      return rezrez;
    }
  }
  const someData1 = calcMaeDali();
  const someData2 = calcMaeFree();
  const someData3 = calcMaeSino();
  const DateTrSomeData1 = someData1?.map((elem) => elem.date);
  const TminTrSomeData1 = someData1?.map((elem) => elem.maeTmin);
  const TmaxTrSomeData1 = someData1?.map((elem) => elem.maeTmax);
  const DateTrSomeData2 = someData2?.map((elem) => elem.date);
  const TminTrSomeData2 = someData2?.map((elem) => elem.maeTmin);
  const TmaxTrSomeData2 = someData2?.map((elem) => elem.maeTmax);
  const DateTrSomeData3 = someData3?.map((elem) => elem.date);
  const TminTrSomeData3 = someData3?.map((elem) => elem.maeTmin);
  const TmaxTrSomeData3 = someData3?.map((elem) => elem.maeTmax);

  const SD1AvgTmax = TmaxTrSomeData1
    ? TmaxTrSomeData1.reduce((a, b) => a + b, 0) / TmaxTrSomeData1!.length
    : 0;
  const SD2AvgTmax = TmaxTrSomeData2
    ? TmaxTrSomeData2.reduce((a, b) => a + b, 0) / TmaxTrSomeData2!.length
    : 0;

  const SD3AvgTmax = TmaxTrSomeData3
    ? TmaxTrSomeData3.reduce((a, b) => a + b, 0) / TmaxTrSomeData3!.length
    : 0;
  const SD1AvgTmin = TminTrSomeData1
    ? TminTrSomeData1.reduce((a, b) => a + b, 0) / TminTrSomeData1!.length
    : 0;
  const SD2AvgTmin = TminTrSomeData2
    ? TminTrSomeData2.reduce((a, b) => a + b, 0) / TminTrSomeData2!.length
    : 0;
  const SD3AvgTmin = TminTrSomeData3
    ? TminTrSomeData3.reduce((a, b) => a + b, 0) / TminTrSomeData3!.length
    : 0;

  //  console.log(TmaxTrSomeData2)
  //  console.log(TminTrSomeData2)
  // console.log(DatetransformedSomeData)
  // console.log(TmaxTrSomeData1, TmaxTrSomeData2, TmaxTrSomeData3);
  // function ArrayAvg(arr: number[] | undefined){
  //   let i=0, summ=0,ArrayLen = arr.length;
  //   while (i<ArrayLen){
  //     summ+=arr[i++];
  //   }
  //   return summ/ArrayLen
  // }
  type Result = {
    [key: string]: {
      avgTmax: number;
      avgTmin: number;
      avgHumidity: number;
    };
  };
  type ResultF = {
    [key: string]: {
      avgTmax: number;
      avgTmin: number;
      //avgHumidity:number,
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
  type avgResF = {
    [key: string]: {
      tmaxSum: number;
      tminSum: number;

      count: number;
    };
  };
  function calculateAverages(data: any) {
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
  function calculateAveragesF(data: any) {
    const reformattedData: avgResF = {};

    // Reformat the createdAt date and calculate averages
    for (const key in data) {
      const entries = data[key];
      for (const entry of entries) {
        const createdAt = new Date(entry.createdAt).toISOString().slice(0, 10); // Extract date part
        if (!reformattedData[createdAt]) {
          reformattedData[createdAt] = {
            tmaxSum: 0,
            tminSum: 0,
            //humiditySum: 0,
            count: 0,
          };
        }
        if (entry._avg.tmax !== null) {
          reformattedData[createdAt]!.tmaxSum += entry._avg.tmax;
          reformattedData[createdAt]!.tminSum += entry._avg.tmin;
          //reformattedData[createdAt]!.humiditySum += entry._avg.humidity;
          reformattedData[createdAt]!.count++;
        }
      }
    }

    // Calculate averages and format output
    const result: ResultF = {};
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
  const averageDataForTodayDali = calculateAverages(groupedByCreateAtDali);
  const averageDataForTodayFree = calculateAveragesF(groupedByCreateAtFree);
  const averageDataForTodaySino = calculateAverages(groupedByCreateAtSino);
  //console.log(averageDataForTodayDali);

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
  function chartfuncErr(
    data1: any[] | undefined,
    data2: number[] | undefined,
    data3: number[] | undefined
  ) {
    return {
      labels: data1,
      // labels: dataFdateDaliVali?.map((date) => date.date.toString()).reverse(),
      datasets: [
        {
          label: "Max Temp MAE",
          data: data2,
          fill: false,
          borderColor: "rgb(255, 69, 0)",
          tention: 0.7,
          pointBackgroundColor: "red", // Color of the data points
          pointBorderColor: "red", // Border color of the data points
          pointRadius: 5, // Radius of the data points when not hovered
          pointHoverRadius: 7, // Radius of the data points when hovered
        },
        {
          label: "Min Temp MAE",
          data: data3,
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
  function chartfunc(data: Result) {
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
  function chartfuncF(data: ResultF) {
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

  // Format the current date as a datetime string using date-fns
  //const formattedDateTime = format(
  //currentrrDate,
  //"yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
  //);
  //const router=useRouter()

  //const [dateForDetailed, setDateForDetailed] = useState(new Date())

  //const {data: queryData} =  api.providers.getCertainDateDali.useQuery({ cityId: city, date: dateForDetailed })

  // const fetchForDetailed = async (fromButton: any, city: string) => {

  //   setDateForDetailed(new Date(fromButton))
  //   router.push({
  //     pathname:"/detailed",
  //     query:{data: [JSON.stringify(dateForDetailed),JSON.stringify(city)]}
  //     //query:{data:[JSON.stringify(dateForDetailed),JSON.stringify(city.toString())]}
  //   })
  // }
  //const FinalArr = func2(someData1,someData2,someData3)
  /////////
  return (
    <>
      <Head>
        <title>MergeMeteo</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="body-font relative w-full rounded-b-lg border-b-2 bg-firstLayer px-8 text-gray-700">
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
        <div className="m-4 flex flex-col rounded-lg border-2 border-solid border-gray-200 bg-firstLayer ">
          <ul className="flex flex-col flex-wrap justify-around border-gray-200 text-center text-xl font-bold leading-none text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {dataCities?.map((city) => (
              <li className="mr-2">
                <Button
                  key={city.id}
                  onClick={() => setCity(city.id)}
                  aria-current="page"
                  className="active m-6 inline-block rounded-lg bg-secondLayer p-10 text-white dark:bg-gray-800 dark:text-blue-500"
                >
                  {city.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-slate-600 m-4 flex flex-grow flex-col rounded-lg border-2 border-solid bg-secondLayer p-4">
          {!city && (
            <div className="flex flex-col justify-center rounded-lg border-2 border-solid bg-thirdLayer p-4">
              <p className="font-mono flex justify-center text-xl font-semibold">
                Please select a city
              </p>
              <div className="m-4 flex justify-center rounded-lg border-2 border-solid bg-gray-400 p-4">
                <p>
                  After selecting a city, you will be presented with information
                  about the <span className="underline">past week</span> from
                  three different weather forecast sources.
                </p>
              </div>
            </div>
          )}
          {city && (
            <div className="border-slate-400 m-4 flex max-h-fit flex-grow flex-col rounded-lg border-2 border-solid bg-secondLayer ">
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
                
                <div className="flex flex-row justify-center">
                  <div className="flex flex-col gap-2 p-4">
                    <p className="font-mono text-md font-semibold">
                      The average MAE for Tmax from the different providers for
                      today is:
                    </p>
                    <p>Dalivali: {SD1AvgTmax.toFixed(2)} </p>
                    <p>Freemeteo: {SD2AvgTmax.toFixed(2)} </p>
                    <p>Sinoptik: {SD3AvgTmax.toFixed(2)} </p>
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <p className="font-mono text-md font-semibold">
                      The average MAE for Tmin from the different providers for
                      today is:</p>
                      <p>Dalivali: {SD1AvgTmin.toFixed(2)} </p>
                      <p>Freemeteo: {SD2AvgTmin.toFixed(2)} </p>
                      <p>Sinoptik: {SD3AvgTmin.toFixed(2)} </p>
                    
                  </div>
                </div>
              </div>

              <div className="border-slate-400 m-4 flex max-h-fit flex-grow flex-col rounded-lg border-2 border-solid bg-thirdLayer p-4 ">
                <div className="flex flex-row justify-center p-4">
                  <p className="font-mono text-lg font-semibold underline underline-offset-8">
                    From Dalivali for Today
                  </p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line
                      data={chartfunc(averageDataForTodayDali)}
                      options={chartOptions}
                    ></Line>
                    <Line
                      data={chartfuncErr(
                        DateTrSomeData1,
                        TmaxTrSomeData1,
                        TminTrSomeData1
                      )}
                      options={chartOptions}
                    ></Line>
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
                            <Link
                              //onClick={() => fetchForDetailed(date, city.toString())}
                              className="text-gray-800 hover:underline"
                              href={{
                                pathname: "/detailed",
                                query: {
                                  date: date,
                                  cityId: city,
                                  provider: "dali",
                                },
                              }}
                            >
                              Details about this day
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              {/* cards for freemeteo ----------------------------------------------------- */}
              <div className="border-slate-400 m-4 max-h-fit flex-grow flex-col items-center justify-center rounded-lg border-2 border-solid bg-thirdLayer p-4 ">
                <div className="flex flex-row justify-center p-4">
                  <p className="font-mono text-lg font-semibold underline underline-offset-8">
                    From Freemeteo for Today
                  </p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line
                      data={chartfuncF(averageDataForTodayFree)}
                      options={chartOptions}
                    ></Line>
                    <Line
                      data={chartfuncErr(
                        DateTrSomeData2,
                        TmaxTrSomeData2,
                        TminTrSomeData2
                      )}
                      options={chartOptions}
                    ></Line>
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
                          <Link
                            //onClick={() => fetchForDetailed(date, city.toString())}
                            className="text-gray-800 hover:underline"
                            href={{
                              pathname: "/detailed",
                              query: {
                                date: date,
                                cityId: city,
                                provider: "free",
                              },
                            }}
                          >
                            Details about this day
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* ---------------------------------------------- */}
              <div className="border-slate-400 m-4 max-h-fit flex-grow flex-col items-center justify-center rounded-lg border-2 border-solid bg-thirdLayer p-4 ">
                <div className="flex flex-row justify-center p-4">
                  <p className="font-mono text-lg font-semibold underline underline-offset-8">
                    From Sinoptik for Today
                  </p>
                </div>
                <div className="flex flex-row">
                  <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
                    <Line
                      data={chartfunc(averageDataForTodaySino)}
                      options={chartOptions}
                    ></Line>
                    <Line
                      data={chartfuncErr(
                        DateTrSomeData3,
                        TmaxTrSomeData3,
                        TminTrSomeData3
                      )}
                      options={chartOptions}
                    ></Line>
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
                            <Link
                              //onClick={() => fetchForDetailed(date, city.toString())}
                              className="text-gray-800 hover:underline"
                              href={{
                                pathname: "/detailed",
                                query: {
                                  date: date,
                                  cityId: city,
                                  provider: "sino",
                                },
                              }}
                            >
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
