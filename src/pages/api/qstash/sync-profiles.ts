import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignature } from "@upstash/qstash/nextjs";
import { prisma } from "../../../server/db/client";
import type { UserResponse } from "../../../types/github";
import { mapGithubUserToProfile } from "../../../utils/functions";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const profiles = await prisma.profile.findMany({
      where: {
        published: true,
      },
    });

    await Promise.all(
      profiles.map(async (profile) => {
        const user = await fetchGithubUser(profile.github);
        if (!user) return;

        await prisma.profile.update({
          data: mapGithubUserToProfile(user),
          where: {
            github: profile.github,
          },
        });
      }),
    );
    res.status(200).end();
  } catch (error) {
    console.log("Error while syncing profiles");
    res.status(500).end();
  }
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function fetchGithubUser(username: string): Promise<UserResponse | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return await response.json();
  } catch (error) {
    return null;
  }
}
