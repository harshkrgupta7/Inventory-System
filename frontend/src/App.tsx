import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import UserListPage from "./pages/Master/User/UserListPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/master/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserListPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;