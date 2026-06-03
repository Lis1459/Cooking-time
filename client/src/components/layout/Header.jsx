import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCountQuery } from "../../services/apiService";
import { Button } from "../ui";
import "./Header.css";
import { useState, useEffect } from "react";
import { setNavigate } from "../../services/navigation";
import { setLogout } from "../../services/authService";
import { Dropdown } from "./../ui/dropdownMenu/DropdownMenu";
import { truncateText } from "../../utils/formatters";

export const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: unreadData } = useUnreadCountQuery({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    setLogout(logout);
  }, [logout]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMobileMenuOpen, setUserMobileMenuOpen] = useState(false);

  const unreadCount = unreadData?.unreadCount || 0;

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">🍳 Cooking Time</span>
        </Link>

        <nav className={`nav ${mobileMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link">
            Главная
          </Link>
          <Link to="/recipes" className="nav-link">
            Каталог
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/smart-recipes" className="nav-link">
                Умный поиск
              </Link>
              <Link to="/favorites" className="nav-link">
                Избранное
              </Link>
            </>
          )}
          {user?.role === "ADMIN" && (
            <>
              <Link to="/admin" className="nav-link">
                Админ
              </Link>
              <Link to="/admin/statistics" className="nav-link">
                Статистика
              </Link>
            </>
          )}
        </nav>
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="notification-link">
                <span className="notification-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>
              {/* <div className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setUserMobileMenuOpen(!userMobileMenuOpen)}
                >
                  {user?.name || "User"}
                </button>
                <div
                  className={`user-dropdown ${userMobileMenuOpen ? "active" : ""}`}
                >
                  <Link to="/profile" className="dropdown-item">
                    My Profile
                  </Link>
                  <Link to="/my-recipes" className="dropdown-item">
                    My Recipes
                  </Link>
                  <Link to="/add-recipe" className="dropdown-item">
                    Add Recipe
                  </Link>
                  <Link onClick={handleLogout} className="dropdown-item danger">
                    Logout
                  </Link>
                </div>
              </div> */}
              <Dropdown
                trigger={
                  <button
                    className="user-button"
                    onClick={() => setUserMobileMenuOpen(!userMobileMenuOpen)}
                  >
                    {truncateText(user?.name, 15) || "Пользователь"}
                  </button>
                }
                items={[
                  {
                    label: "Мой профиль",
                    href: "/profile",
                  },
                  {
                    label: "Мои рецепты",
                    href: "/my-recipes",
                  },
                  {
                    label: "История приготовлений",
                    href: "/cooking-history",
                  },
                  {
                    label: "Добавить рецепт",
                    href: "/add-recipe",
                  },
                  { separator: true },
                  {
                    label: "Выйти",
                    variant: "danger",
                    onClick: handleLogout,
                  },
                ]}
              />
            </>
          ) : (
            <div className="auth-buttons">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
              >
                Войти
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/register")}
              >
                Регистрация
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
