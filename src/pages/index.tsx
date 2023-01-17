import type { GetStaticProps } from "next";
import superjson from "superjson";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { type NextPage } from "next";
import { Header } from "../components/Header/Header";
import { createContextInner } from "../server/trpc/context";
import { appRouter } from "../server/trpc/router/_app";
import { MainLayout } from "../layouts/main";
import { ProfileList } from "../components/Profiles/ProfileList";

const Home: NextPage = () => {
  return (
    <MainLayout>
      <Header />
      <ProfileList />
    </MainLayout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const ssgHelper = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson, // optional - adds superjson serialization
  });

  await ssgHelper.profile.getPaginated.prefetchInfinite({ limit: 8 });

  return {
    props: {
      trpcState: ssgHelper.dehydrate(),
    },
    revalidate: 10,
  };
};
