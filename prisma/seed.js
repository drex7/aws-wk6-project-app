import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const userData = [
  {
    name: "Alice",
    email: "alice@mail.io",
    posts: {
      create: [
        {
          title: "Why AI Matters",
          content: "https://pris.ly/discord",
          published: true,
        },
      ],
    },
  },
  {
    name: "Emma",
    email: "emma@mail.io",
    posts: {
      create: [
        {
          title: "Follow Elon on Twitter",
          content: "https://www.twitter.com/elonmusk",
          published: true,
          viewCount: 42,
        },
      ],
    },
  },
  {
    name: "Mahmoud",
    email: "mahmoud@mail.io",
    posts: {
      create: [
        {
          title: "Ask a question about Prisma on GitHub",
          content: "https://www.github.com/prisma/prisma/discussions",
          published: true,
          viewCount: 128,
        },
        {
          title: "Prisma on YouTube",
          content: "https://pris.ly/youtube",
        },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
