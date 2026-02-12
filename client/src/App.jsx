import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { AuthProvider } from "./context/AuthContext";
// import { NotificationProvider } from "./context/NotificationContext";
import { Providers } from "./app/providers";
import { Layout } from "./components/layout/Layout";
import ProtectedRoute, { AdminRoute } from "./components/common/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import RecipeCatalogPage from "./pages/RecipeCatalogPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import SmartRecipesPage from "./pages/SmartRecipesPage";
import NotificationsPage from "./pages/NotificationsPage";

// Features
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import AddRecipePage from "./features/recipes/AddRecipePage";
import AdminPanelPage from "./features/admin/AdminPanelPage";

import "./App.css";
import ScrollToTop from "./components/common/ScrollToTop";

// Create QueryClient
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     },
//   },
// });

function AppContent() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipeCatalogPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/add-recipe"
            element={
              <ProtectedRoute>
                <AddRecipePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-recipe/:id"
            element={
              <ProtectedRoute>
                <AddRecipePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage
                  userId={JSON.parse(localStorage.getItem("user"))?.id}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-recipes"
            element={
              <ProtectedRoute>
                <SmartRecipesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanelPage />
              </AdminRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}

export default App;
