
# BetterTimetable

This is the repository created for the Code Network BetterTimetable Project. Please let me (Zac) know if you encounter any issues while following these instructions.

## Setting up the Project

1. Run `npm install` to install the necessary dependencies.
2. While that is happening, duplicate `.env.example` to `.env` and update the `DATABASE_URL` to have your username, password, and port.
3. Once the dependencies are installed and your SQL connection string is correct, run `npm run db:reset` to initialise your database with the correct schema and to seed the database (i.e. insert the default objects)
4. Finally, run `npm run dev` and then navigate to `http://localhost:3000`. You should be presented with a login screen where you can login using one of the pre-prepared credentials listed below.

## Pre-prepared Credentials

| Username | Password | Full name   |
| -------- | -------- | ----------- |
| username | password | John Doe    |
| abc      | 123      | Alice Smith |

# Original Instructions (for posterity)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
