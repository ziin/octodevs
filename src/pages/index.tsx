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

  const isEmpty = profiles?.length === 0;

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

      <main className="mx-auto mt-2 mb-8 cursor-default px-4 md:container md:max-w-4xl">
        {isEmpty ? (
          <div className="text-center">
            <p className="text-2xl font-medium text-gray-300">
              No profiles found
            </p>
            <p>Be the first to share your github profile</p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between py-2 px-4">
              <p className="font-medium">Developers</p>
              <p className="text-xs">Ordered by number of followers</p>
            </div>
            <ul className="flex flex-col overflow-hidden rounded-md border border-gray-600">
              {profiles?.map((profile, index) => (
                <li
                  className="border-b border-b-gray-600 bg-gray-800/80 p-4 last:border-b-0"
                  key={profile.github}
                >
                  <UserInfo profile={profile} position={index + 1} />
                </li>
              ))}
            </ul>
          </>
        )}
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
