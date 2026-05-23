import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useProfileFollowersQuery,
  useProfileFollowingQuery,
  useSubscriptionStatusQuery,
  useRecipesQuery,
} from "../services/apiService";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
  Loader,
  Alert,
  Badge,
} from "../components/ui";
import { ReportDialog } from "../components/common/ReportDialog";
import { SOCKET_URL } from "../config/constants";
import "./UserProfile.css";

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const { userId: paramsUserId } = useParams();
  const { user: authUser } = useAuth();
  const finalUser = paramsUserId || authUser?.id;
  const isOwnProfile = authUser?.id === finalUser;

  const { data: userData, isLoading: profileLoading } = useUserProfileQuery(
    finalUser,
    {
      enabled: !!finalUser,
    },
  );

  const { data: recipesData, isLoading: recipesLoading } = useRecipesQuery(
    { author_id: finalUser, limit: 12 },
    { enabled: !!finalUser },
  );

  const { data: followers = [], isLoading: followersLoading } =
    useProfileFollowersQuery(finalUser, { enabled: !!finalUser });

  const { data: following = [], isLoading: followingLoading } =
    useProfileFollowingQuery(finalUser, { enabled: !!finalUser });

  const { data: statusData } = useSubscriptionStatusQuery(finalUser, {
    enabled: !!finalUser && !isOwnProfile && !!authUser?.id,
  });

  const profile = userData?.profile;

  const updateProfileMutation = useUpdateProfileMutation(finalUser);
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: profile?.name || "",
      preferences: profile?.preferences || "",
      allergies: profile?.allergies || "",
      diet_type: profile?.diet_type || "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  const onSubmit = (data) => {
    setError(null);
    updateProfileMutation.mutate(
      {
        name: data.name,
        preferences: data.preferences,
        allergies: data.allergies,
        diet_type: data.diet_type,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: (err) => {
          setError(err?.message || "Не удалось сохранить профиль");
        },
      },
    );
  };

  const handleFollow = () => {
    if (!finalUser) return;
    setError(null);
    followMutation.mutate(finalUser, {
      onError: (err) => {
        setError(err?.message || "Не удалось подписаться");
      },
    });
  };

  const handleUnfollow = () => {
    if (!finalUser) return;
    setError(null);
    unfollowMutation.mutate(finalUser, {
      onError: (err) => {
        setError(err?.message || "Не удалось отписаться");
      },
    });
  };

  if (profileLoading) {
    return (
      <div className="user-profile__loading">
        <Loader size="lg" />
      </div>
    );
  }

  const recipes = recipesData?.recipes || [];
  const totalRecipes = recipesData?.total ?? recipes.length;
  const followerCount = followers.length;
  const followingCount = following.length;
  const isSubscribed = Boolean(statusData?.subscribed);
  const createdDate = userData?.created_at
    ? new Date(userData.created_at).toLocaleDateString("ru-RU", {
        month: "long",
        year: "numeric",
      })
    : null;
  const profileName =
    profile?.name || userData?.email?.split("@")[0] || "Пользователь";
  const profileHandle = userData?.email
    ? `@${userData.email.split("@")[0]}`
    : null;

  return (
    <div className="user-profile">
      <Card className="profile-card">
        <CardHeader>
          <div className="profile-header">
            <div className="profile-avatar">
              {profileName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-main">
              <div className="profile-name-row">
                <div>
                  <h1>{profileName}</h1>
                  {profileHandle && (
                    <p className="profile-handle">{profileHandle}</p>
                  )}
                </div>
                {/* {createdDate && (
                  <p className="profile-member-since">
                    На сайте с {createdDate}
                  </p>
                )} */}
              </div>

              {/* <div className="profile-bio">
                {profile?.diet_type && (
                  <Badge variant="outline">{profile.diet_type}</Badge>
                )}
                {profile?.preferences && (
                  <span className="profile-bio-text">
                    {profile.preferences}
                  </span>
                )}
                {profile?.allergies && (
                  <span className="profile-bio-text">
                    Аллергии: {profile.allergies}
                  </span>
                )}
              </div> */}

              <div className="profile-stats">
                <div className="profile-stat">
                  <span>{totalRecipes}</span>
                  <small>Рецептов</small>
                </div>
                <div className="profile-stat">
                  <span>{followersLoading ? "..." : followerCount}</span>
                  <small>Подписчиков</small>
                </div>
                <div className="profile-stat">
                  <span>{followingLoading ? "..." : followingCount}</span>
                  <small>Подписок</small>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              {isOwnProfile ? (
                <Button
                  variant={isEditing ? "secondary" : "primary"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Отмена" : "Редактировать профиль"}
                </Button>
              ) : authUser?.id ? (
                <>
                  <Button
                    variant={isSubscribed ? "danger" : "primary"}
                    onClick={isSubscribed ? handleUnfollow : handleFollow}
                    disabled={
                      followMutation.isLoading || unfollowMutation.isLoading
                    }
                  >
                    {isSubscribed ? "Отписаться" : "Подписаться"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setReportDialogOpen(true)}
                  >
                    ⚠️ Пожаловаться
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && <Alert variant="error">{error}</Alert>}

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
              <div className="form-group">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Имя обязательно" })}
                  error={!!errors.name}
                />
                {errors.name && (
                  <span className="error-message">{errors.name.message}</span>
                )}
              </div>

              <div className="form-group">
                <Label htmlFor="diet_type">Тип питания</Label>
                <Input
                  id="diet_type"
                  placeholder="Например: вегетарианец, веган, безглютеновый"
                  {...register("diet_type")}
                />
              </div>

              <div className="form-group">
                <Label htmlFor="allergies">Аллергии</Label>
                <Textarea
                  id="allergies"
                  placeholder="Перечислите аллергии..."
                  {...register("allergies")}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <Label htmlFor="preferences">Предпочтения</Label>
                <Textarea
                  id="preferences"
                  placeholder="Любые кулинарные предпочтения или заметки..."
                  {...register("preferences")}
                  rows={3}
                />
              </div>

              <div className="form-footer">
                <Button variant="primary" type="submit">
                  Сохранить изменения
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          ) : (
            <div className="profile-details-grid">
              <div className="profile-detail-card">
                <h3>Тип питания</h3>
                <p>{profile?.diet_type || "Не указано"}</p>
              </div>
              <div className="profile-detail-card">
                <h3>Аллергии</h3>
                <p>{profile?.allergies || "Не указано"}</p>
              </div>
              <div className="profile-detail-card">
                <h3>Кулинарные предпочтения</h3>
                <p>{profile?.preferences || "Не указано"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="profile-recipes-section">
        <div className="profile-recipes-header">
          <div>
            <h2>Лента рецептов</h2>
            <p className="profile-recipes-subtitle">
              {userData?.email
                ? `Рецепты от ${profileName}`
                : "Рецепты пользователя"}
            </p>
          </div>
          <span>
            {totalRecipes} {totalRecipes === 1 ? "рецепт" : "рецептов"}
          </span>
        </div>

        {recipesLoading ? (
          <div className="user-profile__loading">
            <Loader size="lg" />
          </div>
        ) : recipes.length ? (
          <div className="profile-recipes-grid">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="profile-recipe-card">
                {recipe.preview_img_url && (
                  <img
                    src={`${SOCKET_URL}${recipe.preview_img_url}`}
                    alt={recipe.title}
                    className="profile-recipe-image"
                  />
                )}
                <CardContent>
                  <h3>{recipe.title}</h3>
                  <p className="truncate-2-lines">{recipe.description}</p>
                  <div
                    className="recipe-card__rating"
                    style={{ marginTop: 10 }}
                  >
                    ⭐{" "}
                    {recipe.rating ??
                      recipe.averageRating ??
                      recipe.avgRating ??
                      "—"}
                  </div>
                  <div className="profile-recipe-footer">
                    <Badge variant="primary">{recipe.difficulty}</Badge>
                    <span className="profile-recipe-time">
                      ⏱️ {recipe.cooking_time} мин
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    style={{ width: "100%", marginTop: "var(--spacing-md)" }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    Смотреть рецепт
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="profile-empty">
              У этого пользователя пока нет опубликованных рецептов.
            </CardContent>
          </Card>
        )}
      </section>

      <ReportDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetType="USER"
        targetId={finalUser}
      />
    </div>
  );
};

export default UserProfilePage;
