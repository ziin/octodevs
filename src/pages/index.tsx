import type { GetStaticProps } from "next";
import superjson from "superjson";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { type NextPage } from "next";
import Head from "next/head";
import { Header } from "../components/Header/Header";
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

      <main className="mx-auto mt-2 cursor-default px-4 md:container md:max-w-4xl">
        <div className="flex flex-col rounded-md border border-gray-600">
          <div className="flex items-baseline justify-between border-b border-b-gray-600 bg-gray-700/50 py-2 px-4">
            <p className="font-medium text-gray-300">Developers</p>
            <p className="text-xs">Ordered by number of followers</p>
          </div>
          <ul>
            {profiles?.map((profile) => (
              <li
                className="border-b border-b-gray-600 p-4 last:border-b-0"
                key={profile.github}
              >
                <UserInfo profile={profile} />
              </li>
            ))}
          </ul>
        </div>
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
    revalidate: 10,
  };
};
