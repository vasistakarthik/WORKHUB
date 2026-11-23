
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

import {
    ArrowLeft,
    FolderKanban,
    Users,
    CalendarDays,
    UserRound,
    LoaderCircle,
    AlertCircle,
    Pencil,
    Trash2
} from "lucide-react";

import { workhubApiRequest } from "../../auth/authConfig";
import "./ProjectDetails.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get WorkHub API access token
async function getAccessToken(instance) {
    const account =
        instance.getActiveAccount() ||
        instance.getAllAccounts()[0];

    if (!account) {
        throw new Error("Please sign in again.");
    }

    try {
        const response = await instance.acquireTokenSilent({
            ...workhubApiRequest,
            account
        });

        return response.accessToken;

    } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
            const response = await instance.acquireTokenPopup({
                ...workhubApiRequest,
                account
            });

            return response.accessToken;
        }

        throw error;
    }
}

function ProjectDetails() {
    const { projectId } = useParams();
    const { instance } = useMsal();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchProjectDetails() {
            try {
                setLoading(true);
                setError("");

                if (!API_BASE_URL) {
                    throw new Error(
                        "VITE_API_BASE_URL is missing."
                    );
                }

                const accessToken = await getAccessToken(instance);

                const response = await fetch(
                    `${API_BASE_URL}/projects/${projectId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            Accept: "application/json"
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to load project details."
                    );
                }

                if (isMounted) {
                    setProject(data);
                }

            } catch (err) {
                if (isMounted) {
                    setError(
                        err.message || "Something went wrong."
                    );
                }

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProjectDetails();

        return () => {
            isMounted = false;
        };

    }, [instance, projectId]);

    if (loading) {
        return (
            <main className="project-details-page">
                <div className="project-details-message">
                    <LoaderCircle className="loading-icon" size={30} />
                    <p>Loading project details...</p>
                </div>
            </main>
        );
    }

    if (error || !project) {
        return (
            <main className="project-details-page">
                <div className="project-details-message error-message">
                    <AlertCircle size={30} />
                    <h2>Unable to load project</h2>
                    <p>{error || "Project not found."}</p>

                    <Link to="/dashboard/projects">
                        <ArrowLeft size={17} />
                        Back to Projects
                    </Link>
                </div>
            </main>
        );
    }

    const members = project.team_members || [];
    const lead = project.project_lead || {};
    const sprint = project.sprint_configuration || {};

    return (
        <main className="project-details-page">

            {/* HEADER */}
            <section className="project-details-header">

                <div>
                    <Link
                        to="/dashboard/projects"
                        className="project-back-link"
                    >
                        <ArrowLeft size={17} />
                        Back to Projects
                    </Link>

                    <div className="project-details-title">
                        <div className="project-details-logo">
                            <FolderKanban size={27} />
                        </div>

                        <div>
                            <h1>{project.project_name}</h1>

                            <span>
                                {project.project_key}
                            </span>
                        </div>
                    </div>

                    <p>
                        {project.description ||
                            "No project description provided."}
                    </p>
                </div>

                <div className="project-details-actions">
                    <button type="button" className="project-edit-btn">
                        <Pencil size={17} />
                        Edit Project
                    </button>

                    <button type="button" className="project-delete-btn">
                        <Trash2 size={17} />
                        Delete
                    </button>
                </div>

            </section>

            {/* PROJECT INFORMATION */}
            <section className="project-details-grid">

                <div className="project-info-card">
                    <div className="project-info-icon">
                        <FolderKanban size={21} />
                    </div>

                    <span>Category</span>
                    <h3>{project.category || "Not specified"}</h3>
                </div>

                <div className="project-info-card">
                    <div className="project-info-icon">
                        <Users size={21} />
                    </div>

                    <span>Team Members</span>
                    <h3>{members.length} Members</h3>
                </div>

                <div className="project-info-card">
                    <div className="project-info-icon">
                        <CalendarDays size={21} />
                    </div>

                    <span>Template</span>
                    <h3>
                        {project.template
                            ? project.template.toUpperCase()
                            : "Not specified"}
                    </h3>
                </div>

                <div className="project-info-card">
                    <div className="project-info-icon">
                        <UserRound size={21} />
                    </div>

                    <span>Status</span>
                    <h3>{project.status || "Active"}</h3>
                </div>

            </section>

            {/* PROJECT LEAD */}
            <section className="project-details-section">

                <div className="project-section-heading">
                    <UserRound size={21} />
                    <h2>Project Lead</h2>
                </div>

                <div className="project-person-card">
                    <div className="project-avatar">
                        {lead.name?.charAt(0)?.toUpperCase() || "L"}
                    </div>

                    <div>
                        <h3>{lead.name || "Not assigned"}</h3>
                        <p>{lead.email || "No email available"}</p>
                        <span>{lead.account_role || "Project Lead"}</span>
                    </div>
                </div>

            </section>

            {/* TEAM MEMBERS */}
            <section className="project-details-section">

                <div className="project-section-heading">
                    <Users size={21} />
                    <h2>Team Members</h2>
                    <span>{members.length}</span>
                </div>

                {members.length === 0 ? (
                    <p className="project-no-members">
                        No team members assigned to this project.
                    </p>
                ) : (
                    <div className="project-members-list">
                        {members.map((member) => (
                            <div
                                className="project-member-card"
                                key={member.user_id}
                            >
                                <div className="project-avatar">
                                    {member.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>

                                <div className="project-member-info">
                                    <h3>{member.name}</h3>
                                    <p>{member.email}</p>
                                </div>

                                <span className="project-member-role">
                                    {member.project_role || "Developer"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

            </section>

            {/* PROJECT SETTINGS */}
            <section className="project-details-section">

                <div className="project-section-heading">
                    <FolderKanban size={21} />
                    <h2>Project Configuration</h2>
                </div>

                <div className="project-settings-grid">

                    <div>
                        <span>Project Access</span>
                        <strong>{project.access || "Private"}</strong>
                    </div>

                    <div>
                        <span>Sprint Duration</span>
                        <strong>
                            {sprint.duration_weeks
                                ? `${sprint.duration_weeks} Weeks`
                                : "Not applicable"}
                        </strong>
                    </div>

                    <div>
                        <span>Start Date</span>
                        <strong>
                            {sprint.start_date || "Not set"}
                        </strong>
                    </div>

                    <div>
                        <span>Created By</span>
                        <strong>
                            {project.created_by?.name || "Not available"}
                        </strong>
                    </div>

                </div>

            </section>

        </main>
    );
}

export default ProjectDetails;
