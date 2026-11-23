
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

import {
    Users,
    Columns3,
    Layers3,
    Search,
    X,
    FolderKanban,
    CalendarDays,
    Plus,
    Check,
    AlertCircle,
} from "lucide-react";

import { workhubApiRequest } from "../../auth/authConfig";

import "./CreateProject.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// PROJECT TEMPLATES
const templates = [
    {
        id: "scrum",
        name: "Scrum Project",
        description: "Plan work in sprints, manage a backlog and track progress.",
        icon: Users,
    },
    {
        id: "kanban",
        name: "Kanban Project",
        description: "Visualize workflow and continuously deliver value.",
        icon: Columns3,
    },
    {
        id: "basic",
        name: "Basic Project",
        description: "Manage tasks and collaborate with your team.",
        icon: Layers3,
    },
];

// GET MICROSOFT API ACCESS TOKEN
async function getWorkHubAccessToken(instance) {
    const account =
        instance.getActiveAccount() ||
        instance.getAllAccounts()[0];

    if (!account) {
        throw new Error("Please sign in again to continue.");
    }

    try {
        const tokenResponse = await instance.acquireTokenSilent({
            ...workhubApiRequest,
            account,
        });

        if (!tokenResponse.accessToken) {
            throw new Error("WorkHub access token was not received.");
        }

        return tokenResponse.accessToken;

    } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
            const tokenResponse = await instance.acquireTokenPopup({
                ...workhubApiRequest,
                account,
            });

            if (!tokenResponse.accessToken) {
                throw new Error("WorkHub access token was not received.");
            }

            return tokenResponse.accessToken;
        }

        throw error;
    }
}

