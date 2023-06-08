import { clientCallTypeToProcedureType } from "@trpc/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const providersRouter = createTRPCRouter({
  getDaliVali: publicProcedure
    .input(z.object({ cityId: z.number().optional()}))
    .query(({ ctx, input }) => {
      if(!input.cityId) return []
      return ctx.prisma.dalivali.findMany({
          where: {
            cityId: {
              equals: input.cityId,
            },
          },
          take: 10
        });
                    
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.city.findMany();
  }),
});
