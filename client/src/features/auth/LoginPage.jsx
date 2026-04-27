import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import {
  Button,
  Input,
  PasswordToggle,
  Card,
  CardHeader,
  CardContent,
  Label,
  Alert,
} from "../../components/ui";
import "./Auth.css";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [localError, setLocalError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLocalError(null);
    const result = await login(data);
    if (result.success) {
      navigate("/");
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <CardHeader>Sign In</CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" onClose={() => {}}>
              {typeof error === "string"
                ? error
                : "Login failed. Please try again."}
            </Alert>
          )}
          {localError && (
            <Alert variant="error" onClose={() => setLocalError(null)}>
              {localError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <Label htmlFor="email">Email</Label>
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

            <div className="form-group">
              <Label htmlFor="password">Password</Label>
              <PasswordToggle
                id="password"
                placeholder="••••••••"
                {...register("password")}
                error={!!errors.password}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <button
                className="auth-link"
                onClick={() => navigate("/register")}
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
