import {
  SignIn,
  SignInButton,
  SignOutButton,
  UserProfile,
  useUser,
} from "@clerk/nextjs";
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
import { router } from "@trpc/server";
import { Router, useRouter } from "next/router";
import { Result } from "postcss";
import { useSearchParams } from "next/navigation";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";

const Home: NextPage = () => {
  const searchParams = useSearchParams();
  console.log(searchParams.get("date"))
  const datestr = searchParams.get("date");

  const [provider, setProvider] = useState(searchParams.get("provider"));

  const { data: queryDataDali } = api.providers.getCertainDateDali.useQuery({
    cityId: Number(searchParams.get("cityId")),
    date: new Date(searchParams.get("date")!),
  });

  const { data: queryDataFree } = api.providers.getCertainDateFree.useQuery({
    cityId: Number(searchParams.get("cityId")),
    date: new Date(searchParams.get("date")!),
  });

  const { data: queryDataSino } = api.providers.getCertainDateSino.useQuery({
    cityId: Number(searchParams.get("cityId")),
    date: new Date(searchParams.get("date")!),
  });

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

          <nav className="flex flex-row gap-5">
            {provider?.toString() != "free" && (
              <button
                onClick={() => setProvider("free")}
                className="border-slate-400 flex rounded-xl border-2 bg-thirdLayer p-3"
              >
                Switch to Freemeteo
              </button>
            )}
            {provider?.toString() != "dali" && (
              <button
                onClick={() => setProvider("dali")}
                className="border-slate-400 flex rounded-xl border-2 bg-thirdLayer p-3"
              >
                Switch to Dalivali
              </button>
            )}
            {provider?.toString() != "sino" && (
              <button
                onClick={() => setProvider("sino")}
                className="border-slate-400 flex rounded-xl border-2 bg-thirdLayer p-3"
              >
                Switch to Sinoptik
              </button>
            )}

            <a
              className="border-slate-400 flex rounded-xl border-2 bg-thirdLayer p-3"
              href="/"
            >
              Last Week
            </a>
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
      <div className="flex justify-center p-4">
        <div className="mt-4 p-4 flex justify-self-center rounded-lg border-2 border-solid border-gray-400 bg-secondLayer ">
          {provider=='dali' && (
            <p className="justify-center font-mono font-medium text-white text-lg">Current provider: Dalivali</p>
          )}
          {provider=='free' && (
            <p className="justify-center font-mono font-medium text-white text-lg">Current provider: Freemeteo</p>
          )}
          {provider=='sino' && (
            <p className="justify-center font-mono font-medium text-white text-lg">Current provider: Sinoptik</p>
          )}
        </div>
      </div>
      <main className="flex justify-center p-4">
        <div className="flex w-2/3 flex-col rounded-lg border-2 border-solid border-gray-400 bg-firstLayer">
          {/* <div className="flex flex-row border-2 border-solid border-blue-500 max-w-4xl"> */}

          <table className="m-4 table-auto text-center rounded-lg border-2 bg-secondLayer">
            <thead>
              <tr>
                <th>From date</th>
                <th>Hour</th>
                <th>Max Temp</th>
                <th>Min Temp</th>
                {provider != "free" && <th>Wind Spd</th>}
                <th>Wind Dir</th>
                {provider == "dali" && <th>Humidity</th>}
                <th>Text</th>
                <th>Img</th>
              </tr>
            </thead>
            <tbody className="rounded-lg p-2">
              {provider == "dali" &&
                queryDataDali?.map((date) => (
                  <tr className="m-2 rounded-lg border-2 border-gray-600 bg-thirdLayer">
                    <td className="p-2">{date.createdAt.toDateString()}</td>
                    <td>{date.createdAt.getHours()}</td>
                    <td>{date.tmax}</td>
                    <td>{date.tmin}</td>
                    <td>{date.wspd}</td>
                    <td>{date.wdir}</td>
                    <td>{date.humidity}</td>
                    <td>{date.text}</td>
                    <td>
                      <img
                        src={`data:image/jpeg;base64,${date.image.src}`}
                        alt="bin img"
                        className="mix-blend-multiply"
                      />
                    </td>
                  </tr>
                ))}
              {provider == "free" &&
                queryDataFree?.map((date) => (
                  <tr className="m-2 rounded-lg border-2 border-gray-600 bg-thirdLayer">
                    <td className="p-2">{date.createdAt.toDateString()}</td>
                    <td>{date.createdAt.getHours()}</td>
                    <td>{date.tmax}</td>
                    <td>{date.tmin}</td>
                    {/* <td>{date.wspd}</td> */}
                    <td>{date.wdir}</td>
                    {/* <td>{date.humidity}</td> */}
                    <td>{date.text}</td>
                    <td>
                      <img
                        src={`data:image/jpeg;base64,${date.image.src}`}
                        alt="bin img"
                        className="mix-blend-multiply"
                      />
                    </td>
                  </tr>
                ))}
              {provider == "sino" &&
                queryDataSino?.map((date) => (
                  <tr className="m-2 rounded-lg border-2 border-gray-600 bg-thirdLayer">
                    <td className="p-2">{date.createdAt.toDateString()}</td>
                    <td>{date.createdAt.getHours()}</td>
                    <td>{date.tmax}</td>
                    <td>{date.tmin}</td>
                    <td>{date.wspd}</td>
                    <td>{date.wdir}</td>
                    <td>{date.text}</td>
                    <td>
                      <img
                        src={`data:image/jpeg;base64,${date.image.src}`}
                        alt="bin img"
                        className="mix-blend-multiply"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {/* </div> */}
      </main>
    </>
  );
};

export default Home;
