import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  Label,
  Alert,
  PasswordToggle,
} from "../../components/ui";
import "./Auth.css";

const registerSchema = z
  .object({
    name: z.string().min(2, "Имя должно содержать не менее 2 символов"),
    email: z.string().email("Неверный адрес эл. почты"),
    password: z.string().min(6, "Пароль должен содержать не менее 6 символов"),
    confirmPassword: z.string(),
    acceptLicenseAgreement: z.boolean().refine((value) => value === true, {
      message: "Вы должны принять лицензионное соглашение",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading, error } = useAuth();
  const [localError, setLocalError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLocalError(null);
    const {
      confirmPassword: _confirmPassword,
      acceptLicenseAgreement: _acceptLicenseAgreement,
      ...userData
    } = data;
    const result = await registerUser(userData);
    if (result.success) {
      navigate("/");
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <CardHeader>Создать аккаунт</CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" onClose={() => {}}>
              {typeof error === "string"
                ? error
                : "Регистрация не удалась. Пожалуйста, попробуйте сноваопробуйте снова."}
            </Alert>
          )}
          {localError && (
            <Alert variant="error" onClose={() => setLocalError(null)}>
              {localError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group-input">
              <Label htmlFor="name">Имя и фамилия</Label>
              <Input
                id="name"
                type="text"
                placeholder="Иван Ивановнов"
                {...register("name")}
                error={!!errors.name}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            <div className="form-group-input">
              <Label htmlFor="email">Эл. почта</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                error={!!errors.email}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group-input">
              <Label htmlFor="password">Пароль</Label>
              <PasswordToggle
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={!!errors.password}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group-input">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <PasswordToggle
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                error={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <span className="error-message">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <div className="form-group-input checkbox-group">
              <input
                id="acceptLicenseAgreement"
                type="checkbox"
                {...register("acceptLicenseAgreement")}
              />
              <label
                className="checkbox-label"
                htmlFor="acceptLicenseAgreement"
              >
                Я соглашаюсь с
                {
                  <Link to="/license-agreement" className="auth-link">
                    {" "}
                    лицензионным соглашением
                  </Link>
                }
              </label>
              {errors.acceptLicenseAgreement && (
                <span className="error-message">
                  {errors.acceptLicenseAgreement.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Создание аккаунта..." : "Создать аккаунт"}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Уже есть аккаунт?{" "}
              <Link to="/login" className="auth-link">
                Войдите
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
