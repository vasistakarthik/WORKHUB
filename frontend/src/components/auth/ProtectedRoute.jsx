
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
    const location = useLocation();

    const storedUser = sessionStorage.getItem("workhub_verified_user");

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        user = null;
    }

    // Check whether a valid user object exists
    const isAuthenticated =
        user &&
        typeof user === "object" &&
        !Array.isArray(user);

    // Redirect unauthenticated users to Login
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Allow authenticated users to continue
    return <Outlet />;
}

export default ProtectedRoute;
