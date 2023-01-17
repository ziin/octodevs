import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { trpc } from "../../utils/trpc";

export function useProfilesPaginated({ pageSize = 8 }) {
  const {
    data: profiles,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.profile.getPaginated.useInfiniteQuery(
    {
      limit: pageSize,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const isEmpty = profiles?.pages?.length === 0;

  return {
    profiles,
    isFetchingNextPage,
    isEmpty,
    ref,
  };
}
