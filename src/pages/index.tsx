import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Dalivali } from "@prisma/client";
import {
  Card,
  Typography,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { api } from "~/utils/api";

const TABLE_HEAD = ["TMax", "TMin", "Wdir", "Wspd"];

const Home: NextPage = () => {
  const user = useUser();

  const { data } = api.cities.getAll.useQuery();

  const [city, setCity] = useState<number>();

  const { data: dataDaliVali } = api.providers.getDaliVali.useQuery({ cityId: city });
  // const { data: dataSinoptik } = api.providers.getDaliVali.useQuery({ cityId: city });
  // const { data: dataFreemeteo } = api.providers.getDaliVali.useQuery({ cityId: city });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="relative w-full px-8 text-gray-700 bg-firstLayer body-font rounded-b-lg">
          <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7x1">
          <a href="#_" className="relative z-10 flex items-center w-auto text-2xl font-extrabold leading-none text-white select-none">MergeMeteo.</a>
          <nav className="">
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
        <main className="flex h-screen justify-center">
        
        <div className="column w-1/3 border-red-600 border-solid border-2 rounded-lg md:max-w-xl bg-firstLayer">
          

          <Tabs id="custom-animation" value="html">
            <TabsHeader>
              {data?.map((city) => (
                <Tab
                  key={city.id}
                  value={city.name}
                  onClick={() => setCity(city.id)}
                >
                  {city.name}
                </Tab>
              ))}
            </TabsHeader>
            
            {/* <div className="grid grid-flow-col justify-stretch">
            {data?.map((city) => (
              <div
                key={city.id}
                onClick={() => setCity(city.id)}
                className="border-slate-400 justify-self-auto rounded-xl border-b border-l bg-amber-500 p-8 text-center"
              >
                {city.name}
              </div>
            ))}
          </div> */}
            <TabsBody
              animate={{
                initial: { y: 250 },
                mount: { y: 0 },
                unmount: { y: 250 },
              }}
            >
              {city && (
                <div className="flex flex-col">
                  <Card className="h-full w-full overflow-hidden">
                    <table className="w-full min-w-max table-auto text-left">
                      <thead>
                        <tr>
                          {TABLE_HEAD.map((head) => (
                            <th
                              key={head}
                              className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                            >
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                              >
                                {head}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataDaliVali?.map(({ tmax, tmin, wdir, wspd }, index) => (
                          <tr key={index} className="even:bg-blue-gray-50/50">
                            <td className="p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {tmax}
                              </Typography>
                            </td>
                            <td className="p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {tmin}
                              </Typography>
                            </td>
                            <td className="p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {wdir}
                              </Typography>
                            </td>
                            <td className="p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {wspd}
                              </Typography>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>
              )}
            </TabsBody>
          </Tabs>
        </div>
        <div className="column w-1/4 border-slate-600 border-x md:max-w-xl bg-secondLayer"></div>
        <div className="column w-1/4 border-slate-400 border-x md:max-w-xl bg-thirdLayer"></div>
      </main>
    </>
  );
};

export default Home;
// h-full w-full