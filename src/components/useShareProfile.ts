import { trpc } from "../utils/trpc";

export function useShareProfile() {
  const { data: profile, isLoading } = trpc.profile.me.useQuery();
  const utils = trpc.useContext();

  const { mutate: publish } = trpc.profile.publish.useMutation({
    onSuccess: () => {
      utils.profile.me.invalidate();
      utils.profile.getMany.invalidate();
    },
  });
  const { mutate: unpublish } = trpc.profile.unpublish.useMutation({
    onSuccess: () => {
      utils.profile.me.invalidate();
      utils.profile.getMany.invalidate();
    },
  });

  const handlePublish = () => {
    if (profile?.published) {
      unpublish();
    } else {
      publish();
    }
  };

  const isPublished = profile?.published;

  return {
    isLoading,
    isPublished,
    handlePublish,
  };
}
