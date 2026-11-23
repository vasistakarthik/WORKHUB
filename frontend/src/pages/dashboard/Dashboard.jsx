
import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

import {
  Layers3,
  ClipboardList,
  Users,
  Zap,
  TrendingUp,
  BriefcaseBusiness,
  ListChecks,
  Flag,
  Activity,
  Plus,
  ArrowRight,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import {
  workhubApiRequest,
} from "../../auth/authConfig";

import "./Dashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ========================================
// AUTHENTICATION
// ========================================

async function getAccessToken(instance) {
  const account =
    instance.getActiveAccount() ||
    instance.getAllAccounts()[0];

  if (!account) {
    throw new Error("Please sign in to WorkHub again.");
  }

  try {
    const response = await instance.acquireTokenSilent({
      ...workhubApiRequest,
      account,
    });

    return response.accessToken;

  } catch (error) {

    if (error instanceof InteractionRequiredAuthError) {
      const response = await instance.acquireTokenPopup({
        ...workhubApiRequest,
        account,
      });

      return response.accessToken;
    }

    throw error;
  }
}

// ========================================
// API REQUEST
// ========================================

async function fetchDashboardData(instance, endpoint, token) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || `Unable to load ${endpoint}.`
    );
  }

  return data;
}

// ========================================
// HELPERS
// ========================================

function normalizeStatus(status) {
  return String(status || "active")
    .toLowerCase()
    .replace(/_/g, " ")
    .trim();
}

function isActiveProject(project) {
  return normalizeStatus(project.status) === "active";
}

function isActiveUser(user) {
  return normalizeStatus(user.status) === "active";
}

// ========================================
// EMPTY STATE
// ========================================

function EmptyState({
  icon: Icon,
  title,
  description,
  linkText,
  to,
}) {
  return (
    <div className="scrum-empty-state">

      <div className="scrum-empty-icon">
        <Icon size={25} strokeWidth={1.9} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {linkText && to && (
        <Link to={to} className="scrum-empty-link">
          {linkText}
          <ArrowRight size={15} />
        </Link>
      )}

    </div>
  );
}

// ========================================
// REUSABLE DASHBOARD PANEL
// ========================================

function DashboardPanel({ children, className = "" }) {
  return (
    <article className={`dashboard-panel ${className}`}>
      {children}
    </article>
  );
}

// ========================================
// MANAGER DASHBOARD
// ========================================

