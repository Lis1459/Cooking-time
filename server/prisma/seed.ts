import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { Role, Difficulty, Status } from "../generated/prisma/enums.ts";

import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding started...");

  // =============================
  // CLEAN DATABASE
  // =============================

  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cookHistory.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.recipeIngredients.deleteMany();
  await prisma.recipeSteps.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.cuisine.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // =============================
  // USERS (15)
  // =============================

  const users = [];

  for (let i = 1; i <= 15; i++) {
    const hashedPassword = await bcrypt.hash("пароль123", 10);

    const user = await prisma.user.create({
      data: {
        email: `user${i}@mail.ru`,
        password_hash: hashedPassword,
        role: i === 1 ? Role.ADMIN : Role.USER,
        profile: {
          create: {
            name: `Пользователь ${i}`,
            preferences: "Домашняя кухня",
            allergies: i % 4 === 0 ? "Орехи" : null,
            diet_type: "Обычный",
          },
        },
      },
      include: { profile: true },
    });

    users.push(user);
  }

  console.log("✔ Users created (15)");

  // =============================
  // CATEGORIES (10)
  // =============================

  const categoryNames = [
    "Завтрак",
    "Обед",
    "Ужин",
    "Десерт",
    "Супы",
    "Салаты",
    "Выпечка",
    "Праздничное",
    "Быстрое",
    "Вегетарианское",
  ];

  const categories = [];

  for (const name of categoryNames) {
    categories.push(await prisma.category.create({ data: { name } }));
  }

  console.log("✔ Categories created (10)");

  // =============================
  // TAGS (15)
  // =============================

  const tagNames = [
    "Полезно",
    "Остро",
    "Диетическое",
    "Домашнее",
    "Легко",
    "Сытно",
    "На скорую руку",
    "Детское",
    "Фитнес",
    "Постное",
    "Без глютена",
    "Без сахара",
    "Сырное",
    "Мясное",
    "Рыбное",
  ];

  const tags = [];

  for (const name of tagNames) {
    tags.push(await prisma.tag.create({ data: { name } }));
  }

  console.log("✔ Tags created (15)");

  // =============================
  // CUISINES (10)
  // =============================

  const cuisineNames = [
    "Русская",
    "Итальянская",
    "Японская",
    "Французская",
    "Мексиканская",
    "Китайская",
    "Грузинская",
    "Индийская",
    "Испанская",
    "Американская",
  ];

  const cuisines = [];

  for (const name of cuisineNames) {
    cuisines.push(await prisma.cuisine.create({ data: { name } }));
  }

  console.log("✔ Cuisines created (10)");

  // =============================
  // INGREDIENTS (30)
  // =============================

  const ingredientNames = [
    "Курица",
    "Говядина",
    "Свинина",
    "Рис",
    "Макароны",
    "Картофель",
    "Морковь",
    "Лук",
    "Чеснок",
    "Помидор",
    "Огурец",
    "Сыр",
    "Молоко",
    "Яйца",
    "Мука",
    "Сахар",
    "Соль",
    "Перец",
    "Масло",
    "Сметана",
    "Йогурт",
    "Брокколи",
    "Шпинат",
    "Грибы",
    "Лосось",
    "Креветки",
    "Фасоль",
    "Чечевица",
    "Капуста",
    "Баклажан",
  ];

  const ingredients = [];

  for (const name of ingredientNames) {
    ingredients.push(await prisma.ingredient.create({ data: { name } }));
  }

  console.log("✔ Ingredients created (30)");

  // =============================
  // RECIPES (20)
  // =============================

  const recipes = [];

  for (let i = 1; i <= 20; i++) {
    const author = users[i % users.length];

    const recipe = await prisma.recipe.create({
      data: {
        author_id: author.profile!.id,
        title: `Рецепт №${i}`,
        description: `Подробное описание приготовления рецепта №${i}.`,
        preview_img_url: "https://placehold.co/600x400",
        cooking_time: 20 + i,
        calories: 300 + i * 10,
        difficulty: Difficulty.MEDIUM,
        status: Status.PUBLISHED,

        categories: {
          connect: [{ id: categories[i % categories.length].id }],
        },

        tags: {
          connect: [{ id: tags[i % tags.length].id }],
        },

        cuisines: {
          connect: [{ id: cuisines[i % cuisines.length].id }],
        },

        ingredients: {
          create: [
            {
              ingredient_id: ingredients[i % 30].id,
              amount: 200,
              unit: "г",
            },
            {
              ingredient_id: ingredients[(i + 1) % 30].id,
              amount: 2,
              unit: "шт",
            },
          ],
        },

        steps: {
          create: [
            { step_number: 1, description: "Подготовить ингредиенты" },
            {
              step_number: 2,
              description: "Готовить 20 минут на среднем огне",
            },
          ],
        },
      },
    });

    recipes.push(recipe);
  }

  console.log("✔ Recipes created (20)");

  // =============================
  // SUBSCRIPTIONS (25+)
  // =============================

  let subscriptionCount = 0;

  while (subscriptionCount < 25) {
    const follower = users[Math.floor(Math.random() * 15)];
    const author = users[Math.floor(Math.random() * 15)];

    if (follower.profile!.id !== author.profile!.id) {
      await prisma.subscription
        .create({
          data: {
            follower_id: follower.profile!.id,
            author_id: author.profile!.id,
          },
        })
        .catch(() => {});

      subscriptionCount++;
    }
  }

  console.log("✔ Subscriptions created (25+)");

  // =============================
  // RATINGS (50)
  // =============================

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * 15)];
    const recipe = recipes[Math.floor(Math.random() * 20)];

    await prisma.rating
      .create({
        data: {
          recipe_id: recipe.id,
          user_id: user.profile!.id,
          rating: Math.floor(Math.random() * 5) + 1,
        },
      })
      .catch(() => {});
  }

  console.log("✔ Ratings created (50)");

  // =============================
  // COMMENTS (50)
  // =============================

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * 15)];
    const recipe = recipes[Math.floor(Math.random() * 20)];

    await prisma.comment.create({
      data: {
        recipe_id: recipe.id,
        user_id: user.profile!.id,
        text: `Очень вкусно! Обязательно приготовлю снова.`,
      },
    });
  }

  console.log("✔ Comments created (50)");

  console.log("🎉 Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
