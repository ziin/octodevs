import { trpc } from "../../utils/trpc";

export function useShareProfile() {
  const { data: profile, isLoading: isLoadingProfile } =
    trpc.profile.me.useQuery();
  const utils = trpc.useContext();

  const { mutate: publish, isLoading: isPublishing } =
    trpc.profile.publish.useMutation({
      onSettled: () => {
        utils.profile.me.invalidate();
        utils.profile.getPaginated.invalidate();
      },
    });
  const { mutate: unpublish, isLoading: isUnpublishing } =
    trpc.profile.unpublish.useMutation({
      onSettled: () => {
        utils.profile.me.invalidate();
        utils.profile.getPaginated.invalidate();
      },
    });

  const isPublished = profile?.published;

  const handlePublish = () => {
    if (isPublished) {
      unpublish();
    } else {
      publish();
    }
  };

  return {
    profile,
    isLoading: isLoadingProfile || isPublishing || isUnpublishing,
    isPublished,
    handlePublish,
  };
}
