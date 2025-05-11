import prisma from "./prisma";

async function main() {
  // создаём юзеров
  const ali = await prisma.user.create({
    data: {
      firstName: "Ali",
      lastName: "Muhammad",
      age: 30,
      email: "ali1@example.com",
      password: "strongPassword",
    },
  });

  const omar = await prisma.user.create({
    data: {
      firstName: "Omar",
      lastName: "Rafaelov",
      age: 25,
      email: "omar2@example.com",
      password: "strongPassword",
    },
  });

  // создаём посты для каждого
  await prisma.post.createMany({
    data: [
      {
        title: "Пост Али",
        text: "Текст от Али",
        userId: ali.id,
      },
      {
        title: "Пост Омара",
        text: "Что-то важное",
        userId: omar.id,
      },
      {
        title: "Пост Али 2",
        text: "Текст от Али 2",
        userId: ali.id,
      },
      {
        title: "Пост Омара 2",
        text: "Что-то важное 2",
        userId: omar.id,
      },
    ],
  });
}

main()
  .then(() => console.log("✅ Сидинг завершён"))
  .catch((e) => {
    console.error("❌ Ошибка сида:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
