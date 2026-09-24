import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/master/products": "Products",
  "/master/categories": "Categories",
  "/master/users": "Users",
  "/orders": "Orders",
  "/profile": "Profile",
};

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageLabel = location.pathname.startsWith("/orders/") ? "Orders" : pageLabels[location.pathname] || "Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header" role="banner">
      <button className="header-menu-btn" onClick={onMenuClick} aria-label="Open navigation">
        <span className="hamburger" />
      </button>

      <h1 className="header-page-title">{pageLabel}</h1>

      <div className="header-user-menu">
        <button className="profile-button" aria-label="Open profile menu" title={user?.name || "Profile"}>
          <span className="profile-avatar">{(user?.name || "U").charAt(0).toUpperCase()}</span>
          <span className="profile-chevron">⌄</span>
        </button>
        <div className="user-dropdown" role="menu">
          <div className="dropdown-header">
            <span className="dropdown-user-name">{user?.name || "User"}</span>
            <span className="dropdown-user-email">{user?.email || "user@example.com"}</span>
          </div>
          <div className="dropdown-divider" />
          <Link to="/profile" className="dropdown-item" role="menuitem">👤 Profile</Link>
          <button onClick={handleLogout} className="dropdown-item logout" role="menuitem">↪ Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
