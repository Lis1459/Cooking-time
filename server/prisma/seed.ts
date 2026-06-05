import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Difficulty, Status } from "../generated/prisma/enums.ts";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const recipesData = [
  {
    title: "Спагетти Карбонара",
    description: "Итальянская паста с беконом, яйцами и пармезаном.",
    cooking_time: 25,
    calories: 650,
    difficulty: Difficulty.MEDIUM,
    steps: [
      "Отварить спагетти до al dente",
      "Обжарить бекон",
      "Смешать яйца и сыр",
      "Соединить все ингредиенты",
    ],
  },
  {
    title: "Курица в сливочном соусе",
    description: "Нежное куриное филе в сливочном соусе с чесноком.",
    cooking_time: 35,
    calories: 520,
    difficulty: Difficulty.MEDIUM,
    steps: [
      "Обжарить курицу",
      "Добавить чеснок",
      "Влить сливки",
      "Тушить 15 минут",
    ],
  },
  {
    title: "Омлет с сыром",
    description: "Быстрый завтрак с яйцами и расплавленным сыром.",
    cooking_time: 10,
    calories: 300,
    difficulty: Difficulty.EASY,
    steps: [
      "Взбить яйца",
      "Вылить на сковороду",
      "Добавить сыр",
      "Сложить омлет",
    ],
  },
  {
    title: "Греческий салат",
    description: "Свежий салат с овощами и сыром фета.",
    cooking_time: 15,
    calories: 200,
    difficulty: Difficulty.EASY,
    steps: [
      "Нарезать овощи",
      "Добавить фету",
      "Заправить маслом",
      "Перемешать",
    ],
  },
  {
    title: "Борщ",
    description: "Сытный суп со свеклой и мясом.",
    cooking_time: 90,
    calories: 400,
    difficulty: Difficulty.HARD,
    steps: [
      "Сварить бульон",
      "Добавить овощи",
      "Добавить свеклу",
      "Варить 40 минут",
    ],
  },
  {
    title: "Плов с курицей",
    description: "Ароматный рис с курицей и специями.",
    cooking_time: 60,
    calories: 550,
    difficulty: Difficulty.MEDIUM,
    steps: [
      "Обжарить курицу",
      "Добавить морковь и лук",
      "Добавить рис",
      "Залить водой и тушить",
    ],
  },
  {
    title: "Блины",
    description: "Тонкие классические блины.",
    cooking_time: 30,
    calories: 320,
    difficulty: Difficulty.EASY,
    steps: ["Смешать тесто", "Разогреть сковороду", "Жарить блины", "Подавать"],
  },
  {
    title: "Чизкейк",
    description: "Нежный десерт с сырной начинкой.",
    cooking_time: 80,
    calories: 600,
    difficulty: Difficulty.HARD,
    steps: ["Сделать основу", "Приготовить начинку", "Выпекать", "Остудить"],
  },
  {
    title: "Том Ям",
    description: "Острый тайский суп с креветками.",
    cooking_time: 40,
    calories: 350,
    difficulty: Difficulty.HARD,
    steps: [
      "Сварить бульон",
      "Добавить специи",
      "Добавить креветки",
      "Влить кокосовое молоко",
    ],
  },
  {
    title: "Цезарь с курицей",
    description: "Салат с курицей, сухариками и соусом.",
    cooking_time: 25,
    calories: 450,
    difficulty: Difficulty.HARD,
    steps: ["Обжарить курицу", "Нарезать салат", "Сделать соус", "Смешать"],
  },
  {
    title: "Гуакамоле",
    description: "Закуска из авокадо с лаймом.",
    cooking_time: 10,
    calories: 180,
    difficulty: Difficulty.EASY,
    steps: [
      "Размять авокадо",
      "Добавить лайм",
      "Добавить специи",
      "Перемешать",
    ],
  },
  {
    title: "Рамен",
    description: "Японский суп с лапшой и мясом.",
    cooking_time: 70,
    calories: 550,
    difficulty: Difficulty.HARD,
    steps: ["Сварить бульон", "Отварить лапшу", "Добавить мясо", "Собрать суп"],
  },
  {
    title: "Панкейки",
    description: "Пышные американские блинчики.",
    cooking_time: 20,
    calories: 350,
    difficulty: Difficulty.EASY,
    steps: ["Смешать тесто", "Вылить на сковороду", "Жарить", "Перевернуть"],
  },
  {
    title: "Котлеты",
    description: "Домашние мясные котлеты.",
    cooking_time: 40,
    calories: 500,
    difficulty: Difficulty.MEDIUM,
    steps: [
      "Смешать фарш",
      "Сформировать котлеты",
      "Обжарить",
      "Довести до готовности",
    ],
  },
  {
    title: "Лазанья",
    description: "Итальянское блюдо с фаршем и соусом.",
    cooking_time: 90,
    calories: 700,
    difficulty: Difficulty.HARD,
    steps: ["Приготовить соус", "Собрать слои", "Запекать", "Остудить"],
  },
  {
    title: "Шакшука",
    description: "Яйца в томатном соусе с овощами.",
    cooking_time: 25,
    calories: 300,
    difficulty: Difficulty.MEDIUM,
    steps: [
      "Обжарить овощи",
      "Добавить томаты",
      "Разбить яйца",
      "Готовить до готовности",
    ],
  },
  {
    title: "Сырники",
    description: "Творожные оладьи.",
    cooking_time: 20,
    calories: 350,
    difficulty: Difficulty.EASY,
    steps: ["Смешать творог", "Сформировать сырники", "Обжарить", "Подавать"],
  },
  {
    title: "Фахитас",
    description: "Мексиканское блюдо с мясом и овощами.",
    cooking_time: 30,
    calories: 500,
    difficulty: Difficulty.MEDIUM,
    steps: [
      "Обжарить мясо",
      "Добавить овощи",
      "Добавить специи",
      "Подавать с лепешками",
    ],
  },
  {
    title: "Куриный суп",
    description: "Легкий суп с курицей и овощами.",
    cooking_time: 50,
    calories: 250,
    difficulty: Difficulty.EASY,
    steps: [
      "Сварить бульон",
      "Добавить овощи",
      "Добавить курицу",
      "Варить до готовности",
    ],
  },
  {
    title: "Рис с овощами",
    description: "Простой гарнир с овощами.",
    cooking_time: 25,
    calories: 300,
    difficulty: Difficulty.EASY,
    steps: ["Отварить рис", "Обжарить овощи", "Смешать", "Подавать"],
  },
];

