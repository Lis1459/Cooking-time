import { useEffect, useRef, useState } from "react";
import {
  useAllUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useReportsQuery,
  useReportQuery,
  useUpdateReportMutation,
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useTagsQuery,
  useCreateTagMutation,
  useDeleteTagMutation,
  useCreateCuisineMutation,
  useDeleteCuisineMutation,
  useCuisinesQuery,
  useCreateIngredientMutation,
  useDeleteIngredientMutation,
  useIngredientsQuery,
  usePendingRecipesQuery,
  useApproveRecipeMutation,
  useRejectRecipeMutation,
} from "../../services/apiService";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Label,
  Loader,
  Badge,
  Select,
  Textarea,
  Modal,
} from "../../components/ui";
import { SOCKET_URL } from "../../config/constants";
import { ReportModal } from "../../components/common/ReportModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import "./AdminPanel.css";

export const AdminPanelPage = () => {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const usersLimit = 15;
  const sentinelRef = useRef(null);
  // Fetch users data
  const { data: usersData = {}, isLoading: usersLoading } = useAllUsersQuery(
    page,
    usersLimit,
  );

  useEffect(() => {
    if (!usersData.users) return;

    const timeout = setTimeout(() => {
      setUsers((prev) =>
        page === 1 ? usersData.users : [...prev, ...usersData.users],
      );
      setTotalUsers(usersData.total);
      setHasMore(page * usersLimit < (usersData.total || 0));
      setLoadingMore(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [usersData, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !usersLoading &&
          !loadingMore
        ) {
          setPage((prev) => prev + 1);
          setLoadingMore(true);
        }
      },
      { rootMargin: "200px" },
    );

    const current = sentinelRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, usersLoading, loadingMore]);

  const { data: reportsData, isLoading: reportsLoading } = useReportsQuery();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategoriesQuery();
  const { data: cuisines = [], isLoading: cuisinesLoading } =
    useCuisinesQuery();
  const { data: tags = [], isLoading: tagsLoading } = useTagsQuery();
  const { data: ingredients, isLoading: ingredientsLoading } =
    useIngredientsQuery({ status: "all" });

  const reports = reportsData ? reportsData.reports : [];

  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();

  const updateReportMutation = useUpdateReportMutation();
  const approveRecipeMutation = useApproveRecipeMutation();
  const rejectRecipeMutation = useRejectRecipeMutation();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState("");

  const createCategoryMutation = useCreateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  const createTagMutation = useCreateTagMutation();
  const deleteTagMutation = useDeleteTagMutation();

  const createCuisineMutation = useCreateCuisineMutation();
  const deleteCuisineMutation = useDeleteCuisineMutation();

  const createIngredientMutation = useCreateIngredientMutation();
  const deleteIngredientMutation = useDeleteIngredientMutation();

  const [activeTab, setActiveTab] = useState("users");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newCuisineName, setNewCuisineName] = useState("");
  const [newIngredientName, setNewIngredientName] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const { data: pendingRecipesData, isLoading: pendingRecipesLoading } =
    usePendingRecipesQuery();

  const pendingRecipes = pendingRecipesData ? pendingRecipesData.recipes : [];
  console.log("PendingPageRecipes: ", pendingRecipes);
  const { data: selectedReport } = useReportQuery(selectedReportId, {
    enabled: reportModalOpen && !!selectedReportId,
  });
  const loading =
    (usersLoading && page === 1) ||
    reportsLoading ||
    categoriesLoading ||
    tagsLoading ||
    cuisinesLoading ||
    ingredientsLoading;

  //user handlers
  const handleBlockUser = (userId) => {
    blockUserMutation.mutate(userId, {
      onSuccess: () => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_blocked: true } : user,
          ),
        );
      },
    });
  };

  const handleUnblockUser = (userId) => {
    unblockUserMutation.mutate(userId, {
      onSuccess: () => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_blocked: false } : user,
          ),
        );
      },
    });
  };

  //report handlers

  //category handlers
  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate(
        { name: newCategoryName },
        {
          onSuccess: () => {
            setNewCategoryName("");
          },
        },
      );
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setConfirmDialog({
      title: "Удалить категорию",
      message: "Удалить эту категорию?",
      onConfirm: () => deleteCategoryMutation.mutate(categoryId),
    });
  };

  //cuisine handlers
  const handleAddCuisine = async () => {
    if (newCuisineName.trim()) {
      createCuisineMutation.mutate(
        { name: newCuisineName },
        {
          onSuccess: () => {
            setNewCuisineName("");
          },
        },
      );
    }
  };

  const handleDeleteCuisine = (cuisineId) => {
    setConfirmDialog({
      title: "Удалить кухню",
      message: "Удалить эту кухню?",
      onConfirm: () => deleteCuisineMutation.mutate(cuisineId),
    });
  };

  //tag handlers
  const handleAddTag = async () => {
    if (newTagName.trim()) {
      createTagMutation.mutate(
        { name: newTagName },
        {
          onSuccess: () => {
            setNewTagName("");
          },
        },
      );
    }
  };

  const handleDeleteTag = (tagId) => {
    setConfirmDialog({
      title: "Удалить тег",
      message: "Удалить этот тег?",
      onConfirm: () => deleteTagMutation.mutate(tagId),
    });
  };

  //ingredient handlers
  const handleAddIngredient = async () => {
    if (newIngredientName.trim()) {
      createIngredientMutation.mutate(
        { name: newIngredientName },
        {
          onSuccess: () => {
            setNewIngredientName("");
          },
        },
      );
    }
  };

  const handleDeleteIngredient = (ingredientId) => {
    setConfirmDialog({
      title: "Удалить ингредиент",
      message: "Удалить этот ингредиент?",
      onConfirm: () => deleteIngredientMutation.mutate(ingredientId),
    });
  };

  const handleApproveRecipe = (recipeId) => {
    approveRecipeMutation.mutate(recipeId);
  };

  const handleRejectRecipe = (recipeId) => {
    setRejectTargetId(recipeId);
    setRejectReasonText("");
    setRejectModalOpen(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>Административная панель</h1>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Пользователи ({totalUsers})
        </button>
        <button
          className={`tab-button ${activeTab === "pendingRecipes" ? "active" : ""}`}
          onClick={() => setActiveTab("pendingRecipes")}
        >
          🧾 Ожидающие рецепты ({pendingRecipesData?.total || 0})
        </button>
        <button
          className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          ⚠️ Жалобы ({reports.length})
        </button>
        <button
          className={`tab-button ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          📂 Категории
        </button>
        <button
          className={`tab-button ${activeTab === "cuisines" ? "active" : ""}`}
          onClick={() => setActiveTab("cuisines")}
        >
          🍽️ Кухни
        </button>
        <button
          className={`tab-button ${activeTab === "tags" ? "active" : ""}`}
          onClick={() => setActiveTab("tags")}
        >
          🏷️ Теги
        </button>
        <button
          className={`tab-button ${activeTab === "ingredients" ? "active" : ""}`}
          onClick={() => setActiveTab("ingredients")}
        >
          🥕 Ингредиенты
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="tab-content">
          <Card>
            <CardHeader>
              Управление пользователями ({totalUsers} всего)
            </CardHeader>
            <CardContent>
              {usersLoading && page === 1 ? (
                <div className="loading-container">
                  <Loader size="lg" />
                </div>
              ) : users.length > 0 ? (
                <>
                  <div className="users-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Имя</th>
                          <th>Email</th>
                          <th>Статус</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.profile?.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <Badge
                                variant={user.is_blocked ? "error" : "success"}
                              >
                                {user.is_blocked ? "Заблокирован" : "Активен"}
                              </Badge>
                            </td>
                            <td>
                              {user.is_blocked ? (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleUnblockUser(user.id)}
                                >
                                  Разблокировать
                                </Button>
                              ) : (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleBlockUser(user.id)}
                                >
                                  Заблокировать
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hasMore && (
                    <div
                      ref={sentinelRef}
                      style={{ width: "100%", height: "1px" }}
                    />
                  )}
                  {loadingMore && (
                    <div className="loading-container">
                      <Loader size="lg" />
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <p>Пользователи не найдены</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Recipes Tab */}
      {activeTab === "pendingRecipes" && (
        <div className="tab-content">
          <Card>
            <CardHeader>Модерация ожидающих рецептов</CardHeader>
            <CardContent>
              {pendingRecipesLoading ? (
                <div className="loading-container">
                  <Loader size="lg" />
                </div>
              ) : pendingRecipes.length > 0 ? (
                pendingRecipes.map((recipe) => {
                  const newIngredients = (recipe.ingredients || [])
                    .filter((ri) => ri.ingredient?.status === "NotVerified")
                    .map((ri) => ri.ingredient?.name)
                    .filter(Boolean);

                  const isEditPending = recipe.draft?.pendingType === "edit";
                  const pendingLabel = isEditPending
                    ? "Ожидает обновления"
                    : recipe.status;
                  const draftChanges = recipe.draft?.changes || [];
                  const draftEditor = recipe.draft?.editor?.name;

                  return (
                    <Card
                      key={recipe.id}
                      style={{ marginBottom: "var(--spacing-lg)" }}
                    >
                      <div className="pending-recipe-preview">
                        <img
                          className="pending-recipe-image"
                          src={`${SOCKET_URL}${recipe.preview_img_url}`}
                          alt={recipe.title}
                        />
                        <div className="pending-recipe-main">
                          <h3 className="pending-recipe-title">
                            {recipe.title}
                          </h3>
                          <p className="pending-recipe-author">
                            от {recipe.author?.name}
                          </p>
                          <div className="pending-recipe-meta">
                            <span className="pending-recipe-time">
                              ⏱ {recipe.cooking_time} мин
                            </span>
                            <Badge
                              variant={isEditPending ? "secondary" : "warning"}
                              style={{ marginLeft: "var(--spacing-sm)" }}
                            >
                              {pendingLabel}
                            </Badge>
                          </div>

                          {isEditPending && draftEditor && (
                            <p className="pending-recipe-new">
                              ✍ Отредактировано: <strong>{draftEditor}</strong>
                            </p>
                          )}

                          {draftChanges.length > 0 && (
                            <p className="pending-recipe-new">
                              🔧 Изменения:{" "}
                              <strong>{draftChanges.join(", ")}</strong>
                            </p>
                          )}

                          {newIngredients.length > 0 && (
                            <p className="pending-recipe-new">
                              ⚠ Новые ингредиенты:{" "}
                              <strong>{newIngredients.join(", ")}</strong>
                            </p>
                          )}

                          {/* {newTags.length > 0 && (
                            <p className="pending-recipe-new">
                              ⚠ New tags/categories:{" "}
                              <strong>
                                {newTags.map((t) => t.name).join(", ")}
                              </strong>
                            </p>
                          )} */}
                        </div>

                        <div className="pending-recipe-actions">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApproveRecipe(recipe.id)}
                            disabled={approveRecipeMutation.isLoading}
                          >
                            Одобрить
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectRecipe(recipe.id)}
                            disabled={rejectRecipeMutation.isLoading}
                            style={{ marginLeft: "var(--spacing-sm)" }}
                          >
                            Отклонить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.location.assign(
                                `/admin/recipes/${recipe.id}`,
                              )
                            }
                            style={{ marginLeft: "var(--spacing-sm)" }}
                          >
                            Открыть
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <p>Нет ожидающих рецептов</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="tab-content">
          <Card>
            <CardHeader>Управление жалобами</CardHeader>
            <CardContent>
              <div className="reports-list">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <div key={report.id} className="report-item">
                      <div className="report-info">
                        <p className="report-reason">{report.reason}</p>
                        <p className="report-meta">
                          Сообщил: <strong>{report.user?.name}</strong> |
                          <Badge variant="warning">{report.status}</Badge>
                        </p>
                      </div>
                      <div className="report-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReportId(report.id);
                            setReportModalOpen(true);
                          }}
                        >
                          Просмотр
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Жалоб нет</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="tab-content">
          <Card>
            <CardHeader>Управление категориями</CardHeader>
            <CardContent>
              <div className="manage-form">
                <div className="form-group">
                  <Label>Добавить новую категорию</Label>
                  <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                    <Input
                      placeholder="Название категории"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button onClick={handleAddCategory} variant="secondary">
                      Добавить
                    </Button>
                  </div>
                </div>
              </div>

              <div className="items-list">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    style={{ padding: "var(--spacing-lg)" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "var(--spacing-md)",
                        alignItems: "center",
                      }}
                    >
                      <span className="list-item">{category.name}</span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cuisines Tab */}
      {activeTab === "cuisines" && (
        <div className="tab-content">
          <Card>
            <CardHeader>Управление кухнями</CardHeader>
            <CardContent>
              <div className="manage-form">
                <div className="form-group">
                  <Label>Добавить новую кухню</Label>
                  <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                    <Input
                      placeholder="Название кухни"
                      value={newCuisineName}
                      onChange={(e) => setNewCuisineName(e.target.value)}
                    />
                    <Button onClick={handleAddCuisine} variant="secondary">
                      Добавить
                    </Button>
                  </div>
                </div>
              </div>

              <div className="items-list">
                {cuisines.map((cuisine) => (
                  <Card
                    key={cuisine.id}
                    style={{ padding: "var(--spacing-lg)" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "var(--spacing-md)",
                        alignItems: "center",
                      }}
                    >
                      <span className="list-item">{cuisine.name}</span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteCuisine(cuisine.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === "tags" && (
        <div className="tab-content">
          <Card>
            <CardHeader>Управление тегами</CardHeader>
            <CardContent>
              <div className="manage-form">
                <div className="form-group">
                  <Label>Добавить новый тег</Label>
                  <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                    <Input
                      placeholder="Название тега"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <Button onClick={handleAddTag} variant="secondary">
                      Добавить
                    </Button>
                  </div>
                </div>
              </div>

              <div className="items-list">
                {tags.map((tag) => (
                  <Card key={tag.id} style={{ padding: "var(--spacing-lg)" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "var(--spacing-md)",
                        alignItems: "center",
                      }}
                    >
                      <span className="list-item">{tag.name}</span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ingredients Tab */}
      {activeTab === "ingredients" && (
        <div className="tab-content">
          <Card>
            <CardHeader>Управление ингредиентами</CardHeader>
            <CardContent>
              <div className="manage-form">
                <div className="form-group">
                  <Label>Добавить новый ингредиент</Label>
                  <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                    <Input
                      placeholder="Название ингредиента"
                      value={newIngredientName}
                      onChange={(e) => setNewIngredientName(e.target.value)}
                    />
                    <Button onClick={handleAddIngredient} variant="secondary">
                      Добавить
                    </Button>
                  </div>
                </div>
              </div>

              <div className="items-list">
                {ingredients.map((ingredient) => (
                  <Card
                    key={ingredient.id}
                    style={{ padding: "var(--spacing-lg)" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "var(--spacing-md)",
                        alignItems: "center",
                      }}
                    >
                      <span className="list-item">{ingredient.name}</span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteIngredient(ingredient.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Причина отклонения рецепта"
        footer={
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button
              variant="secondary"
              onClick={() => setRejectModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setRejectModalOpen(false);
                rejectRecipeMutation.mutate({
                  id: rejectTargetId,
                  reason: rejectReasonText,
                });
              }}
              disabled={
                !rejectReasonText.trim() || rejectRecipeMutation.isLoading
              }
            >
              Отклонить
            </Button>
          </div>
        }
      >
        <div style={{ padding: "8px 0" }}>
          <p>
            Введите причину отклонения рецепта. Комментарий будет отправлен
            автору.
          </p>
          <Textarea
            value={rejectReasonText}
            onChange={(e) => setRejectReasonText(e.target.value)}
            placeholder="Причина отклонения"
            rows={5}
          />
        </div>
      </Modal>

      <ReportModal
        isOpen={reportModalOpen}
        report={selectedReport}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedReportId(null);
        }}
        onSubmit={async ({ id, status, resolution_comment }) => {
          await updateReportMutation.mutateAsync({
            id,
            status,
            resolution_comment,
          });
          setReportModalOpen(false);
          setSelectedReportId(null);
        }}
      />
      {confirmDialog && (
        <ConfirmDialog
          isOpen={!!confirmDialog}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={() => {
            try {
              confirmDialog.onConfirm && confirmDialog.onConfirm();
            } finally {
              setConfirmDialog(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminPanelPage;
