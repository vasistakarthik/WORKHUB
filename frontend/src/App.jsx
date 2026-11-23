
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";

// Theme
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/themes.css";

// Authentication pages
import Home from "./pages/auth/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import AuthCallback from "./pages/auth/AuthCallback.jsx";
import Access from "./pages/auth/Access.jsx";
import Password from "./pages/auth/Password.jsx";

// Dashboard components
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// Projects pages
import Projects from "./pages/projects/Projects.jsx";
import CreateProject from "./pages/projects/CreateProject.jsx";
import People from "./pages/People/People.jsx";
import ProjectDetails from "./pages/projects/ProjectDetails.jsx";
// Dashboard section placeholder
function DashboardSectionPlaceholder() {

    const location = useLocation();

    const section = location.pathname
        .split("/")
        .filter(Boolean)
        .pop();

    const title = section
        ? section
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())
        : "Dashboard";

    return (
        <div className="theme-background theme-card flex min-h-[60vh] items-center justify-center bg-cover bg-center p-8 text-center">
            <div>
                <h1 className="text-3xl font-bold">
                    {title}
                </h1>

                <p className="mt-3 text-sm">
                    This WorkHub section is coming soon.
                </p>
            </div>
        </div>
    );
}

// Main App
function App() {

    return (
        <ThemeProvider>

            <BrowserRouter>

                <Routes>

                    {/* PUBLIC AUTHENTICATION ROUTES */}

                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="/auth/callback" element={<AuthCallback />} />

                    <Route path="/access" element={<Access />} />

                    <Route path="/password" element={<Password />} />


                    {/* PROTECTED DASHBOARD ROUTES */}

                    <Route element={<ProtectedRoute />}>

                        <Route
                            path="/dashboard"
                            element={<DashboardLayout />}
                        >

                            {/* Dashboard home */}

                            <Route
                                index
                                element={<Dashboard />}
                            />

                            {/* Projects */}

                            <Route
                                path="projects"
                                element={<Projects />}
                            />

                            <Route
                                path="projects/create"
                                element={<CreateProject />}
                            />

                            <Route
                                path="projects/:projectId"
                                element={<ProjectDetails />}
                            />


                            {/* Teams and people */}

                            <Route
                                path="teams"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="people"
                                element={<People />}
                            />

                            <Route
                                path="team"
                                element={<DashboardSectionPlaceholder />}
                            />


                            {/* Scrum and work management */}

                            <Route
                                path="board"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="backlog"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="sprints"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="sprint"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="tasks"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="work-items"
                                element={<DashboardSectionPlaceholder />}
                            />


                            {/* Other sections */}

                            <Route
                                path="reports"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="calendar"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="settings"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="notifications"
                                element={<DashboardSectionPlaceholder />}
                            />

                            <Route
                                path="profile"
                                element={<DashboardSectionPlaceholder />}
                            />


                            {/* Unknown dashboard section */}

                            <Route
                                path="*"
                                element={<DashboardSectionPlaceholder />}
                            />

                        </Route>

                    </Route>


                    {/* OLD DASHBOARD URL REDIRECTS */}

                    <Route
                        path="/manager/dashboard"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="/lead/dashboard"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="/employee/dashboard"
                        element={<Navigate to="/dashboard" replace />}
                    />


                    {/* UNKNOWN ROUTES */}

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />

                </Routes>

            </BrowserRouter>

        </ThemeProvider>
    );
}

export default App;
