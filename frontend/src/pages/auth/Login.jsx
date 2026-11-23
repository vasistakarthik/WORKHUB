
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import ThemeToggle from "../../components/ThemeToggle";
import {
    CircleHelp,
    ClipboardList,
    Users,
    ChartNoAxesColumnIncreasing,
    Settings,
    Shield,
    Layers3,
    ArrowRight,
    LockKeyhole,
} from "lucide-react";

import {
    loginRequest,
    workhubApiRequest,
    WORKHUB_API_AUDIENCE,
} from "../../auth/authConfig";

import "./Login.css";

// FastAPI backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Login page features
const highlights = [
    { title: "Project Management", icon: ClipboardList },
    { title: "Team Collaboration", icon: Users },
    { title: "Track Progress", icon: ChartNoAxesColumnIncreasing },
    { title: "Agile Workflows", icon: Settings },
    { title: "Secure & Reliable", icon: Shield },
    { title: "Built for Teams", icon: Layers3 },
];

// Decode JWT payload for diagnostics.
// This does not verify the token signature.
function decodeTokenPayload(token) {
    try {
        const parts = token.split(".");

        if (parts.length !== 3) {
            throw new Error("Invalid JWT format.");
        }

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const paddedBase64 = base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            "="
        );

        const decoded = atob(paddedBase64);

        return JSON.parse(decoded);
    } catch {
        throw new Error(
            "Unable to inspect the Microsoft access token."
        );
    }
}

