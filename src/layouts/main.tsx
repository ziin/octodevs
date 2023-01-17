import Head from "next/head";
import type { PropsWithChildren } from "react";
import { ContributeLink } from "../components/ContributeLink";

export const MainLayout = ({ children }: PropsWithChildren) => (
  <>
    <Head>
      <title>Octodevs</title>
      <meta name="description" content="Octodevs - Share your github profile" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    {/* Background image */}
    <div className="fixed right-0 left-0 z-[-1] my-0 mx-auto aspect-[2.06] min-h-[500px] w-full max-w-[1400px] bg-gray-900 bg-worldmap bg-cover bg-top bg-no-repeat bg-blend-soft-light" />

    {/* Contribute button */}
    <ContributeLink />

    <main>{children}</main>
  </>
);
