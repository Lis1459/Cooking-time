import prisma from "../config/database.js";

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildDateSeries = (days) => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const current = new Date(today);
    current.setDate(today.getDate() - offset);
    result.push({ date: formatLocalDate(current), count: 0 });
  }

  return result;
};

const fillDateSeries = (series, records) => {
  const data = series.map((item) => ({ ...item }));
  const index = data.reduce((acc, item, idx) => {
    acc[item.date] = idx;
    return acc;
  }, {});

  records.forEach((record) => {
    const dateKey = formatLocalDate(new Date(record.date));
    if (index[dateKey] !== undefined) {
      data[index[dateKey]].count += record.count;
    }
  });

  return data;
};

export class AdminService {
  async getStatistics(period = 7) {
    const requestedPeriod = period === 30 ? 30 : 7;
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setHours(0, 0, 0, 0);
    cutoffDate.setDate(cutoffDate.getDate() - (requestedPeriod - 1));

    const [totalUsers, totalRecipes, totalComments, viewsSum] =
      await Promise.all([
        prisma.user.count(),
        prisma.recipe.count(),
        prisma.comment.count({ where: { is_hidden: false } }),
        prisma.recipe.aggregate({ _sum: { views: true } }),
      ]);

    const categories = await prisma.category.findMany({
      select: {
        name: true,
        _count: {
          select: {
            recipes: true,
          },
        },
      },
    });

    const ratingGroups = await prisma.rating.groupBy({
      by: ["rating"],
      _count: { rating: true },
      orderBy: { rating: "desc" },
    });

    const topRecipes = await prisma.recipe.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { popularity_score: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        popularity_score: true,
      },
    });

    const rawViews = await prisma.recipeView.findMany({
      where: { last_viewed_at: { gte: cutoffDate } },
      select: {
        last_viewed_at: true,
      },
    });

    const rawNewRecipes = await prisma.recipe.findMany({
      where: { created_at: { gte: cutoffDate } },
      select: {
        created_at: true,
      },
    });

    const viewsByDateGroups = rawViews.reduce((acc, item) => {
      const date = formatLocalDate(new Date(item.last_viewed_at));
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const newRecipesByDateGroups = rawNewRecipes.reduce((acc, item) => {
      const date = formatLocalDate(new Date(item.created_at));
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const viewsByDate = buildDateSeries(requestedPeriod).map((item) => ({
      date: item.date,
      views: viewsByDateGroups[item.date] || 0,
    }));

    const newRecipesByDate = buildDateSeries(requestedPeriod).map((item) => ({
      date: item.date,
      count: newRecipesByDateGroups[item.date] || 0,
    }));

    return {
      counts: {
        recipes: totalRecipes,
        users: totalUsers,
        views: viewsSum._sum.views || 0,
        comments: totalComments,
      },
      viewsByDate,
      categoryBreakdown: categories
        .map((category) => ({
          name: category.name,
          count: category._count.recipes,
        }))
        .sort((a, b) => b.count - a.count),
      ratingDistribution: [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count:
          ratingGroups.find((item) => item.rating === rating)?._count.rating ||
          0,
      })),
      topRecipes: topRecipes.map((recipe) => ({
        title: recipe.title,
        popularity_score: recipe.popularity_score,
      })),
      newRecipesByDate,
    };
  }
}
