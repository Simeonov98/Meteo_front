import { type ReactNode } from "react";

type ProviderSectionProps = {
  title: string;
  chart: ReactNode;
  children: ReactNode;
};

/** The "From <Provider> for <period>" panel: a heading, a chart, and a grid of per-day cards. */
export function ProviderSection({ title, chart, children }: ProviderSectionProps) {
  return (
    <div className="border-slate-400 m-4 flex max-h-fit flex-grow flex-col rounded-lg border-2 border-solid bg-thirdLayer p-4">
      <div className="flex flex-row justify-center p-4">
        <p className="font-mono text-lg font-semibold underline underline-offset-8">
          {title}
        </p>
      </div>
      <div className="flex flex-row">
        <div className="border-slate-400 flex w-1/2 flex-col flex-wrap p-4">
          {chart}
        </div>
        <div className="border-slate-400 flex w-1/2 flex-row flex-wrap gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}
