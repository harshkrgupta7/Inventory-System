import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getBreadcrumbs = () => {
    const path = window.location.pathname;
    if (path === "/dashboard") return [{ label: "Dashboard", path: "/dashboard" }];
    if (path.startsWith("/master/users")) return [
      { label: "Master", path: "/master" },
      { label: "Users", path: "/master/users" }
    ];
    if (path.startsWith("/master")) return [
      { label: "Master", path: "/master" },
      { label: path.split("/")[2] || "Overview", path: path }
    ];
    return [{ label: "Dashboard", path: "/dashboard" }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="header" role="banner">
      <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle navigation menu" aria-expanded="false">
        <span className="hamburger"></span>
      </button>

      <nav className="header-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator" aria-hidden="true">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="breadcrumb-current" aria-current="page">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="breadcrumb-link">{crumb.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="header-actions">
        <div className="header-search" role="search">
          <input
            type="search"
            placeholder="Search..."
            className="search-input"
            aria-label="Search"
          />
          <span className="search-icon" aria-hidden="true">🔍</span>
        </div>

        <div className="header-notifications" role="button" aria-label="Notifications">
          <span className="notification-icon">🔔</span>
          <span className="notification-badge">3</span>
        </div>

        <div className="header-user-menu">
          <button className="user-menu-trigger" aria-expanded="false" aria-haspopup="true">
            <span className="user-avatar">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
            <span className="user-name">{user?.name || "User"}</span>
            <span className="user-chevron">▼</span>
          </button>
          <div className="user-dropdown" role="menu">
            <div className="dropdown-header">
              <span className="dropdown-user-name">{user?.name || "User"}</span>
              <span className="dropdown-user-email">{user?.email || "user@example.com"}</span>
              <span className={`dropdown-user-role ${user?.role}`}>{user?.role || "user"}</span>
            </div>
            <div className="dropdown-divider"></div>
            <Link to="/settings" className="dropdown-item" role="menuitem">⚙️ Settings</Link>
            <Link to="/profile" className="dropdown-item" role="menuitem">👤 Profile</Link>
            <div className="dropdown-divider"></div>
            <button onClick={handleLogout} className="dropdown-item logout" role="menuitem">🚪 Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;