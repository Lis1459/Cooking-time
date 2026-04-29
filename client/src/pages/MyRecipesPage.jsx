import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMyRecipesQuery } from "../services/apiService";
import { Card, CardContent, Button, Loader, Badge } from "../components/ui";
import "./MyRecipesPage.css";
import { SOCKET_URL } from "../config/constants";

export const MyRecipesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const queryParams = useMemo(
    () => ({ page, limit }),
    [page, limit],
  );

  const { data, isLoading } = useMyRecipesQuery(user?.id, queryParams, {
    enabled: !!user?.id,
  });

  const recipes = data?.recipes ?? [];

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="my-recipes-page">
      <div className="page-header">
        <div>
          <h1>My Recipes</h1>
          <p className="page-subtitle">Recipes created by you</p>
        </div>
        <div className="pagination-controls">
          <label>
            Recipes per page
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </label>
        </div>
      </div>

      {recipes.length > 0 ? (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="recipe-card">
              <img
                src={`${SOCKET_URL}${recipe.preview_img_url}`}
                alt={recipe.title}
                className="recipe-image"
              />
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="recipe-description">
                  {recipe.description?.substring(0, 100)}...
                </p>
                <div className="recipe-meta">
                  <div className="recipe-tags">
                    <Badge variant="primary">{recipe.difficulty}</Badge>
                    <Badge variant="success">{recipe.calories} cal</Badge>
                  </div>
                  <span className="cooking-time">
                    ⏱️ {recipe.cooking_time} min
                  </span>
                </div>
                <div className="recipe-actions">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You haven’t created any recipes yet.</p>
          <Button variant="primary" onClick={() => navigate("/add-recipe")}>
            Add Recipe
          </Button>
        </div>
      )}

      {data?.total > limit && (
        <div className="pagination-footer">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span>
            Page {page} of {Math.ceil((data?.total || 0) / limit)}
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil((data?.total || 0) / limit)}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyRecipesPage;
