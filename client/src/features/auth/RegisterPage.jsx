import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  Label,
  Alert,
} from "../../components/ui";
import "./Auth.css";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
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
    const { confirmPassword, ...userData } = data;
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
        <CardHeader>Create Account</CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" onClose={() => {}}>
              {typeof error === "string"
                ? error
                : "Registration failed. Please try again."}
            </Alert>
          )}
          {localError && (
            <Alert variant="error" onClose={() => setLocalError(null)}>
              {localError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                error={!!errors.name}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

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
              <Input
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

            <div className="form-group">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
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

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <button className="auth-link" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
