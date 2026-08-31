import Link from "next/link";
import { type ReactNode } from "react";

type SiteHeaderProps = {
  showTagline?: boolean;
  children?: ReactNode;
};

export function SiteHeader({ showTagline = true, children }: SiteHeaderProps) {
  return (
    <section className="body-font relative w-full rounded-b-lg border-b-2 bg-firstLayer px-8 text-gray-700">
      <div className="max-w-7x1 container mx-auto flex flex-col flex-wrap items-center justify-between py-5 md:flex-row">
        <Link
          href="/"
          className="relative z-10 flex w-auto select-none items-center text-2xl font-extrabold leading-none text-white"
        >
          MergeMeteo.
        </Link>
        {showTagline && (
          <nav className="flex flex-row">
            <p className="flex flex-col font-bold text-white">
              This app shows the deviation between prognosed weather and
              latest data from different weather sources
            </p>
          </nav>
        )}
        <nav className="flex flex-row gap-1">{children}</nav>
      </div>
    </section>
  );
}