function Dashboard() {

  const { instance } = useMsal();

  const { user, role: contextRole } =
    useOutletContext() || {};

  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState(null);

  const [loading, setLoading] = useState(true);
  const [projectError, setProjectError] = useState("");
  const [userError, setUserError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  // ========================================
  // ROLE AND USER INFORMATION
  // ========================================

  const role = (
    contextRole || user?.role || "employee"
  ).toLowerCase();

  const dashboardTitle =
    role.charAt(0).toUpperCase() +
    role.slice(1) +
    " Dashboard";

  const name =
    user?.name?.split(" ")[0] || "there";

  const isManager = role === "manager";

  // ========================================
  // LOAD DASHBOARD DATA
  // ========================================

  useEffect(() => {

    let isMounted = true;

    async function loadDashboard() {

      try {

        setLoading(true);
        setProjectError("");
        setUserError("");

        if (!API_BASE_URL) {
          throw new Error(
            "VITE_API_BASE_URL is missing from your frontend .env file."
          );
        }

        const token = await getAccessToken(instance);

        // Fetch projects
        try {

          const projectData =
            await fetchDashboardData(
              instance,
              "/projects",
              token
            );

          if (isMounted) {
            setProjects(
              Array.isArray(projectData)
                ? projectData
                : []
            );
          }

        } catch (error) {

          if (isMounted) {
            setProjectError(error.message);
            setProjects([]);
          }
        }

        // Fetch team members for Manager
        if (isManager) {

          try {

            const userData =
              await fetchDashboardData(
                instance,
                "/users",
                token
              );

            if (isMounted) {
              setTeamMembers(
                Array.isArray(userData)
                  ? userData
                  : []
              );
            }

          } catch (error) {

            if (isMounted) {
              setUserError(error.message);
              setTeamMembers(null);
            }
          }
        }

      } catch (error) {

        if (isMounted) {
          setProjectError(error.message);
        }

      } finally {

        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };

  }, [instance, isManager, refreshKey]);

  // ========================================
  // CALCULATE REAL STATISTICS
  // ========================================

  const statistics = useMemo(() => {

    const activeProjects = projects.filter(
      isActiveProject
    ).length;

    const activeMembers = teamMembers
      ? teamMembers.filter(isActiveUser).length
      : null;

    return {
      activeProjects,
      totalProjects: projects.length,
      activeMembers,
    };

  }, [projects, teamMembers]);

  // ========================================
  // KPI CARDS
  // ========================================

  const stats = [
    {
      label: "Active Projects",
      value: loading
        ? "..."
        : statistics.activeProjects,
      note: "Currently active projects",
      icon: Layers3,
      color: "cyan",
    },
    {
      label: "Total Work Items",
      value: "—",
      note: "Work Items API not available yet",
      icon: ClipboardList,
      color: "blue",
    },
    {
      label: "Team Members",
      value: loading
        ? "..."
        : statistics.activeMembers ?? "—",
      note: "Active registered members",
      icon: Users,
      color: "green",
    },
    {
      label: "Active Sprints",
      value: "—",
      note: "Sprint module not available yet",
      icon: Zap,
      color: "purple",
    },
    {
      label: "Overall Sprint Progress",
      value: "—",
      note: "Available after Scrum implementation",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  // ========================================
  // REFRESH DASHBOARD
  // ========================================

  function refreshDashboard() {
    setRefreshKey((previous) => previous + 1);
  }

  // ========================================
  // RENDER
  // ========================================

  return (

    <div className="scrum-dashboard">

      {/* ==================================
                HEADER
            ================================== */}

      <header className="scrum-header">

        <div className="scrum-header-content">

          <span className="scrum-eyebrow">
            SCRUM WORKSPACE
          </span>

          <h1>{dashboardTitle}</h1>

          <h2>
            Welcome back, <span>{name}!</span> 👋
          </h2>

          <p>
            Here's your Scrum overview across projects,
            sprints and team performance.
          </p>

        </div>

        {/* CURRENT SPRINT */}

        <div className="current-sprint">

          <div className="current-sprint-icon">
            <CalendarDays size={25} />
          </div>

          <div className="current-sprint-content">

            <small>Current Sprint</small>

            <strong>No active sprint</strong>

            <span>
              Create a sprint to see its progress here.
            </span>

          </div>

          <Link
            to="/dashboard/sprints"
            className="current-sprint-action"
            aria-label="Explore sprints"
          >
            <ArrowRight size={20} />
          </Link>

        </div>

      </header>

      {/* ==================================
                ERROR MESSAGES
            ================================== */}

      {!loading && projectError && (

        <div className="dashboard-error">

          <AlertCircle size={20} />

          <span>{projectError}</span>

          <button
            type="button"
            onClick={refreshDashboard}
          >
            Retry
          </button>

        </div>

      )}

      {!loading && userError && isManager && (

        <div className="dashboard-warning">

          <AlertCircle size={18} />

          <span>
            Team member statistics could not be loaded.
            Check your manager permissions or Users API.
          </span>

        </div>

      )}

      {/* ==================================
                KPI STATISTICS
            ================================== */}

      <section className="scrum-stats">

        {stats.map((item) => {

          const Icon = item.icon;

          return (

            <article
              className={`stat-card ${item.color}`}
              key={item.label}
            >

              <div className="stat-icon">
                <Icon
                  size={26}
                  strokeWidth={2}
                />
              </div>

              <div className="stat-content">

                <strong>{item.value}</strong>

                <h3>{item.label}</h3>

                <small>{item.note}</small>

              </div>

            </article>

          );

        })}

      </section>

      {/* ==================================
                ANALYTICS
            ================================== */}

      <section className="scrum-analytics">

        {/* SPRINT BURNDOWN */}

        <DashboardPanel>

          <div className="panel-heading">

            <h3>
              <Activity size={19} />
              Sprint Burndown
            </h3>

            <span>Sprint progress</span>

          </div>

          <EmptyState
            icon={Activity}
            title="No sprint burndown data"
            description="Sprint progress and remaining work will appear after a sprint starts and work items are tracked."
            linkText="Explore Sprints"
            to="/dashboard/sprints"
          />

        </DashboardPanel>

        {/* WORK ITEM STATUS */}

        <DashboardPanel>

          <div className="panel-heading">

            <h3>
              <ListChecks size={19} />
              Work Item Status
            </h3>

            <span>Work distribution</span>

          </div>

          <EmptyState
            icon={ListChecks}
            title="No work items created"
            description="To Do, In Progress, In Review and Done work items will appear here."
            linkText="View Work Items"
            to="/dashboard/work-items"
          />

        </DashboardPanel>

        {/* TEAM VELOCITY */}

        <DashboardPanel>

          <div className="panel-heading">

            <h3>
              <TrendingUp size={19} />
              Team Velocity
            </h3>

            <span>Last 5 sprints</span>

          </div>

          <EmptyState
            icon={TrendingUp}
            title="No sprint history available"
            description="Team velocity will be calculated after sprints are completed."
            linkText="View Sprints"
            to="/dashboard/sprints"
          />

        </DashboardPanel>

      </section>

      {/* ==================================
                BOTTOM SECTION
            ================================== */}

      <section className="scrum-bottom">

        {/* ACTIVE SPRINTS */}

        <DashboardPanel className="active-sprints-panel">

          <div className="panel-heading bottom-heading">

            <div className="bottom-heading-title">

              <h3>
                <BriefcaseBusiness size={20} />
                Active Sprints
              </h3>

              <span>
                Manage your team's sprint activity
              </span>

            </div>

            <div className="panel-actions">

              <Link to="/dashboard/sprints">
                View All
              </Link>

              <Link
                to="/dashboard/sprints"
                className="create-sprint"
              >
                <Plus size={17} />
                Create Sprint
              </Link>

            </div>

          </div>

          <EmptyState
            icon={BriefcaseBusiness}
            title="No sprints created yet"
            description="Create your first Scrum sprint to plan work, assign items and track team progress."
            linkText="Create Your First Sprint"
            to="/dashboard/sprints"
          />

        </DashboardPanel>

        {/* ACTION ITEMS */}

        <DashboardPanel className="action-items-panel">

          <div className="panel-heading bottom-heading">

            <div className="bottom-heading-title">

              <h3>
                <CheckCircle2 size={20} />
                My Action Items
              </h3>

              <span>Your pending activities</span>

            </div>

            <Link to="/dashboard/tasks">
              View All
            </Link>

          </div>

          <EmptyState
            icon={Flag}
            title="No pending action items"
            description="Your assigned reviews, approvals and upcoming Scrum activities will appear here once the task module is available."
            linkText="View My Tasks"
            to="/dashboard/tasks"
          />

        </DashboardPanel>

      </section>

      {/* ==================================
                FOOTER REFRESH
            ================================== */}

      <div className="dashboard-footer">

        <span>
          {loading ? (
            <>
              <LoaderCircle
                size={15}
                className="loading-icon"
              />
              Updating dashboard...
            </>
          ) : (
            <>
              <CheckCircle2 size={15} />
              Dashboard data loaded
            </>
          )}
        </span>

        <button
          type="button"
          onClick={refreshDashboard}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>

      </div>

    </div>
  );
}

export default Dashboard;
