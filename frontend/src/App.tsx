import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserListPage from "./pages/Master/User/UserListPage";
import ProductsListPage from "./pages/Master/Products/ProductsListPage";
import ProductFormPage from "./pages/Master/Products/ProductFormPage";
import CategoryListPage from "./pages/Master/Category/CategoryListPage";
import CategoryFormPage from "./pages/Master/Category/CategoryFormPage";
import OrdersListPage from "./pages/Orders/OrdersListPage";
import OrderCreatePage from "./pages/Orders/OrderCreatePage";
import OrderViewPage from "./pages/Orders/OrderViewPage";
import OrderEditPage from "./pages/Orders/OrderEditPage";
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/master/users" element={<UserListPage />} />
        <Route path="/master/products" element={<ProductsListPage />} />
        <Route path="/master/products/new" element={<ProductFormPage />} />
        <Route path="/master/products/:id/edit" element={<ProductFormPage />} />
        <Route path="/master/categories" element={<CategoryListPage />} />
        <Route path="/master/categories/new" element={<CategoryFormPage />} />
        <Route path="/master/categories/:id/edit" element={<CategoryFormPage />} />
        <Route path="/orders" element={<OrdersListPage />} />
        <Route path="/orders/new" element={<OrderCreatePage />} />
        <Route path="/orders/:id" element={<OrderViewPage />} />
        <Route path="/orders/:id/edit" element={<OrderEditPage />} />
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