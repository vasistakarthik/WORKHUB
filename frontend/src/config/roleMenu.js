export const roleMenu = {
  manager: [
    { title: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { title: "Projects", path: "/dashboard/projects", icon: "FolderKanban" },
    { title: "My Team", path: "/dashboard/teams", icon: "Users" },
    { title: "Tasks", path: "/dashboard/tasks", icon: "CheckSquare" },
    { title: "Sprints", path: "/dashboard/sprints", icon: "RefreshCw" },
    { title: "Reports", path: "/dashboard/reports", icon: "BarChart3" },
    { title: "Calendar", path: "/dashboard/calendar", icon: "CalendarDays" },
    { title: "Work Items", path: "/dashboard/work-items", icon: "FileText" },
    { title: "People", path: "/dashboard/people", icon: "UserRound" },
    { title: "Settings", path: "/dashboard/settings", icon: "Settings" },
  ],

  lead: [
    { title: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { title: "My Projects", path: "/dashboard/projects", icon: "FolderKanban" },
    { title: "Scrum Board", path: "/dashboard/board", icon: "ClipboardList" },
    { title: "Backlog", path: "/dashboard/backlog", icon: "ListTodo" },
    { title: "Sprints", path: "/dashboard/sprints", icon: "RefreshCw" },
    { title: "Team Members", path: "/dashboard/teams", icon: "Users" },
    { title: "Reports", path: "/dashboard/reports", icon: "BarChart3" },
  ],

  employee: [
    { title: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { title: "My Tasks", path: "/dashboard/tasks", icon: "CheckSquare" },
    { title: "My Work Items", path: "/dashboard/work-items", icon: "FileText" },
    { title: "My Sprint", path: "/dashboard/sprints", icon: "RefreshCw" },
    { title: "Calendar", path: "/dashboard/calendar", icon: "CalendarDays" },
    { title: "Notifications", path: "/dashboard/notifications", icon: "Bell" },
    { title: "Profile", path: "/dashboard/profile", icon: "UserCircle" },
  ],
};

export function getRoleMenu(role) {
  return roleMenu[role?.toLowerCase()] || roleMenu.employee;
}