import type { GetStaticProps } from "next";
import superjson from "superjson";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { type NextPage } from "next";
import Head from "next/head";
import { Header } from "../components/Header";
import { UserInfo } from "../components/UserInfo";
import { createContextInner } from "../server/trpc/context";
import { appRouter } from "../server/trpc/router/_app";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: profiles } = trpc.profile.getMany.useQuery();
  return (
    <>
      <Head>
        <title>Octodevs</title>
        <meta
          name="description"
          content="Octodevs - Share your github profile"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="mx-auto mt-2 px-4 md:container md:max-w-4xl">
        <ul className="flex flex-col rounded-md border border-slate-300">
          {profiles?.map((profile) => (
            <li
              className="border-b border-b-slate-300 p-4 last:border-b-0"
              key={profile.github}
            >
              <UserInfo profile={profile} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const ssgHelper = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson, // optional - adds superjson serialization
  });

  await ssgHelper.profile.getMany.prefetch();

  return {
    props: {
      trpcState: ssgHelper.dehydrate(),
    },
    revalidate: 1,
  };
};
