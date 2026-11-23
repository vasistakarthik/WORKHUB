
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserRound,
  CheckSquare,
  RefreshCw,
  BarChart3,
  CalendarDays,
  Layers3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  FileText,
  ClipboardList,
  ListTodo,
  Bell,
  UserCircle,
} from "lucide-react";

import { getRoleMenu } from "../../config/roleMenu";

import "./Sidebar.css";

// Map icon names from roleMenu.js to Lucide components
const iconMap = {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserRound,
  CheckSquare,
  RefreshCw,
  BarChart3,
  CalendarDays,
  Layers3,
  Settings,
  FileText,
  ClipboardList,
  ListTodo,
  Bell,
  UserCircle,
};

function Sidebar({
  user,
  role = "employee",
  collapsed = false,
  onToggle,
}) {
  const navigate = useNavigate();

  // Get navigation items based on logged-in user's role
  const menuItems = getRoleMenu(role);

  const displayName =
    user?.name || user?.email?.split("@")[0] || "WorkHub User";

  const displayRole =
    role.charAt(0).toUpperCase() + role.slice(1);

  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    sessionStorage.removeItem("workhub_verified_user");
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`workhub-sidebar ${collapsed ? "sidebar-collapsed" : ""
        }`}
    >
      {/* BRAND HEADER */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <span>W</span>
        </div>

        {!collapsed && (
          <div className="brand-content">
            <h1>WorkHub</h1>
            <p>INTERNAL PROJECT MANAGEMENT</p>
          </div>
        )}

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
        </button>
      </div>

      {/* USER PROFILE */}
      {!collapsed && (
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {firstLetter}
            <span className="profile-online-dot" />
          </div>

          <div className="profile-details">
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>

          <ChevronDown
            size={19}
            className="profile-chevron"
          />
        </div>
      )}

      {/* COLLAPSED PROFILE */}
      {collapsed && (
        <div className="collapsed-profile">
          <div className="profile-avatar">
            {firstLetter}
            <span className="profile-online-dot" />
          </div>
        </div>
      )}

      {/* ROLE-BASED NAVIGATION */}
      <nav className="sidebar-navigation">
        {!collapsed && (
          <p className="sidebar-section-title">
            MAIN MENU
          </p>
        )}

        <div className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                title={collapsed ? item.title : undefined}
                className={({ isActive }) =>
                  `sidebar-menu-item ${isActive ? "active" : ""
                  } ${collapsed ? "icon-only" : ""}`
                }
              >
                <Icon
                  size={21}
                  strokeWidth={2}
                  className="menu-item-icon"
                />

                {!collapsed && (
                  <>
                    <span className="menu-item-label">
                      {item.title}
                    </span>

                    {item.path === "/dashboard" && (
                      <ChevronRight
                        size={17}
                        className="menu-active-arrow"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* BOTTOM LOGOUT */}
      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={19} />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
