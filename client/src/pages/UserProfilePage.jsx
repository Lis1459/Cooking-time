import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
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
} from "../components/ui";
import { ReportDialog } from "../components/common/ReportDialog";
import "./UserProfile.css";

export const UserProfilePage = () => {
  const { userId: paramsUserId } = useParams();
  const { user: authUser } = useAuth();
  const finalUser = paramsUserId || authUser?.id;
  const { data: userData, isLoading } = useUserProfileQuery(finalUser);

  const profile = userData?.profile;

  const updateProfileMutation = useUpdateProfileMutation(finalUser);
  const [isEditing, setIsEditing] = useState(false);
  const [error] = useState(null);
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

  const onSubmit = async (data) => {
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
      },
    );
  };

  if (isLoading) {
    return (
      <div className="user-profile__loading">
        <Loader size="lg" />
      </div>
    );
  }

  const isOwnProfile = !paramsUserId;

  return (
    <div className="user-profile">
      <Card>
        <CardHeader>
          <div className="profile-header">
            <div className="profile-name-section">
              <h1>{profile?.name}</h1>
              <p className="profile-email">{authUser?.email}</p>
            </div>
            <div className="profile-actions">
              {isOwnProfile ? (
                <Button
                  variant={isEditing ? "secondary" : "primary"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Отмена" : "Редактировать профиль"}
                </Button>
              ) : (
                authUser?.id && (
                  <Button
                    variant="outline"
                    onClick={() => setReportDialogOpen(true)}
                  >
                    ⚠️ Пожаловаться на пользователя
                  </Button>
                )
              )}
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
            <div className="profile-info">
              <div className="info-group">
                <label>Тип питания</label>
                <p>{profile?.diet_type || "Не указано"}</p>
              </div>

              <div className="info-group">
                <label>Аллергии</label>
                <p>{profile?.allergies || "Не указано"}</p>
              </div>

              <div className="info-group">
                <label>Кулинарные предпочтения</label>
                <p>{profile?.preferences || "Не указано"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
