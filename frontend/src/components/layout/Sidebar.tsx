import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  userRole: "admin" | "user" | null;
}

const Sidebar = ({ isCollapsed, onToggle, userRole }: SidebarProps) => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(true);

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`} aria-label="Main navigation">
      <div className="sidebar-header">
        {!isCollapsed ? (
          <NavLink to="/dashboard" className="brand-link">
            <span className="brand-icon">📦</span>
            <span className="brand-text">Inventory Manager</span>
          </NavLink>
        ) : (
          <NavLink to="/dashboard" className="brand-link" title="Inventory Manager"><span className="brand-icon">📦</span></NavLink>
        )}
        <button className="sidebar-toggle" onClick={onToggle} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {isCollapsed ? "⟩" : "⟨"}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="nav-icon">📊</span>{!isCollapsed && <span className="nav-text">Dashboard</span>}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/master/products" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="nav-icon">📦</span>{!isCollapsed && <span className="nav-text">Products</span>}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="nav-icon">🛒</span>{!isCollapsed && <span className="nav-text">Orders</span>}
            </NavLink>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${location.pathname.startsWith("/master/categories") || location.pathname.startsWith("/master/users") ? "active" : ""}`}
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <span className="nav-icon">⚙️</span>{!isCollapsed && <span className="nav-text">Settings</span>}
              {!isCollapsed && <span className="nav-chevron">{settingsOpen ? "▼" : "▶"}</span>}
            </button>
            {!isCollapsed && settingsOpen && (
              <ul className="nav-sublist">
                <li>
                    <NavLink to="/master/users" className={({ isActive }) => `nav-sublink ${isActive ? "active" : ""}`}>
                      <span className="nav-icon">👥</span><span className="nav-text">Users</span>
                    </NavLink>
                  </li>
                <li>
                  <NavLink to="/master/categories" className={({ isActive }) => `nav-sublink ${isActive ? "active" : ""}`}>
                    <span className="nav-icon">📂</span><span className="nav-text">Categories</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details"><span className="user-name">User</span><span className="user-role">{userRole || "user"}</span></div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
