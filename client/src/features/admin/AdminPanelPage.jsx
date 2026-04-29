import { useEffect, useRef, useState } from "react";
import {
  useAllUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeleteUserMutation,
  useReportsQuery,
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
} from "../../components/ui";
import "./AdminPanel.css";

export const AdminPanelPage = () => {
  // Users pagination state
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const usersLimit = 10;
  const sentinelRef = useRef(null);

  // Fetch users data
  const { data: usersData = {}, isLoading: usersLoading } = useAllUsersQuery(
    page,
    usersLimit,
  );

  // Update users when data changes
  useEffect(() => {
    console.log(usersData);
    if (usersData) {
      setUsers((prev) =>
        page === 1 ? usersData.users : [...prev, ...usersData.users],
      );
      setTotalUsers(usersData.total);
      setHasMore(page * usersLimit < (usersData.total || 0));
      setLoadingMore(false);
    }
  }, [usersData, page]);

  // Setup IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!hasMore || usersLoading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
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
    useIngredientsQuery();

  const reports = reportsData ? reportsData.reports : [];
  // const ingredients = ingredientsData ? ingredientsData.ingredients : [];

  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const updateReportMutation = useUpdateReportMutation();

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

  const loading =
    (usersLoading && page === 1) ||
    reportsLoading ||
    categoriesLoading ||
    tagsLoading ||
    cuisinesLoading ||
    ingredientsLoading;

  //user handlers
  const handleBlockUser = (userId) => {
    blockUserMutation.mutate(userId);
  };

  const handleUnblockUser = (userId) => {
    unblockUserMutation.mutate(userId);
  };

  //report handlers
  const handleApproveReport = (reportId) => {
    updateReportMutation.mutate({
      id: reportId,
      status: "APPROVED",
    });
  };

  const handleRejectReport = (reportId) => {
    updateReportMutation.mutate({
      id: reportId,
      status: "REJECTED",
    });
  };

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
    if (window.confirm("Delete this category?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
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
    if (window.confirm("Delete this cuisine?")) {
      deleteCuisineMutation.mutate(cuisineId);
    }
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
    if (window.confirm("Delete this tag?")) {
      deleteTagMutation.mutate(tagId);
    }
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
    if (window.confirm("Delete this ingredient?")) {
      deleteIngredientMutation.mutate(ingredientId);
    }
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
      <h1>Admin Panel</h1>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users ({totalUsers})
        </button>
        <button
          className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          ⚠️ Reports ({reports.length})
        </button>
        <button
          className={`tab-button ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          📂 Categories
        </button>
        <button
          className={`tab-button ${activeTab === "cuisines" ? "active" : ""}`}
          onClick={() => setActiveTab("cuisines")}
        >
          🍽️ Cuisines
        </button>
        <button
          className={`tab-button ${activeTab === "tags" ? "active" : ""}`}
          onClick={() => setActiveTab("tags")}
        >
          🏷️ Tags
        </button>
        <button
          className={`tab-button ${activeTab === "ingredients" ? "active" : ""}`}
          onClick={() => setActiveTab("ingredients")}
        >
          🥕 Ingredients
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="tab-content">
          <Card>
            <CardHeader>User Management ({totalUsers} total)</CardHeader>
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
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Actions</th>
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
                                {user.is_blocked ? "Blocked" : "Active"}
                              </Badge>
                            </td>
                            <td>
                              {user.is_blocked ? (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleUnblockUser(user.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleBlockUser(user.id)}
                                >
                                  Block
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
                  <p>No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="tab-content">
          <Card>
            <CardHeader>Report Management</CardHeader>
            <CardContent>
              <div className="reports-list">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <div key={report.id} className="report-item">
                      <div className="report-info">
                        <p className="report-reason">{report.reason}</p>
                        <p className="report-meta">
                          Reported by: <strong>{report.user?.name}</strong> |
                          Status:{" "}
                          <Badge variant="warning">{report.status}</Badge>
                        </p>
                      </div>
                      <div className="report-actions">
                        {report.status === "PENDING" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveReport(report.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectReport(report.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No reports</p>
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
            <CardHeader>Category Management</CardHeader>
            <CardContent>
              <div className="manage-form">
                <div className="form-group">
                  <Label>Add New Category</Label>
                  <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button onClick={handleAddCategory} variant="secondary">
                      Add
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
                        Delete
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
            <CardHeader>Cuisine Management</CardHeader>
            <CardContent>
              <div className="manage-form">
                <div className="form-group">
                  <Label>Add New Cuisine</Label>
                  <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                    <Input
                      placeholder="Cuisine name"
                      value={newCuisineName}
                      onChange={(e) => setNewCuisineName(e.target.value)}
                    />
                    <Button onClick={handleAddCuisine} variant="secondary">
                      Add
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
                        Delete
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
            <CardHeader>Tag Management</CardHeader>
            <CardContent>
              <div className="manage-form">
                <div className="form-group">
                  <Label>Add New Tag</Label>
                  <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <Button onClick={handleAddTag} variant="secondary">
                      Add
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
                        Delete
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
            <CardHeader>Ingredients Management</CardHeader>
            <CardContent>
              <div className="manage-form">
                <div className="form-group">
                  <Label>Add New Ingredient</Label>
                  <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                    <Input
                      placeholder="Ingredient name"
                      value={newIngredientName}
                      onChange={(e) => setNewIngredientName(e.target.value)}
                    />
                    <Button onClick={handleAddIngredient} variant="secondary">
                      Add
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
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
