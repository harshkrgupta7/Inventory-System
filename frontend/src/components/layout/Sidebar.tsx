import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  children?: NavItem[];
  roles?: ("admin" | "user")[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  {
    label: "Master",
    path: "/master",
    icon: "⚙️",
    children: [
      { label: "Users", path: "/master/users", icon: "👥", roles: ["admin"] },
      { label: "Products", path: "/master/products", icon: "📦" },
      { label: "Categories", path: "/master/categories", icon: "📂" },
    ],
  },
  { label: "Reports", path: "/reports", icon: "📈" },
  { label: "Settings", path: "/settings", icon: "⚙️" },
];

const Sidebar = ({ isCollapsed, onToggle, userRole }: { isCollapsed: boolean; onToggle: () => void; userRole: "admin" | "user" | null }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(["/master"]));

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const isChildActive = (parentPath: string) => location.pathname.startsWith(parentPath) && location.pathname !== parentPath;

  const filteredItems = navItems.filter((item) => !item.roles || (userRole && item.roles.includes(userRole)));

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`} role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-brand">
            <NavLink to="/dashboard" className="brand-link">
              <span className="brand-icon">📦</span>
              <span className="brand-text">Inventory Manager</span>
            </NavLink>
          </div>
        )}
        {isCollapsed && (
          <NavLink to="/dashboard" className="brand-link collapsed" title="Inventory Manager">
            <span className="brand-icon">📦</span>
          </NavLink>
        )}
        <button className="sidebar-toggle" onClick={onToggle} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!isCollapsed}>
          {isCollapsed ? "⟩" : "⟨"}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredItems.map((item) => (
            <li key={item.path} className="nav-item">
              {item.children ? (
                <>
                  <button
                    className={`nav-link ${isChildActive(item.path) ? "active" : ""} ${expandedMenus.has(item.path) ? "expanded" : ""}`}
                    onClick={() => toggleMenu(item.path)}
                    aria-expanded={expandedMenus.has(item.path)}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    {!isCollapsed && <span className="nav-text">{item.label}</span>}
                    {!isCollapsed && <span className="nav-chevron">{expandedMenus.has(item.path) ? "▼" : "▶"}</span>}
                  </button>
                  {!isCollapsed && expandedMenus.has(item.path) && (
                    <ul className="nav-sublist" role="list">
                      {item.children
                        .filter((child) => !child.roles || (userRole && child.roles.includes(userRole)))
                        .map((child) => (
                          <li key={child.path} className="nav-subitem">
                            <NavLink
                              to={child.path}
                              className={({ isActive }) => `nav-sublink ${isActive ? "active" : ""}`}
                              onClick={() => setExpandedMenus((prev) => {
                                const next = new Set(prev);
                                next.delete(item.path);
                                return next;
                              })}
                            >
                              <span className="nav-icon" aria-hidden="true">{child.icon}</span>
                              <span className="nav-text">{child.label}</span>
                            </NavLink>
                          </li>
                        ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={() => isCollapsed && setExpandedMenus(new Set())}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  {!isCollapsed && <span className="nav-text">{item.label}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">User</span>
              <span className="user-role">{userRole || "user"}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;