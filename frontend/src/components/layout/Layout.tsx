import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="layout-loading">
        <div className="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={`layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""} ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}>
      <div className="sidebar-overlay" onClick={closeMobileMenu} aria-hidden="true" />
      <Sidebar
        isCollapsed={isSidebarCollapsed || isMobile}
        onToggle={toggleSidebar}
        userRole={user?.role || null}
      />
      <div className="layout-main">
        <Header onMenuClick={toggleSidebar} />
        <main className="layout-content" role="main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;