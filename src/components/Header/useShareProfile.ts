import { trpc } from "../../utils/trpc";

export function useShareProfile() {
  const { data: profile, isLoading: isLoadingProfile } =
    trpc.profile.me.useQuery();
  const utils = trpc.useContext();

  const { mutate: publish, isLoading: isPublishing } =
    trpc.profile.publish.useMutation({
      onMutate: () => {
        utils.profile.getMany.cancel();
        utils.profile.me.cancel();

        const prev = utils.profile.getMany.getData();

        if (prev !== undefined && profile) {
          const newProfile = { ...profile, published: true };
          utils.profile.me.setData(undefined, newProfile);
          utils.profile.getMany.setData(
            undefined,
            [...prev, newProfile].sort((a, b) => b.followers - a.followers),
          );
        }

        return { prev };
      },
      onError: (err, newProfile, context) => {
        utils.profile.getMany.setData(undefined, context?.prev);
        utils.profile.me.setData(undefined, profile);
      },
      onSettled: () => {
        utils.profile.me.invalidate();
        utils.profile.getMany.invalidate();
      },
    });
  const { mutate: unpublish, isLoading: isUnpublishing } =
    trpc.profile.unpublish.useMutation({
      onMutate: () => {
        utils.profile.getMany.cancel();
        utils.profile.me.cancel();

        const prev = utils.profile.getMany.getData();

        if (prev !== undefined && profile) {
          utils.profile.me.setData(undefined, { ...profile, published: false });
          utils.profile.getMany.setData(
            undefined,
            prev.filter((p) => p.userId !== profile.userId),
          );
        }

        return { prev };
      },
      onError: (err, newProfile, context) => {
        utils.profile.getMany.setData(undefined, context?.prev);
        utils.profile.me.setData(undefined, profile);
      },
      onSettled: () => {
        utils.profile.me.invalidate();
        utils.profile.getMany.invalidate();
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
