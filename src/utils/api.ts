/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import { type AppRouter } from "~/server/api/root";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  // @trpc/next@11.18.0's `WithTRPCConfig` type both requires a top-level
  // `transformer` (via `TransformerOptions`, since our router sets one) and
  // forbids it (it also extends the vanilla client's `CreateTRPCClientOptions`,
  // where `transformer` moved to individual links and is typed as a
  // TypeError-branded property) — a genuine inconsistency in that package's
  // own .d.ts, reproducible with transformer present *or* absent. Confirmed
  // by reading node_modules/@trpc/{next,client}/dist/*.d.cts directly; the
  // per-link `transformer: superjson` below is what actually matters at
  // runtime for wire (de)serialization.
  // @ts-expect-error -- see comment above; @trpc/next's own types conflict here
  config() {
    return {
      /**
       * Transformer used by `withTRPC`'s own SSR/SSG state dehydration.
       * (Separate from the per-link transformer below, which is what
       * actually (de)serializes data over the wire.)
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // Transformer used for data de-serialization from the server.
          // @see https://trpc.io/docs/data-transformers
          transformer: superjson,
        }),
      ],
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
