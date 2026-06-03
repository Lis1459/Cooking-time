import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAdminStatisticsQuery } from "../../services/apiService";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Loader,
} from "../../components/ui";
import "./AdminStatisticsPage.css";

const COLORS = ["#4F46E5", "#0EA5E9", "#14B8A6", "#F59E0B", "#EF4444"];

const StatCard = ({ label, value }) => (
  <Card className="stat-card">
    <CardContent>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </CardContent>
  </Card>
);

const formatXAxis = (tick) => {
  const [year, month, day] = tick.split("-");
  return `${day}.${month}`;
};

export const AdminStatisticsPage = () => {
  const [period, setPeriod] = useState(7);
  const { data, isLoading, error } = useAdminStatisticsQuery(period);

  const handleSetPeriod = (value) => {
    if (value !== period) {
      setPeriod(value);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-stats-loader">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="admin-stats-error">Ошибка загрузки статистики.</div>;
  }

  const {
    counts,
    viewsByDate,
    categoryBreakdown,
    ratingDistribution,
    topRecipes,
    newRecipesByDate,
  } = data;

  return (
    <div className="admin-stats-page">
      <div className="admin-stats-header">
        <div>
          <h1>Админ. Статистика</h1>
          <p className="admin-stats-subtitle">
            Ключевые метрики и динамика по просмотрам, рецептам, категориям и
            рейтингам.
          </p>
        </div>
        <div className="period-switch">
          <Button
            variant={period === 7 ? "primary" : "outline"}
            onClick={() => handleSetPeriod(7)}
          >
            7 дней
          </Button>
          <Button
            variant={period === 30 ? "primary" : "outline"}
            onClick={() => handleSetPeriod(30)}
          >
            30 дней
          </Button>
        </div>
      </div>

      <div className="admin-stats-cards">
        <StatCard label="Рецептов" value={counts.recipes} />
        <StatCard label="Пользователей" value={counts.users} />
        <StatCard label="Просмотров" value={counts.views} />
        <StatCard label="Комментариев" value={counts.comments} />
      </div>

      <div className="chart-wrapper">
        <div className="admin-stats-grid">
          <Card className="chart-card chart-large">
            <CardHeader>Просмотры по дням</CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart
                  data={viewsByDate}
                  margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    stroke="#6B7280"
                  />
                  <YAxis stroke="#6B7280" />
                  <Tooltip formatter={(value) => [value, "Просмотры"]} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="chart-card">
            <CardHeader>Топ рецептов</CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topRecipes}
                  layout="vertical"
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    horizontal={false}
                  />
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis
                    dataKey="title"
                    type="category"
                    width={180}
                    stroke="#6B7280"
                  />
                  <Tooltip formatter={(value) => [value, "Popularity"]} />
                  <Bar
                    dataKey="popularity_score"
                    fill="#14B8A6"
                    radius={[0, 10, 10, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="chart-card">
            <CardHeader>Распределение оценок</CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    dataKey="count"
                    nameKey="rating"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={54}
                    paddingAngle={3}
                    label={({ rating, percent }) =>
                      `${rating}⭐ ${Math.round(percent * 100)}%`
                    }
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell
                        key={entry.rating}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Оценок"]} />
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="chart-card category-card">
            <CardHeader>Категории рецептов</CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categoryBreakdown}
                  margin={{ top: 10, right: 0, left: -14, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#6B7280" />
                  <Tooltip formatter={(value) => [value, "Рецептов"]} />
                  <Bar dataKey="count" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="chart-card chart-large">
        <CardHeader>Новые рецепты по дням</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart
              data={newRecipesByDate}
              margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                stroke="#6B7280"
              />
              <YAxis stroke="#6B7280" />
              <Tooltip formatter={(value) => [value, "Новых рецептов"]} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatisticsPage;
