
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const dashboardRoutes = {
    manager: "/manager/dashboard",
    lead: "/lead/dashboard",
    employee: "/employee/dashboard",
};

function Access() {
    const navigate = useNavigate();
    const location = useLocation();

    const accessToken = location.state?.accessToken;

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState(
        "Verifying your organization access..."
    );

    const workhubBackground = {
        backgroundImage: `
            linear-gradient(
                rgba(3, 12, 28, 0.28),
                rgba(3, 12, 28, 0.38)
            ),
            url("/images/workhub-office.png")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
    };

    useEffect(() => {
        let cancelled = false;

        const identifyRole = async () => {
            if (!accessToken) {
                navigate("/login", { replace: true });
                return;
            }

            if (!API_BASE_URL) {
                setStatus("error");
                setMessage("Backend API URL is not configured.");
                return;
            }

            try {
                setStatus("verifying");
                setMessage("Verifying your Microsoft identity...");

                const response = await fetch(
                    `${API_BASE_URL}/auth/me`,
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
                        data.detail ||
                        "Your organization access could not be verified."
                    );
                }

                // Read role from backend-verified response
                const role = data.role?.toLowerCase();

                if (!dashboardRoutes[role]) {
                    throw new Error(
                        "Your account does not have an assigned WorkHub role."
                    );
                }

                if (cancelled) return;

                const verifiedUser = {
                    name: data.name,
                    email: data.email,
                    role,
                };

                // Keep token in memory, not browser storage.
                // A shared authentication context can be implemented next.
                setStatus("success");
                setMessage(
                    `Your role has been identified: ${role.toUpperCase()}`
                );

                navigate(dashboardRoutes[role], {
                    replace: true,
                    state: {
                        user: verifiedUser,
                        accessToken,
                    },
                });

            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Role identification failed:",
                    error.message
                );

                setStatus("error");
                setMessage(
                    error.message ||
                    "Unable to verify your WorkHub access."
                );
            }
        };

        identifyRole();

        return () => {
            cancelled = true;
        };
    }, [accessToken, navigate]);

    return (
        <main
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 text-white"
            style={workhubBackground}
        >
            <div className="absolute inset-0 bg-[#020b19]/20" />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[460px]"
            >
                <div className="absolute -inset-[3px] rounded-[22px] bg-blue-500/30 blur-2xl" />

                <div className="relative overflow-hidden rounded-[20px] border border-blue-300/40 bg-gradient-to-br from-[#183354]/90 via-[#0b1b32]/95 to-[#102b43]/90 px-8 py-10 text-center shadow-[0_0_45px_rgba(0,115,255,0.25)] backdrop-blur-2xl">

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-300/10 via-transparent to-cyan-300/10" />

                    {/* Brand */}
                    <div className="relative mb-8 flex items-center justify-center gap-2">
                        <span className="text-4xl font-black italic text-blue-500">
                            W
                        </span>

                        <h2 className="text-2xl font-bold">
                            Work<span className="text-blue-400">Hub</span>
                        </h2>
                    </div>

                    {/* Status Icon */}
                    <motion.div
                        key={status}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative mx-auto mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 shadow-[0_0_30px_rgba(37,99,235,0.20)]"
                    >
                        {status === "verifying" && (
                            <LoaderCircle
                                size={48}
                                className="animate-spin text-blue-400"
                            />
                        )}

                        {status === "success" && (
                            <ShieldCheck
                                size={50}
                                className="text-green-400"
                            />
                        )}

                        {status === "error" && (
                            <AlertCircle
                                size={50}
                                className="text-red-400"
                            />
                        )}
                    </motion.div>

                    {/* Heading */}
                    <h1 className="relative text-[26px] font-bold">
                        {status === "verifying" &&
                            "Identifying Your Role"}

                        {status === "success" &&
                            "Access Verified!"}

                        {status === "error" &&
                            "Verification Failed"}
                    </h1>

                    <p className="relative mx-auto mt-3 max-w-[340px] text-sm leading-6 text-gray-300">
                        {message}
                    </p>

                    {/* Progress */}
                    {status === "verifying" && (
                        <div className="relative mx-auto mt-8 h-[5px] w-full max-w-[260px] overflow-hidden rounded-full bg-[#263951]">
                            <motion.div
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                            />
                        </div>
                    )}

                    {status === "success" && (
                        <p className="relative mt-6 text-sm font-semibold text-green-400">
                            Redirecting to your dashboard...
                        </p>
                    )}

                    {status === "error" && (
                        <button
                            onClick={() =>
                                navigate("/login", { replace: true })
                            }
                            className="relative mt-7 rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                            Back to Login
                        </button>
                    )}

                    <p className="relative mt-9 border-t border-white/10 pt-5 text-xs text-gray-400">
                        Secure organization access · WorkHub
                    </p>
                </div>
            </motion.div>
        </main>
    );
}

export default Access;
