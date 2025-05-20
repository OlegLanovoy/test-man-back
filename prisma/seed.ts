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
  await prisma.post.create({
    data: {
      title: "Пост Али",
      text: "Пример",
      category: "news",
      tags: ["dev", "js"],
      userId: ali.id,
    },
  });
  await prisma.post.create({
    data: {
      title: "Пост Омара",
      text: "Ещё пример",
      category: "tech",
      tags: ["typescript"],
      userId: omar.id,
    },
  });
}

main()
  .then(() => console.log("✅ Сидинг завершён"))
  .catch((e) => {
    console.error("❌ Ошибка сида:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