async function main() {
  await prisma.recipe.deleteMany();
  const users = await prisma.user.findMany({
    include: { profile: true },
  });

  const categories = await prisma.category.findMany();
  const tags = await prisma.tag.findMany();
  const cuisines = await prisma.cuisine.findMany();
  const ingredients = await prisma.ingredient.findMany();

  const recipes = [];

  for (let i = 0; i < 20; i++) {
    const template = recipesData[i];
    const author = users[i % users.length];

    const recipe = await prisma.recipe.create({
      data: {
        author_id: author.profile!.id,
        title: template.title + ` #${i + 1}`,
        description: template.description,
        preview_img_url: "https://placehold.co/600x400",
        cooking_time: template.cooking_time,
        calories: template.calories,
        difficulty: template.difficulty,
        status: Status.PUBLISHED,

        categories: {
          connect: [{ id: categories[i % categories.length].id }],
        },

        tags: {
          connect: [
            { id: tags[i % tags.length].id },
            { id: tags[(i + 1) % tags.length].id },
          ],
        },

        cuisines: {
          connect: [{ id: cuisines[i % cuisines.length].id }],
        },

        ingredients: {
          create: Array.from({ length: 4 }).map((_, idx) => ({
            ingredient_id: ingredients[(i + idx) % ingredients.length].id,
            amount: Math.floor(Math.random() * 300) + 50,
            unit: "г",
          })),
        },

        steps: {
          create: template.steps.map((step, index) => ({
            step_number: index + 1,
            description: step,
          })),
        },
      },
    });

    recipes.push(recipe);
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
