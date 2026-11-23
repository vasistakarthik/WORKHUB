
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

import {
    Users,
    UserPlus,
    Search,
    Pencil,
    Trash2,
    ShieldCheck,
    UserCheck,
    UserX,
    X,
    LoaderCircle,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

import { workhubApiRequest } from "../../auth/authConfig";
import "./People.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =========================================
// GET MICROSOFT ACCESS TOKEN
// =========================================

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

// =========================================
// MAIN PEOPLE COMPONENT
// =========================================

function People() {
    const { instance } = useMsal();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "employee",
    });

    // =========================================
    // API REQUEST HELPER
    // =========================================

    const apiRequest = useCallback(async (endpoint, options = {}) => {
        if (!API_BASE_URL) {
            throw new Error(
                "VITE_API_BASE_URL is missing from your frontend .env file."
            );
        }

        const accessToken = await getAccessToken(instance);

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                    ...(options.body
                        ? { "Content-Type": "application/json" }
                        : {}),
                    ...options.headers,
                },
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.detail || "Something went wrong."
            );
        }

        return data;
    }, [instance]);

    // =========================================
    // FETCH USERS
    // =========================================

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/users");

            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to load users.");
        } finally {
            setLoading(false);
        }
    }, [apiRequest]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // =========================================
    // STATISTICS
    // =========================================

    const stats = useMemo(() => ({
        total: users.length,

        managers: users.filter(
            (user) => user.role === "manager"
        ).length,

        leads: users.filter(
            (user) => user.role === "lead"
        ).length,

        employees: users.filter(
            (user) => user.role === "employee"
        ).length,

        active: users.filter(
            (user) => user.status === "active"
        ).length,

        inactive: users.filter(
            (user) => user.status === "inactive"
        ).length,
    }), [users]);

    // =========================================
    // SEARCH AND FILTER
    // =========================================

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                user.name?.toLowerCase().includes(searchValue) ||
                user.email?.toLowerCase().includes(searchValue);

            const matchesRole =
                roleFilter === "all" ||
                user.role === roleFilter;

            const matchesStatus =
                statusFilter === "all" ||
                user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    // =========================================
    // OPEN ADD USER MODAL
    // =========================================

    const openAddModal = () => {
        setEditingUser(null);

        setFormData({
            name: "",
            email: "",
            role: "employee",
        });

        setError("");
        setShowModal(true);
    };

    // =========================================
    // OPEN EDIT USER MODAL
    // =========================================

    const openEditModal = (user) => {
        setEditingUser(user);

        setFormData({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "employee",
        });

        setError("");
        setShowModal(true);
    };

    // =========================================
    // HANDLE FORM INPUT
    // =========================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================
    // CREATE / UPDATE USER
    // =========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            if (editingUser) {
                const updatedUser = await apiRequest(
                    `/users/${editingUser.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            name: formData.name.trim(),
                            role: formData.role,
                        }),
                    }
                );

                setUsers((previous) =>
                    previous.map((user) =>
                        user.id === editingUser.id
                            ? updatedUser
                            : user
                    )
                );
            } else {
                const newUser = await apiRequest(
                    "/users",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            name: formData.name.trim(),
                            email: formData.email.trim(),
                            role: formData.role,
                        }),
                    }
                );

                setUsers((previous) => [
                    newUser,
                    ...previous,
                ]);
            }

            setShowModal(false);
            setEditingUser(null);
        } catch (err) {
            setError(err.message || "Unable to save user.");
        } finally {
            setSaving(false);
        }
    };

    // =========================================
    // ACTIVATE / DEACTIVATE USER
    // =========================================

    const toggleUserStatus = async (user) => {
        const newStatus =
            user.status === "active" ? "inactive" : "active";

        const confirmed = window.confirm(
            `Are you sure you want to ${newStatus === "active" ? "activate" : "deactivate"} ${user.name}?`
        );

        if (!confirmed) return;

        try {
            setError("");

            const updatedUser = await apiRequest(
                `/users/${user.id}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            setUsers((previous) =>
                previous.map((item) =>
                    item.id === user.id
                        ? updatedUser
                        : item
                )
            );
        } catch (err) {
            setError(err.message || "Unable to update user status.");
        }
    };

    // =========================================
    // DELETE USER
    // =========================================

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${user.name}?`
        );

        if (!confirmed) return;

        try {
            setError("");

            await apiRequest(
                `/users/${user.id}`,
                { method: "DELETE" }
            );

            setUsers((previous) =>
                previous.filter((item) => item.id !== user.id)
            );
        } catch (err) {
            setError(err.message || "Unable to delete user.");
        }
    };

    // =========================================
    // ROLE LABEL
    // =========================================

    const formatRole = (role) => {
        return role
            ? role.charAt(0).toUpperCase() + role.slice(1)
            : "Employee";
    };

    // =========================================
    // PAGE UI
    // =========================================

    return (
        <main className="people-page">

            {/* PAGE HEADER */}

            <section className="people-header">

                <div>
                    <div className="people-breadcrumb">
                        <span>Workspace</span>
                        <span>/</span>
                        <strong>People</strong>
                    </div>

                    <h1>People Management</h1>

                    <p>
                        Manage your organization members,
                        roles and account access.
                    </p>
                </div>

                <button
                    type="button"
                    className="people-add-btn"
                    onClick={openAddModal}
                >
                    <UserPlus size={19} />
                    Add Member
                </button>

            </section>

            {/* ERROR MESSAGE */}

            {error && !showModal && (
                <div className="people-error">
                    <AlertCircle size={19} />
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* STATISTICS */}

            <section className="people-stats">

                <article className="people-stat-card">
                    <div className="people-stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2>{stats.total}</h2>
                        <p>Total Members</p>
                    </div>
                </article>

                <article className="people-stat-card">
                    <div className="people-stat-icon purple">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2>{stats.managers}</h2>
                        <p>Managers</p>
                    </div>
                </article>

                <article className="people-stat-card">
                    <div className="people-stat-icon cyan">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <h2>{stats.leads}</h2>
                        <p>Team Leads</p>
                    </div>
                </article>

                <article className="people-stat-card">
                    <div className="people-stat-icon green">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2>{stats.employees}</h2>
                        <p>Employees</p>
                    </div>
                </article>

                <article className="people-stat-card">
                    <div className="people-stat-icon yellow">
                        <UserX size={24} />
                    </div>
                    <div>
                        <h2>{stats.inactive}</h2>
                        <p>Inactive Members</p>
                    </div>
                </article>

            </section>

            {/* USER DIRECTORY */}

            <section className="people-directory">

                <div className="people-directory-header">
                    <div>
                        <h2>Team Members</h2>
                        <p>
                            View and manage all organization members.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="people-refresh-btn"
                        onClick={fetchUsers}
                        disabled={loading}
                        title="Refresh users"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* SEARCH AND FILTERS */}

                <div className="people-filters">

                    <div className="people-search">
                        <Search size={19} />

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(event) =>
                            setRoleFilter(event.target.value)
                        }
                    >
                        <option value="all">All Roles</option>
                        <option value="manager">Manager</option>
                        <option value="lead">Lead</option>
                        <option value="employee">Employee</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                </div>

                {/* LOADING */}

                {loading && (
                    <div className="people-message">
                        <LoaderCircle
                            size={30}
                            className="people-loading-icon"
                        />
                        <p>Loading team members...</p>
                    </div>
                )}

                {/* EMPTY STATE */}

                {!loading && !error && filteredUsers.length === 0 && (
                    <div className="people-empty-state">
                        <Users size={38} />

                        <h3>
                            {users.length === 0
                                ? "No team members found"
                                : "No matching members"}
                        </h3>

                        <p>
                            {users.length === 0
                                ? "Add your first team member to get started."
                                : "Try changing your search or filters."}
                        </p>

                        {users.length === 0 && (
                            <button
                                type="button"
                                onClick={openAddModal}
                            >
                                <UserPlus size={17} />
                                Add Member
                            </button>
                        )}
                    </div>
                )}

                {/* USERS TABLE */}

                {!loading && filteredUsers.length > 0 && (
                    <div className="people-table-wrapper">

                        <table className="people-table">

                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map((user) => (

                                    <tr key={user.id}>

                                        <td>
                                            <div className="people-member-cell">

                                                <div className="people-avatar">
                                                    {user.name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "U"}
                                                </div>

                                                <div>
                                                    <strong>{user.name}</strong>
                                                    <span>{user.email}</span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`people-role ${user.role}`}
                                            >
                                                {formatRole(user.role)}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`people-status ${user.status}`}
                                            >
                                                <span />
                                                {formatRole(user.status)}
                                            </span>
                                        </td>

                                        <td>
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString()
                                                : "—"}
                                        </td>

                                        <td>
                                            <div className="people-actions">

                                                <button
                                                    type="button"
                                                    title="Edit member"
                                                    onClick={() =>
                                                        openEditModal(user)
                                                    }
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title={
                                                        user.status === "active"
                                                            ? "Deactivate member"
                                                            : "Activate member"
                                                    }
                                                    onClick={() =>
                                                        toggleUserStatus(user)
                                                    }
                                                >
                                                    {user.status === "active"
                                                        ? <UserX size={17} />
                                                        : <UserCheck size={17} />
                                                    }
                                                </button>

                                                <button
                                                    type="button"
                                                    className="people-delete-btn"
                                                    title="Delete member"
                                                    onClick={() =>
                                                        handleDelete(user)
                                                    }
                                                >
                                                    <Trash2 size={17} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                ))}
                            </tbody>

                        </table>

                        <div className="people-table-footer">
                            Showing {filteredUsers.length} of {users.length} members
                        </div>

                    </div>
                )}

            </section>

            {/* ADD / EDIT USER MODAL */}

            {showModal && (
                <div
                    className="people-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowModal(false);
                        }
                    }}
                >

                    <div className="people-modal">

                        <div className="people-modal-header">

                            <div>
                                <h2>
                                    {editingUser
                                        ? "Edit Team Member"
                                        : "Add Team Member"}
                                </h2>

                                <p>
                                    {editingUser
                                        ? "Update member information and role."
                                        : "Add a new member to your organization."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={21} />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <label htmlFor="people-name">
                                Full Name
                            </label>

                            <input
                                id="people-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                                minLength={2}
                                maxLength={100}
                                required
                            />

                            <label htmlFor="people-email">
                                Email Address
                            </label>

                            <input
                                id="people-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                disabled={Boolean(editingUser)}
                                required
                            />

                            <label htmlFor="people-role">
                                Assign Role
                            </label>

                            <select
                                id="people-role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="manager">Manager</option>
                                <option value="lead">Lead</option>
                                <option value="employee">Employee</option>
                            </select>

                            {error && (
                                <div className="people-form-error">
                                    <AlertCircle size={17} />
                                    {error}
                                </div>
                            )}

                            <div className="people-modal-actions">

                                <button
                                    type="button"
                                    className="people-cancel-btn"
                                    onClick={() => setShowModal(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="people-save-btn"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="people-loading-icon"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        editingUser
                                            ? "Save Changes"
                                            : "Add Member"
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </main>
    );
}

export default People;
