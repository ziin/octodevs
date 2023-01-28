# Octodevs

Octodevs is a simple web app for sharing your GitHub profile with other developers.

I made this project to try some libraries and tools. You can check what I used down below.

## What it does
- User authentication with Github (NextAuth)
- The user's GitHub profile can be shared and unshared (tRPC, Prisma)
- Infinite scrolling of the user's profile (react-intersection-observer)
- Data stored with MySQL (Prisma, PlanetScale)
- QStash (Upstash) updates all the profiles every day.



## Built With

- [T3 Stack](https://create.t3.gg/) - Application Bootstrapping
- [Next.js](https://nextjs.org/) - The web framework
- [React](https://reactjs.org/) - The UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [React Intersection Observer](https://github.com/thebuilder/react-intersection-observe) - Intersection Observer API
- [CVA](https://github.com/joe-bell/cva) - Class Variance Authority
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [tRPC](https://trpc.io/) - Type-safe API layer
- [Prisma](https://www.prisma.io/) - Database ORM
- [Zod](https://zod.dev/) - Schema validation
- [Docker](https://www.docker.com/) - Local MySQL database
- [React Query](https://react-query.tanstack.com/) - Data fetching
- [GitHub Octicons](https://octicons.github.com/) - Icons
- [GitHub API](https://developer.github.com/v3/) - Used to fetch user data
- [PlanetScale](https://planetscale.com/) - Database hosting
- [Vercel](https://vercel.com/) - Deployment
- [Upstash](https://upstash.com/) - Schedule profiles sync with Github

## License

This project is licensed under the MIT License
