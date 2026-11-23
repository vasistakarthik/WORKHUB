
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

import {
    Search,
    Plus,
    Layers3,
    ChartNoAxesColumnIncreasing,
    CircleCheck,
    PauseCircle,
    SlidersHorizontal,
    List,
    RotateCcw,
    CalendarDays,
    Users,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";

import { workhubApiRequest } from "../../auth/authConfig";
import "./Projects.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get WorkHub API access token
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

// Format date
function formatDate(dateValue) {
    if (!dateValue) return "Not set";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Not set";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    });
}

// Normalize status
function normalizeStatus(status) {
    const value = String(status || "active").toLowerCase();

    if (value === "completed") return "Completed";
    if (value === "on hold" || value === "on_hold") return "On Hold";

    return "Active";
}

function Projects() {
    const { instance } = useMsal();

    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [teamFilter, setTeamFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState("list");

    // Fetch projects from FastAPI
    useEffect(() => {
        let isMounted = true;

        async function fetchProjects() {
            try {
                setLoading(true);
                setError("");

                if (!API_BASE_URL) {
                    throw new Error(
                        "VITE_API_BASE_URL is missing from your frontend .env file."
                    );
                }

                const accessToken = await getAccessToken(instance);

                const response = await fetch(
                    `${API_BASE_URL}/projects`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            Accept: "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to load projects."
                    );
                }

                if (isMounted) {
                    setProjects(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.message || "Something went wrong while loading projects."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProjects();

        return () => {
            isMounted = false;
        };
    }, [instance]);

    // Statistics
    const stats = useMemo(() => {
        return {
            total: projects.length,
            active: projects.filter(
                (project) =>
                    normalizeStatus(project.status) === "Active"
            ).length,
            completed: projects.filter(
                (project) =>
                    normalizeStatus(project.status) === "Completed"
            ).length,
            onHold: projects.filter(
                (project) =>
                    normalizeStatus(project.status) === "On Hold"
            ).length,
        };
    }, [projects]);

    // Team filter options
    const teamOptions = useMemo(() => {
        const names = projects.flatMap((project) =>
            (project.team_members || [])
                .map((member) => member.name)
                .filter(Boolean)
        );

        return [...new Set(names)].sort();
    }, [projects]);

    // Search and filters
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                project.project_name?.toLowerCase().includes(searchValue) ||
                project.project_key?.toLowerCase().includes(searchValue) ||
                project.description?.toLowerCase().includes(searchValue);

            const projectStatus = normalizeStatus(project.status);

            const matchesStatus =
                statusFilter === "All" ||
                projectStatus === statusFilter;

            const matchesTeam =
                teamFilter === "All" ||
                (project.team_members || []).some(
                    (member) => member.name === teamFilter
                );

            return matchesSearch && matchesStatus && matchesTeam;
        });
    }, [projects, search, statusFilter, teamFilter]);

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("All");
        setTeamFilter("All");
    };

    return (
        <main className="projects-page">

            {/* PAGE HEADER */}
            <section className="projects-header">
                <div className="projects-heading-content">
                    <div className="projects-breadcrumb">
                        <span>‹</span>
                        <span className="breadcrumb-muted">Workspace</span>
                        <span>/</span>
                        <strong>Projects</strong>
                    </div>

                    <h1>Projects</h1>

                    <p>
                        Plan, track and deliver your team's projects.
                    </p>
                </div>

                <Link to="create" className="create-project-btn">
                    <Plus size={19} />
                    <span>Create Project</span>
                </Link>
            </section>

            {/* SUMMARY CARDS */}
            <section className="projects-stats">

                <div className="project-stat-card">
                    <div className="project-stat-icon blue">
                        <Layers3 size={25} />
                    </div>

                    <div>
                        <h2>{stats.total}</h2>
                        <p>Total Projects</p>
                    </div>
                </div>

                <div className="project-stat-card">
                    <div className="project-stat-icon green">
                        <ChartNoAxesColumnIncreasing size={25} />
                    </div>

                    <div>
                        <h2>{stats.active}</h2>
                        <p>Active Projects</p>
                    </div>
                </div>

                <div className="project-stat-card">
                    <div className="project-stat-icon purple">
                        <CircleCheck size={25} />
                    </div>

                    <div>
                        <h2>{stats.completed}</h2>
                        <p>Completed</p>
                    </div>
                </div>

                <div className="project-stat-card">
                    <div className="project-stat-icon yellow">
                        <PauseCircle size={25} />
                    </div>

                    <div>
                        <h2>{stats.onHold}</h2>
                        <p>On Hold</p>
                    </div>
                </div>

            </section>

            {/* SEARCH AND FILTERS */}
            <section className="projects-filters">

                <div className="project-search">
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search projects by name or key..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                    aria-label="Filter by status"
                >
                    <option value="All">Status: All</option>
                    <option value="Active">Status: Active</option>
                    <option value="Completed">Status: Completed</option>
                    <option value="On Hold">Status: On Hold</option>
                </select>

                <select
                    value={teamFilter}
                    onChange={(event) =>
                        setTeamFilter(event.target.value)
                    }
                    aria-label="Filter by team member"
                >
                    <option value="All">Team: All</option>

                    {teamOptions.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="filter-icon-btn"
                    title="Filter options"
                >
                    <SlidersHorizontal size={19} />
                </button>

                <div className="projects-view-actions">
                    <button
                        type="button"
                        className={`view-toggle-btn ${viewMode === "list" ? "selected" : ""
                            }`}
                        onClick={() => setViewMode("list")}
                        title="List view"
                    >
                        <List size={20} />
                    </button>
                </div>

                <button
                    type="button"
                    className="reset-filter-btn"
                    onClick={resetFilters}
                    title="Reset filters"
                >
                    <RotateCcw size={17} />
                </button>

            </section>

            {/* PROJECT CONTENT */}
            <section className="projects-content">

                {loading && (
                    <div className="projects-message">
                        <LoaderCircle className="loading-icon" size={28} />
                        <p>Loading your projects...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="projects-message error-message">
                        <AlertCircle size={27} />
                        <h3>Unable to load projects</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && filteredProjects.length === 0 && (
                    <div className="projects-empty-state">
                        <div className="empty-folder-icon">
                            <FolderKanban size={27} />
                        </div>

                        <h3>
                            {projects.length === 0
                                ? "No Projects Found"
                                : "No Matching Projects"}
                        </h3>

                        <p>
                            {projects.length === 0
                                ? "Create your first project to start planning work, tracking tasks and collaborating with your team."
                                : "Try changing your search or filters to find a project."}
                        </p>

                        {projects.length === 0 ? (
                            <Link
                                to="create"
                                className="create-project-btn empty-create-btn"
                            >
                                <Plus size={17} />
                                Create Project
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="reset-filter-btn empty-reset-btn"
                                onClick={resetFilters}
                            >
                                <RotateCcw size={16} />
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && filteredProjects.length > 0 && (
                    <div className="projects-table-container">

                        <table className="projects-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Key</th>
                                    <th>Template</th>
                                    <th>Team</th>
                                    <th>Start Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProjects.map((project) => {
                                    const status = normalizeStatus(project.status);
                                    const members = project.team_members || [];

                                    return (
                                        <tr key={project.id}>
                                            <td>
                                                <div className="project-name-cell">
                                                    <div className="project-logo">
                                                        <span>W</span>
                                                    </div>

                                                    <div className="project-name-info">
                                                        <Link
                                                            to={project.id}
                                                            className="project-name-link"
                                                        >
                                                            {project.project_name}
                                                        </Link>

                                                        <span>
                                                            {project.description ||
                                                                "No description provided"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="project-key">
                                                    {project.project_key}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="project-template">
                                                    <Layers3 size={20} />
                                                    <span>
                                                        {(project.template || "basic")
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            (project.template || "basic").slice(1)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="project-team">
                                                    <Users size={20} />
                                                    <span>
                                                        {members.length}{" "}
                                                        {members.length === 1
                                                            ? "Member"
                                                            : "Members"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="project-date">
                                                    <CalendarDays size={19} />
                                                    <span>
                                                        {formatDate(
                                                            project.sprint_configuration?.start_date
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`project-status ${status
                                                        .toLowerCase()
                                                        .replace(" ", "-")}`}
                                                >
                                                    <span className="status-dot" />
                                                    {status}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="project-more-btn"
                                                    title="Project actions"
                                                    onClick={() =>
                                                        console.log(
                                                            "Project:",
                                                            project.id
                                                        )
                                                    }
                                                >
                                                    <MoreHorizontal size={21} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="projects-table-footer">
                            <span>
                                Showing {filteredProjects.length} of{" "}
                                {projects.length}{" "}
                                {projects.length === 1 ? "project" : "projects"}
                            </span>

                            <div className="projects-pagination">
                                <button type="button" disabled>
                                    <ChevronLeft size={19} />
                                </button>

                                <button
                                    type="button"
                                    className="current-page"
                                    disabled
                                >
                                    1
                                </button>

                                <button type="button" disabled>
                                    <ChevronRight size={19} />
                                </button>
                            </div>
                        </div>

                    </div>
                )}

            </section>
        </main>
    );
}

export default Projects;