function CreateProject() {
    const navigate = useNavigate();
    const { instance } = useMsal();

    // PROJECT TEMPLATE
    const [template, setTemplate] = useState("scrum");

    // PROJECT INFORMATION
    const [projectName, setProjectName] = useState("");
    const [projectKey, setProjectKey] = useState("");
    const [keyEdited, setKeyEdited] = useState(false);
    const [category, setCategory] = useState("Software Development");
    const [description, setDescription] = useState("");

    // PROJECT LEAD
    const [lead, setLead] = useState("");

    // TEAM SETUP
    const [search, setSearch] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [memberRoles, setMemberRoles] = useState({});

    // REAL USERS FROM BACKEND
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // SCRUM CONFIGURATION
    const [sprintDuration, setSprintDuration] = useState("2");
    const [access, setAccess] = useState("Private");
    const [startDate, setStartDate] = useState("");

    // FORM STATES
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // GENERATE PROJECT KEY
    const generateKey = (value) =>
        value
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9 ]/g, "")
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 10);

    // FETCH REAL USERS FROM FASTAPI / MONGODB
    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);
                setError("");

                const token = await getWorkHubAccessToken(instance);

                const response = await fetch(
                    `${API_BASE_URL}/projects/available-users`,
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
                        data.detail || "Unable to load team members."
                    );
                }

                if (isMounted) {
                    setAvailableUsers(
                        data.map((user) => ({
                            ...user,
                            id: String(user.id),
                            role: String(user.role || "employee").toLowerCase(),
                        }))
                    );
                }

            } catch (err) {
                console.error("User loading error:", err);

                if (isMounted) {
                    setError(err.message || "Unable to load team members.");
                }

            } finally {
                if (isMounted) {
                    setLoadingUsers(false);
                }
            }
        };

        if (!API_BASE_URL) {
            setError("Backend API URL is not configured.");
            setLoadingUsers(false);
        } else {
            fetchUsers();
        }

        return () => {
            isMounted = false;
        };
    }, [instance]);

    // SEARCH USERS
    const filteredUsers = useMemo(() => {
        const query = search.toLowerCase();

        return availableUsers.filter(
            (user) =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
        );
    }, [availableUsers, search]);

    // SELECTED LEAD
    const selectedLead = availableUsers.find(
        (user) => user.id === lead
    );

    // AVAILABLE LEADS
    const availableLeads = availableUsers.filter(
        (user) => ["manager", "lead"].includes(user.role)
    );

    // VISIBLE TEAM MEMBERS
    const visibleUsers = filteredUsers.filter(
        (user) => user.id !== lead
    );

    // ADD OR REMOVE TEAM MEMBERS
    const toggleMember = (id) => {
        setSelectedMembers((previous) =>
            previous.includes(id)
                ? previous.filter((memberId) => memberId !== id)
                : [...previous, id]
        );
    };

    // CREATE PROJECT API
    const handleCreateProject = async () => {
        if (submitting) return;

        if (!projectName.trim()) {
            setError("Please enter a project name.");
            return;
        }

        if (!/^[A-Z][A-Z0-9]{1,9}$/.test(projectKey)) {
            setError(
                "Project key must start with a letter and contain 2–10 uppercase letters or numbers."
            );
            return;
        }

        if (!lead) {
            setError("Please select a project lead.");
            return;
        }

        if (selectedMembers.length === 0) {
            setError("Please add at least one team member.");
            return;
        }

        if (loadingUsers) {
            setError("Please wait until team members finish loading.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            // STEP 1: GET ACCESS TOKEN
            const token = await getWorkHubAccessToken(instance);

            // STEP 2: PREPARE BACKEND PAYLOAD
            const projectData = {
                project_name: projectName.trim(),
                project_key: projectKey,
                category,
                description,
                template,

                project_lead_id: lead,

                team_members: selectedMembers.map((id) => ({
                    user_id: id,
                    project_role: memberRoles[id] || "Developer",
                })),

                sprint_duration:
                    template === "scrum"
                        ? Number(sprintDuration)
                        : null,

                access,
                start_date: startDate || null,
            };

            console.log("Sending project creation request.");

            // STEP 3: SEND PROJECT TO FASTAPI
            const response = await fetch(
                `${API_BASE_URL}/projects`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(projectData),
                }
            );

            // STEP 4: READ BACKEND RESPONSE
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Project creation failed."
                );
            }

            // STEP 5: SUCCESS
            alert(
                `Project "${projectName}" created and saved successfully!`
            );

            // STEP 6: NAVIGATE TO PROJECTS PAGE
            navigate("/dashboard/projects", {
                replace: true,
            });

        } catch (err) {
            console.error("Project creation error:", err);

            setError(
                err.message || "Something went wrong while creating the project."
            );

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-project-page compact-create-page">

            {/* HEADER */}
            <div className="cp-top-header">

                <div className="create-project-breadcrumb">
                    <Link to="/dashboard/projects">Projects</Link>
                    <span>›</span>
                    <span>Create Project</span>
                </div>

                <div className="cp-heading-row">

                    <div className="create-project-heading">

                        <div className="create-heading-icon">
                            <FolderKanban size={22} />
                        </div>

                        <div>
                            <h1>Create Project</h1>
                            <p>Create a project and configure your team.</p>
                        </div>

                    </div>

                    {/* TOP RIGHT ACTIONS */}
                    <div className="cp-header-actions">

                        <button
                            type="button"
                            className="cp-cancel-button"
                            onClick={() => navigate("/dashboard/projects")}
                            disabled={submitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="cp-create-button"
                            onClick={handleCreateProject}
                            disabled={submitting || loadingUsers}
                        >
                            {submitting
                                ? "Creating..."
                                : "Create Project"}

                            <Check size={16} />
                        </button>

                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="cp-main-grid">

                {/* LEFT COLUMN */}
                <div className="cp-left-column">

                    {/* 01 PROJECT TEMPLATE */}
                    <section className="cp-section cp-template-section">

                        <div className="cp-section-title">
                            <span>01</span>

                            <div>
                                <h2>Project Template</h2>
                                <p>Choose how your project will be managed.</p>
                            </div>
                        </div>

                        <div className="cp-template-grid">

                            {templates.map((item) => {
                                const Icon = item.icon;
                                const selected = template === item.id;

                                return (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => setTemplate(item.id)}
                                        className={`cp-template-card ${selected ? "selected" : ""
                                            }`}
                                        disabled={submitting}
                                    >
                                        {selected && (
                                            <span className="cp-selected-label">
                                                Selected
                                                <Check size={11} />
                                            </span>
                                        )}

                                        <Icon size={25} />

                                        <h3>{item.name}</h3>
                                        <p>{item.description}</p>
                                    </button>
                                );
                            })}

                        </div>
                    </section>

                    {/* 02 PROJECT INFORMATION */}
                    <section className="cp-section cp-information-section">

                        <div className="cp-section-title">
                            <span>02</span>

                            <div>
                                <h2>Project Information</h2>
                                <p>Enter the basic details of your project.</p>
                            </div>
                        </div>

                        <div className="cp-form-grid">

                            {/* PROJECT NAME */}
                            <label className="cp-field">
                                Project Name <b>*</b>

                                <input
                                    value={projectName}
                                    maxLength={80}
                                    placeholder="e.g. WorkHub Development"
                                    onChange={(e) => {
                                        setProjectName(e.target.value);

                                        if (!keyEdited) {
                                            setProjectKey(
                                                generateKey(e.target.value)
                                            );
                                        }
                                    }}
                                />
                            </label>

                            {/* PROJECT KEY */}
                            <label className="cp-field">
                                Project Key <b>*</b>

                                <input
                                    value={projectKey}
                                    maxLength={10}
                                    placeholder="e.g. WHD"
                                    onChange={(e) => {
                                        setProjectKey(
                                            e.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9]/g, "")
                                        );

                                        setKeyEdited(true);
                                    }}
                                />

                                <small>
                                    Used in work item IDs, e.g. WHD-101.
                                </small>
                            </label>

                            {/* PROJECT CATEGORY */}
                            <label className="cp-field cp-full">
                                Project Category

                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option>Software Development</option>
                                    <option>Product Development</option>
                                    <option>Marketing</option>
                                    <option>Business Operations</option>
                                    <option>Research & Development</option>
                                    <option>Other</option>
                                </select>
                            </label>

                            {/* PROJECT DESCRIPTION */}
                            <label className="cp-field cp-full">
                                Description

                                <textarea
                                    rows={2}
                                    maxLength={500}
                                    value={description}
                                    placeholder="Describe the purpose and goals of this project..."
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                />

                                <small className="cp-character-count">
                                    {description.length}/500
                                </small>
                            </label>

                        </div>
                    </section>

                    {/* 05 SCRUM CONFIGURATION */}
                    {template === "scrum" ? (
                        <section className="cp-section cp-scrum-section">

                            <div className="cp-section-title">
                                <span>05</span>

                                <div>
                                    <h2>Scrum Configuration</h2>
                                    <p>
                                        Configure the initial settings for your Scrum project.
                                    </p>
                                </div>
                            </div>

                            <div className="cp-form-grid">

                                {/* SPRINT DURATION */}
                                <label className="cp-field">
                                    Sprint Duration

                                    <select
                                        value={sprintDuration}
                                        onChange={(e) =>
                                            setSprintDuration(e.target.value)
                                        }
                                    >
                                        <option value="1">1 Week</option>
                                        <option value="2">2 Weeks</option>
                                        <option value="3">3 Weeks</option>
                                        <option value="4">4 Weeks</option>
                                    </select>
                                </label>

                                {/* PROJECT ACCESS */}
                                <label className="cp-field">
                                    Project Access

                                    <select
                                        value={access}
                                        onChange={(e) => setAccess(e.target.value)}
                                    >
                                        <option>Private</option>
                                        <option>Organization</option>
                                    </select>
                                </label>

                                {/* START DATE */}
                                <label className="cp-field cp-full cp-date-field">
                                    <span>
                                        <CalendarDays size={13} />
                                        Start Date
                                    </span>

                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                    />
                                </label>

                            </div>
                        </section>
                    ) : (
                        <section className="cp-section cp-scrum-section cp-basic-note">

                            <div className="cp-section-title">
                                <span>05</span>

                                <div>
                                    <h2>Project Configuration</h2>
                                    <p>Configure access for this project.</p>
                                </div>
                            </div>

                            <label className="cp-field">
                                Project Access

                                <select
                                    value={access}
                                    onChange={(e) => setAccess(e.target.value)}
                                >
                                    <option>Private</option>
                                    <option>Organization</option>
                                </select>
                            </label>
                        </section>
                    )}

                </div>

                {/* RIGHT COLUMN */}
                <div className="cp-right-column">

                    {/* 03 PROJECT LEAD */}
                    <section className="cp-section cp-lead-section">

                        <div className="cp-section-title">
                            <span>03</span>

                            <div>
                                <h2>Project Lead</h2>
                                <p>
                                    Select the person responsible for this project.
                                </p>
                            </div>
                        </div>

                        <label className="cp-field">
                            Project Lead <b>*</b>

                            <select
                                value={lead}
                                onChange={(e) => setLead(e.target.value)}
                                disabled={loadingUsers || submitting}
                            >
                                <option value="">Select project lead</option>

                                {availableLeads.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} (
                                        {user.role.charAt(0).toUpperCase() +
                                            user.role.slice(1)}
                                        )
                                    </option>
                                ))}
                            </select>
                        </label>

                        {selectedLead && (
                            <div className="cp-lead-preview">

                                <div className="cp-avatar">
                                    {selectedLead.name.charAt(0)}
                                </div>

                                <div>
                                    <strong>{selectedLead.name}</strong>
                                    <small>{selectedLead.email}</small>
                                </div>

                            </div>
                        )}

                        {!loadingUsers && availableLeads.length === 0 && (
                            <p className="cp-no-users">
                                No active Manager or Lead accounts found.
                            </p>
                        )}

                    </section>

                    {/* 04 TEAM SETUP */}
                    <section className="cp-section cp-team-section">

                        <div className="cp-section-title">
                            <span>04</span>

                            <div>
                                <h2>Team Setup</h2>
                                <p>
                                    Search and add members who will work on this project.
                                </p>
                            </div>
                        </div>

                        {/* SEARCH USERS */}
                        <div className="cp-search">
                            <Search size={15} />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                disabled={loadingUsers}
                            />
                        </div>

                        {/* AVAILABLE USERS */}
                        <div className="cp-user-list">

                            {loadingUsers ? (
                                <p className="cp-no-users">
                                    Loading team members...
                                </p>
                            ) : (
                                <>
                                    {visibleUsers.map((user) => {
                                        const selected =
                                            selectedMembers.includes(user.id);

                                        return (
                                            <div
                                                className="cp-user-row"
                                                key={user.id}
                                            >

                                                <div className="cp-avatar">
                                                    {user.name.charAt(0)}
                                                </div>

                                                <div className="cp-user-info">
                                                    <strong>{user.name}</strong>
                                                    <small>{user.email}</small>
                                                </div>

                                                <span className="cp-user-role">
                                                    {user.role.charAt(0).toUpperCase() +
                                                        user.role.slice(1)}
                                                </span>

                                                <button
                                                    type="button"
                                                    className={`cp-add-btn ${selected ? "added" : ""
                                                        }`}
                                                    onClick={() =>
                                                        toggleMember(user.id)
                                                    }
                                                    disabled={submitting}
                                                >
                                                    {selected ? (
                                                        <>
                                                            <Check size={13} />
                                                            Added
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus size={14} />
                                                            Add
                                                        </>
                                                    )}
                                                </button>

                                            </div>
                                        );
                                    })}

                                    {visibleUsers.length === 0 && (
                                        <p className="cp-no-users">
                                            {availableUsers.length === 0
                                                ? "No registered users found. Sign in with team accounts first."
                                                : "No matching users found."}
                                        </p>
                                    )}
                                </>
                            )}

                        </div>

                        {/* SELECTED MEMBERS */}
                        <div className="cp-selected-panel">

                            <div className="cp-selected-heading">
                                <h3>Selected Members</h3>

                                <span>
                                    {selectedMembers.filter(
                                        (id) => id !== lead
                                    ).length + (lead ? 1 : 0)}
                                </span>
                            </div>

                            {/* PROJECT LEAD */}
                            {lead && selectedLead && (
                                <div className="cp-selected-user">

                                    <div className="cp-avatar">
                                        {selectedLead.name.charAt(0)}
                                    </div>

                                    <div className="cp-selected-user-info">
                                        <strong>
                                            {selectedLead.name} (Lead)
                                        </strong>
                                        <small>Project Lead</small>
                                    </div>

                                    <span className="cp-lead-tag">
                                        Lead
                                    </span>

                                </div>
                            )}

                            {/* OTHER SELECTED MEMBERS */}
                            {selectedMembers
                                .filter((id) => id !== lead)
                                .map((id) => {
                                    const user = availableUsers.find(
                                        (item) => item.id === id
                                    );

                                    if (!user) return null;

                                    return (
                                        <div
                                            className="cp-selected-user"
                                            key={id}
                                        >

                                            <div className="cp-avatar">
                                                {user.name.charAt(0)}
                                            </div>

                                            <div className="cp-selected-user-info">
                                                <strong>{user.name}</strong>

                                                <select
                                                    value={
                                                        memberRoles[id] ||
                                                        "Developer"
                                                    }
                                                    onChange={(e) =>
                                                        setMemberRoles(
                                                            (previous) => ({
                                                                ...previous,
                                                                [id]: e.target.value,
                                                            })
                                                        )
                                                    }
                                                    disabled={submitting}
                                                >
                                                    <option>Developer</option>
                                                    <option>QA</option>
                                                    <option>Designer</option>
                                                    <option>Business Analyst</option>
                                                </select>
                                            </div>

                                            <button
                                                type="button"
                                                className="cp-remove-btn"
                                                title="Remove member"
                                                onClick={() => toggleMember(id)}
                                                disabled={submitting}
                                            >
                                                <X size={15} />
                                            </button>

                                        </div>
                                    );
                                })}

                            {selectedMembers.length === 0 && !lead && (
                                <p className="cp-no-users">
                                    No members selected.
                                </p>
                            )}

                        </div>
                    </section>

                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="cp-error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

        </div>
    );
}

export default CreateProject;
