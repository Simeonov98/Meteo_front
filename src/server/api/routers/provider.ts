import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const cityIdInput = z.object({ cityId: z.number().optional() });
const certainDateInput = z.object({
  cityId: z.number().optional(),
  date: z.date().optional(),
});

/** Midnight UTC today, in the `YYYY-MM-DDT00:00:00.000Z` shape the DB's date columns use. */
function startOfTodayISO() {
  return `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`;
}

/** `equals: today` for "this week so far" queries, `gt: today` for "upcoming" ones. */
function dateRangeFilter(range: "today" | "upcoming") {
  const today = startOfTodayISO();
  return range === "today" ? { equals: today } : { gt: today };
}

type WithBase64Image<T extends { image: { src: Uint8Array } | null }> = Omit<T, "image"> & {
  image: (Omit<NonNullable<T["image"]>, "src"> & { src: string }) | null;
};

/**
 * The scraper's `Image.src` is stored as raw bytes; the client needs it as a
 * data-URI-ready base64 string.
 *
 * `relationMode = "prisma"` (see schema.prisma) means the `imageId` foreign
 * key isn't enforced by Postgres, and in the live data every row's `imageId`
 * is unset — so despite the generated type claiming `image` is always
 * present, it is `null` at runtime for effectively every row. Handle that
 * instead of crashing on `.src` of `null`.
 */
function withBase64Image<T extends { image: { src: Uint8Array } | null }>(
  rows: T[],
): WithBase64Image<T>[] {
  return rows.map((row) => {
    const { image, ...rest } = row;
    if (!image) {
      return { ...rest, image: null } as WithBase64Image<T>;
    }
    const { src, ...imageRest } = image;
    return {
      ...rest,
      image: { ...imageRest, src: Buffer.from(src).toString("base64") },
    } as WithBase64Image<T>;
  });
}

export const providersRouter = createTRPCRouter({
  getForTodayDaysDali: publicProcedure.input(cityIdInput).query(({ ctx, input }) => {
    if (!input.cityId) return [];
    return ctx.prisma.dalivali.groupBy({
      by: ["forecastDay", "createdAt"],
      _avg: { tmax: true, tmin: true, humidity: true },
      where: {
        forecastDay: dateRangeFilter("today"),
        cityId: { equals: input.cityId },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }],
    });
  }),

  getForNextWeekDali: publicProcedure.input(cityIdInput).query(({ ctx, input }) => {
    if (!input.cityId) return [];
    return ctx.prisma.dalivali.groupBy({
      by: ["forecastDay", "createdAt"],
      _avg: { tmax: true, tmin: true, humidity: true },
      where: {
        forecastDay: dateRangeFilter("upcoming"),
        cityId: { equals: input.cityId },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }],
    });
  }),

  getForTodayDaysFree: publicProcedure.input(cityIdInput).query(({ ctx, input }) => {
    if (!input.cityId) return [];
    return ctx.prisma.freemeteo.groupBy({
      by: ["forecastDay", "createdAt"],
      _avg: { tmax: true, tmin: true },
      where: {
        forecastDay: dateRangeFilter("today"),
        cityId: { equals: input.cityId },
        tmax: { not: null },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }],
    });
  }),

  getForNextWeekFree: publicProcedure.input(cityIdInput).query(({ ctx, input }) => {
    if (!input.cityId) return [];
    return ctx.prisma.freemeteo.groupBy({
      by: ["forecastDay", "createdAt"],
      _avg: { tmax: true, tmin: true },
      where: {
        forecastDay: dateRangeFilter("upcoming"),
        cityId: { equals: input.cityId },
        tmax: { not: null },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }],
    });
  }),

  getForTodayDaysSino: publicProcedure.input(cityIdInput).query(({ ctx, input }) => {
    if (!input.cityId) return [];
    return ctx.prisma.sinoptik.groupBy({
      by: ["forecastDate", "createdAt"],
      _avg: { tmax: true, tmin: true },
      where: {
        forecastDate: dateRangeFilter("today"),
        cityId: { equals: input.cityId },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDate: "desc" }],
    });
  }),

  getForNextWeekSino: publicProcedure.input(cityIdInput).query(({ ctx, input }) => {
    if (!input.cityId) return [];
    return ctx.prisma.sinoptik.groupBy({
      by: ["forecastDate", "createdAt"],
      _avg: { tmax: true, tmin: true },
      where: {
        forecastDate: dateRangeFilter("upcoming"),
        cityId: { equals: input.cityId },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDate: "desc" }],
    });
  }),

  getCertainDateDali: publicProcedure.input(certainDateInput).query(async ({ ctx, input }) => {
    if (!input.cityId || !input.date) return [];
    const rows = await ctx.prisma.dalivali.findMany({
      include: { image: true },
      where: {
        cityId: { equals: input.cityId },
        forecastDay: { equals: input.date.toISOString() },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }],
    });
    return withBase64Image(rows);
  }),

  getCertainDateFree: publicProcedure.input(certainDateInput).query(async ({ ctx, input }) => {
    if (!input.cityId || !input.date) return [];
    const rows = await ctx.prisma.freemeteo.findMany({
      include: { image: true },
      where: {
        cityId: { equals: input.cityId },
        forecastDay: { equals: input.date.toISOString() },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDay: "desc" }],
    });
    return withBase64Image(rows);
  }),

  getCertainDateSino: publicProcedure.input(certainDateInput).query(async ({ ctx, input }) => {
    if (!input.cityId || !input.date) return [];
    const rows = await ctx.prisma.sinoptik.findMany({
      include: { image: true },
      where: {
        cityId: { equals: input.cityId },
        forecastDate: { equals: input.date.toISOString() },
      },
      orderBy: [{ createdAt: "desc" }, { forecastDate: "desc" }],
    });
    return withBase64Image(rows);
  }),
});
