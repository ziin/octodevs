import { trpc } from "../../utils/trpc";

export function useShareProfile() {
  const { data: profile, isLoading: isLoadingProfile } =
    trpc.profile.me.useQuery();
  const utils = trpc.useContext();

  const { mutate: publish, isLoading: isPublishing } =
    trpc.profile.publish.useMutation({
      onMutate: () => {
        utils.profile.getPaginated.cancel();
        utils.profile.me.cancel();

        const prev = utils.profile.getPaginated.getData();

        if (prev !== undefined && profile) {
          const newProfile = { ...profile, published: true };
          utils.profile.me.setData(undefined, newProfile);
        }

        return { prev };
      },
      onError: () => {
        utils.profile.me.setData(undefined, profile);
      },
      onSettled: () => {
        utils.profile.me.invalidate();
        utils.profile.getPaginated.invalidate();
      },
    });
  const { mutate: unpublish, isLoading: isUnpublishing } =
    trpc.profile.unpublish.useMutation({
      onMutate: () => {
        utils.profile.getPaginated.cancel();
        utils.profile.me.cancel();

        const prev = utils.profile.getPaginated.getData();

        if (prev !== undefined && profile) {
          utils.profile.me.setData(undefined, { ...profile, published: false });
        }

        return { prev };
      },
      onError: () => {
        utils.profile.me.setData(undefined, profile);
      },
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
