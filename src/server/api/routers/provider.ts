import { clientCallTypeToProcedureType } from "@trpc/client";
import { object, z } from "zod";
// import DaliVali from "~/pages/dalivali";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

//const sevenDaysAgo: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

// const DateTimeFilterSchema = z.object({
//   gte: z.date().optional(),
//   lte: z.date().optional(),
// });

// type DateTimeFilter = z.infer<typeof DateTimeFilterSchema>;

export const providersRouter = createTRPCRouter({
  getDaliVali: publicProcedure
    .input(z.object({ cityId: z.number().optional() }))
    .query(({ ctx, input }) => {
      if (!input.cityId) return [];
      return ctx.prisma.dalivali.findMany({
        where: {
          cityId: {
            equals: input.cityId,
          },
        },
        take: 10,
      });
    }),
  getLast10Days: publicProcedure
    .input(z.object({ cityId: z.number().optional() }))
    .query(({ ctx, input }) => {
      if (!input.cityId) return [];
      return ctx.prisma.dalivali.groupBy({
        by: ["forecastDay", "createdAt"],
        where: {
          cityId: {
            equals: input.cityId,
          },
          forecastDay: {
            gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }],
        _avg: { tmax: true, tmin: true },

        
      });
    }),
    getForTodayDaysDali: publicProcedure.input(z.object({cityId: z.number().optional()})).query(async ({ ctx,input }) => {
      if (!input.cityId) return [];
      return ctx.prisma.dalivali.groupBy({
        by:['forecastDay','createdAt',],
        _avg: { tmax: true, tmin: true, humidity:true },
        where: {
          forecastDay: {
            equals: new Date(Date.now())
              .toISOString()
              .split("T")[0]
              ?.concat("T00:00:00.000Z"),
          },
          cityId:{
            equals:input.cityId
          }
          
        },
        orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }]
        
      });
    }),
    getForTodayDaysFree:publicProcedure.input(z.object({cityId: z.number().optional()})).query(async ({ ctx,input }) => {
      if (!input.cityId) return [];
      return ctx.prisma.freemeteo.groupBy({
        by:['forecastDay','createdAt',],
        _avg: { tmax: true, tmin: true },
        where: {
          forecastDay: {
            equals: new Date(Date.now())
              .toISOString()
              .split("T")[0]
              ?.concat("T00:00:00.000Z"),
          },
          cityId:{
            equals:input.cityId
          }
          
        },
        orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }]
        
      });
    }),
    getForTodayDaysSino: publicProcedure.input(z.object({cityId: z.number().optional()})).query(async ({ ctx,input }) => {
      if (!input.cityId) return [];
      return ctx.prisma.sinoptik.groupBy({
        by:['forecastDate','createdAt',],
        _avg: { tmax: true, tmin: true },
        where: {
          forecastDate: {
            equals: new Date(Date.now())
              .toISOString()
              .split("T")[0]
              ?.concat("T00:00:00.000Z"),
          },
          cityId:{
            equals:input.cityId
          }
          
        },
        orderBy: [{ createdAt: "desc" }, { forecastDate: "desc" }]
        
      });
    }),
    getForNextWeekDali: publicProcedure.input(z.object({cityId: z.number().optional()})).query(async ({ctx,input})=>{
      if (!input.cityId) return [];
      const res = await ctx.prisma.dalivali.groupBy({
        by:['forecastDay','createdAt',],
        _avg: { tmax: true, tmin: true, humidity:true },
        where: {
          forecastDay: {
            gt: new Date(Date.now())
              .toISOString()
              .split("T")[0]
              ?.concat("T00:00:00.000Z"),
          },
          cityId:{
            equals:input.cityId
          }
          
        },
        orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }]
        
      });
      console.log(res)
      return res;
    }),
    getForNextWeekSino: publicProcedure.input(z.object({cityId: z.number().optional()})).query(async ({ctx,input})=>{
      if (!input.cityId) return [];
      return ctx.prisma.sinoptik.groupBy({
        by:['forecastDate','createdAt',],
        _avg: { tmax: true, tmin: true,},
        where: {
          forecastDate: {
            gt: new Date(Date.now())
              .toISOString()
              .split("T")[0]
              ?.concat("T00:00:00.000Z"),
          },
          cityId:{
            equals:input.cityId
          }
          
        },
        orderBy: [{ createdAt: "desc" }, { forecastDate: "desc" }]
        
      });
    }),
    getForNextWeekFree: publicProcedure.input(z.object({cityId: z.number().optional()})).query(async ({ctx,input})=>{
      if (!input.cityId) return [];
      return ctx.prisma.freemeteo.groupBy({
        by:['forecastDay','createdAt',],
        _avg: { tmax: true, tmin: true,  },
        where: {
          forecastDay: {
            gt: new Date(Date.now())
              .toISOString()
              .split("T")[0]
              ?.concat("T00:00:00.000Z"),
          },
          cityId:{
            equals:input.cityId
          }
          
        },
        orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }]
        
      });
    }),
    
  
  // getForecastDate: publicProcedure
  //   .input(
  //     z.object({ cityId: z.number().optional(), date: z.date().optional() })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     if (!input.cityId) return [];
  //     if (!input.date) return [];
  //     let res = await ctx.prisma.dalivali.findMany({
  //       where: {
  //         cityId: {
  //           equals: input.cityId,
  //         },
  //         forecastDay: {
  //           equals: input.date.toISOString(),
  //         },
  //       },
  //       orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }],
  //     });
  //     // Assuming `res` is the array of objects retrieved from the database

  //     // Initialize averages as an empty object
  //     const averages: {
  //       [date: string]: {
  //         sumTmax: number;
  //         countTmax: number;
  //         sumTmin: number;
  //         countTmin: number;
  //       };
  //     } = {};

  //     // Calculate the sum and count of tmax and tmin for each date
  //     res.forEach((record) => {
  //       const { createdAt, tmax, tmin } = record;
  //       if (createdAt && tmax !== undefined && tmin !== undefined) {
  //         const date = createdAt.toISOString().split("T")[0]; // Extract the date part from the createdAt

  //         if (date !== undefined) {
  //           if (averages[date]) {
  //             averages[date].sumTmax += tmax;
  //             averages[date].countTmax++;
  //             averages[date].sumTmin += tmin;
  //             averages[date].countTmin++;
  //           } else {
  //             averages[date] = {
  //               sumTmax: tmax,
  //               countTmax: 1,
  //               sumTmin: tmin,
  //               countTmin: 1,
  //             };
  //           }
  //         }
  //       }
  //     });

  //     // Calculate the average tmax and tmin for each date
  //     const averageTemperatures = Object.entries(averages).map(
  //       ([date, { sumTmax, countTmax, sumTmin, countTmin }]) => ({
  //         date: date || "", // Provide a default value if date is undefined
  //         averageTmax: (countTmax !== 0 ? sumTmax / countTmax : 0).toFixed(0),
  //         averageTmin: (countTmin !== 0 ? sumTmin / countTmin : 0).toFixed(0),
  //       })
  //     );

  //     return averageTemperatures;
  //   }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.city.findMany();
  }),
});