function Login() {
    const navigate = useNavigate();
    const { instance } = useMsal();

    const [loginLoading, setLoginLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // MICROSOFT AUTHENTICATION
    const handleMicrosoftLogin = async () => {
        if (loginLoading) return;

        try {
            setLoginLoading(true);
            setErrorMessage("");

            // Check backend configuration
            if (!API_BASE_URL) {
                throw new Error(
                    "Backend API URL is not configured."
                );
            }

            // STEP 1: Microsoft account selection and login
            const loginResponse = await instance.loginPopup({
                ...loginRequest,
                prompt: "select_account",
                redirectUri: `${window.location.origin}/redirect.html`,
            });

            if (!loginResponse.account) {
                throw new Error(
                    "Microsoft account was not returned."
                );
            }

            // STEP 2: Set active Microsoft account
            const account = loginResponse.account;

            instance.setActiveAccount(account);

            // STEP 3: WorkHub API access token (obtained directly in single login call)
            let accessToken = loginResponse.accessToken;
            let grantedScopes = loginResponse.scopes;

            if (!accessToken) {
                let tokenResponse;
                try {
                    tokenResponse = await instance.acquireTokenSilent({
                        ...workhubApiRequest,
                        account,
                    });
                } catch (error) {
                    if (error instanceof InteractionRequiredAuthError) {
                        tokenResponse = await instance.acquireTokenPopup({
                            ...workhubApiRequest,
                            account,
                            redirectUri: `${window.location.origin}/redirect.html`,
                        });
                    } else {
                        throw error;
                    }
                }
                accessToken = tokenResponse?.accessToken;
                grantedScopes = tokenResponse?.scopes;
            }

            if (!accessToken) {
                throw new Error(
                    "WorkHub API access token was not received."
                );
            }

            // STEP 4: Inspect the token audience
            const tokenPayload = decodeTokenPayload(accessToken);

            console.info(
                "WorkHub token audience:",
                tokenPayload.aud
            );

            console.info(
                "Granted scopes:",
                grantedScopes
            );

            // Stop if Microsoft returned a Graph or another API token
            if (tokenPayload.aud !== WORKHUB_API_AUDIENCE) {
                throw new Error(
                    "Incorrect token audience. Expected the WorkHub API token. " +
                    "Check the Azure API permissions and configured API scope."
                );
            }

            console.info(
                "WorkHub API token audience matches configuration."
            );

            // STEP 5: Verify user with FastAPI
            const response = await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Handle JSON and non-JSON backend responses
            const responseText = await response.text();

            let data;

            try {
                data = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch {
                throw new Error(
                    "The backend returned an invalid response."
                );
            }

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "FastAPI could not verify your account."
                );
            }

            // STEP 6: Identify and validate user's role
            const role = data.role?.toLowerCase();

            const allowedRoles = [
                "manager",
                "lead",
                "employee",
            ];

            if (!allowedRoles.includes(role)) {
                throw new Error(
                    "Your WorkHub role is not assigned. " +
                    "Please contact your administrator."
                );
            }

            // STEP 7: Store verified user profile
            const user = {
                name: data.name,
                email: data.email,
                role,
            };

            sessionStorage.setItem(
                "workhub_verified_user",
                JSON.stringify(user)
            );

            console.info("WorkHub account verified.");
            console.info("User role:", role);

            // STEP 8: Navigate to common dashboard
            navigate("/dashboard", {
                replace: true,
                state: {
                    user,
                },
            });

        } catch (error) {
            console.error(
                "WorkHub login failed:",
                error
            );

            const rawMsg = error?.errorMessage || error?.message || "";

            if (rawMsg.includes("timed_out")) {
                setErrorMessage("Login popup timed out or was closed. Please click below to try again.");
            } else if (rawMsg.includes("user_cancelled")) {
                setErrorMessage("Login was cancelled. Please try again.");
            } else {
                setErrorMessage(
                    rawMsg || "Microsoft login failed. Please try again."
                );
            }

        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <main className="login-page theme-background">

            {/* HEADER */}
            <header className="login-header">

                <button
                    type="button"
                    className="login-brand"
                    onClick={() => navigate("/")}
                >
                    <span className="login-brand-symbol">W</span>

                    <span className="login-brand-text">
                        <strong>
                            Work<span>Hub</span>
                        </strong>

                        <small>
                            Internal Project Management
                        </small>
                    </span>
                </button>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="login-help"
                        onClick={() =>
                            alert(
                                "Contact your organization administrator."
                            )
                        }
                    >
                        <CircleHelp size={22} />
                        <span>Need Help?</span>
                    </button>
                    <div className="login-theme-toggle">
                        <ThemeToggle />
                    </div>
                </div>

            </header>

            {/* MAIN CONTENT */}
            <div className="login-main">

                {/* LEFT INTRODUCTION */}
                <section className="login-intro">

                    <span className="login-eyebrow">
                        ONE TEAM&nbsp; ONE PLATFORM&nbsp; BIGGER IMPACT
                    </span>

                    <h1>
                        Turn Ideas
                        <br />
                        Into <span>Progress.</span>
                    </h1>

                    <p className="login-intro-description">
                        Plan, collaborate, track and deliver — all in one
                        secure workspace for your organization.
                    </p>

                    {/* FEATURES */}
                    <div className="login-highlights">

                        {highlights.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    className="login-highlight"
                                    key={item.title}
                                >
                                    <div className="login-highlight-icon">
                                        <Icon
                                            size={34}
                                            strokeWidth={2.2}
                                        />
                                    </div>

                                    <span>{item.title}</span>
                                </div>
                            );
                        })}

                    </div>

                    {/* INTRO FOOTER */}
                    <div className="login-intro-footer">

                        <div className="login-progress-line">
                            <span />
                        </div>

                        <p>
                            Empowering teams&nbsp; | &nbsp;
                            Streamlining work&nbsp; | &nbsp;
                            Driving results
                        </p>

                    </div>

                </section>

                {/* LOGIN CARD */}
                <section className="login-card-wrapper">

                    <div className="login-card">

                        <div className="login-card-brand">
                            <span className="login-card-symbol">W</span>

                            <strong>
                                Work<span>Hub</span>
                            </strong>
                        </div>

                        <h2>
                            Welcome <span>Back</span>
                        </h2>

                        <p className="login-card-description">
                            Sign in with your organization account
                            <br />
                            to continue to WorkHub.
                        </p>

                        {/* MICROSOFT LOGIN */}
                        <button
                            type="button"
                            className="login-microsoft-button"
                            onClick={handleMicrosoftLogin}
                            disabled={loginLoading}
                        >

                            <span className="login-microsoft-logo">
                                <i className="ms-red" />
                                <i className="ms-green" />
                                <i className="ms-blue" />
                                <i className="ms-yellow" />
                            </span>

                            <span>
                                {loginLoading
                                    ? "Verifying your account..."
                                    : "Sign in with Microsoft"}
                            </span>

                            <ArrowRight size={22} />

                        </button>

                        {/* ERROR MESSAGE */}
                        {errorMessage && (
                            <p
                                className="login-error"
                                role="alert"
                            >
                                {errorMessage}
                            </p>
                        )}

                        {/* DIVIDER */}
                        <div className="login-divider">
                            <span />
                            <p>OR</p>
                            <span />
                        </div>

                        {/* SECURITY */}
                        <div className="login-security">

                            <div className="login-security-icon">
                                <LockKeyhole size={27} />
                            </div>

                            <div>
                                <h3>Secure Sign-In</h3>

                                <p>
                                    Use your company Microsoft account
                                    <br />
                                    for a safe and secure login.
                                </p>
                            </div>

                        </div>

                        {/* FOOTER */}
                        <p className="login-card-footer">
                            <Shield size={14} />
                            Protected organization access
                        </p>

                    </div>

                </section>

                    </div>

        </main>
    );
}

export default Login;
