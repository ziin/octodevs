import type { UserResponse } from "../types/github";

export function mapGithubUserToProfile(user: UserResponse) {
  return {
    github: user.login,
    name: user.name,
    avatar: user.avatar_url,
    bio: user.bio,
    location: user.location,
    website: user.blog,
    twitter: user.twitter_username,
    followers: user.followers,
    hireable: user.hireable ?? false,
  };
}
