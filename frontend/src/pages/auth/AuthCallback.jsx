
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { motion } from "framer-motion";
import {
    Check,
    CircleHelp,
    LoaderCircle,
    ShieldCheck,
} from "lucide-react";

function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { instance } = useMsal();

    const accessToken = location.state?.accessToken;

    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const activeAccount =
            instance.getActiveAccount() ||
            instance.getAllAccounts()[0];

        if (activeAccount) {
            instance.setActiveAccount(activeAccount);
            setAccount(activeAccount);
        }

        setLoading(false);
    }, [instance]);

    const workhubBackground = {
        backgroundImage: `
            linear-gradient(
                rgba(3, 12, 28, 0.35),
                rgba(3, 12, 28, 0.45)
            ),
            url("/images/workhub-office.png")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
    };

    const handleContinue = () => {
        if (!accessToken) {
            alert(
                "Microsoft access token is missing. Please sign in again."
            );

            navigate("/login", { replace: true });
            return;
        }

        const tokenParts = accessToken.split(".");

        if (tokenParts.length !== 3) {
            alert(
                "The received access token is invalid. Please sign in again."
            );

            navigate("/login", { replace: true });
            return;
        }

        // Send the token to the Access page.
        // FastAPI will verify the token and identify the role.
        navigate("/access", {
            replace: true,
            state: {
                accessToken,
            },
        });
    };

    if (loading) {
        return (
            <div
                className="flex min-h-screen items-center justify-center text-white"
                style={workhubBackground}
            >
                <LoaderCircle
                    size={38}
                    className="animate-spin text-blue-400"
                />

                <span className="ml-3">
                    Loading your Microsoft account...
                </span>
            </div>
        );
    }

    if (!account) {
        return (
            <div
                className="flex min-h-screen items-center justify-center p-6 text-white"
                style={workhubBackground}
            >
                <div className="rounded-2xl border border-blue-400/40 bg-[#07172d]/90 p-8 text-center backdrop-blur-xl">
                    <h1 className="mb-3 text-2xl font-bold">
                        Authentication Required
                    </h1>

                    <p className="mb-6 text-gray-300">
                        Please sign in with your Microsoft account.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/login", { replace: true })
                        }
                        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-24 text-white"
            style={workhubBackground}
        >
            <div className="absolute inset-0 bg-[#020b19]/20" />

            {/* Header */}
            <header className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between px-8 py-6">
                <div className="flex items-center gap-2">
                    <span className="text-4xl font-black italic text-blue-500">
                        W
                    </span>

                    <div>
                        <h2 className="text-2xl font-bold">
                            Work<span className="text-blue-400">Hub</span>
                        </h2>

                        <p className="text-[11px] text-gray-300">
                            Internal Project Management
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CircleHelp size={17} />
                    Need Help?
                </div>
            </header>

            {/* Microsoft Authentication Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="relative z-10 w-full max-w-[440px]"
            >
                <div className="absolute -inset-2 rounded-2xl bg-blue-500/30 blur-2xl" />

                <div className="relative rounded-2xl border border-blue-300/40 bg-gradient-to-br from-[#183354]/90 via-[#0b1b32]/95 to-[#102b43]/95 px-8 py-9 shadow-2xl backdrop-blur-2xl">

                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 160 }}
                        className="mb-5 flex justify-center"
                    >
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-green-400/40 bg-green-400/10">
                            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
                                <Check
                                    size={42}
                                    strokeWidth={4}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Heading */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">
                            Microsoft Authentication Successful
                        </h1>

                        <p className="mt-2 text-gray-200">
                            Welcome,{" "}
                            <span className="font-bold text-blue-400">
                                {account.name || "Microsoft User"}
                            </span>{" "}
                            👋
                        </p>

                        <p className="mt-3 text-sm leading-6 text-gray-300">
                            Your Microsoft organization account
                            has been authenticated successfully.
                        </p>
                    </div>

                    {/* Account Information */}
                    <div className="mt-7 flex items-center justify-between rounded-lg border border-blue-300/20 bg-[#142943]/80 px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold">
                                {account.name?.charAt(0)?.toUpperCase() || "M"}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {account.name || "Microsoft User"}
                                </p>

                                <p className="truncate text-xs text-gray-400">
                                    {account.username}
                                </p>
                            </div>
                        </div>

                        <ShieldCheck
                            size={24}
                            className="shrink-0 text-green-400"
                        />
                    </div>

                    {/* Progress */}
                    <div className="mt-6">
                        <div className="mb-2 flex justify-between text-xs text-gray-300">
                            <span>Microsoft authentication completed</span>
                            <span>Step 2 of 3</span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "66.67%" }}
                                transition={{ duration: 1.2 }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                            />
                        </div>
                    </div>

                    <p className="mt-5 text-center text-xs leading-5 text-gray-300">
                        Your Microsoft identity is verified.
                        Continue to identify your WorkHub role.
                    </p>

                    {/* Continue to Role Identification */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinue}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                    >
                        Continue to WorkHub →
                    </motion.button>
                </div>
            </motion.div>
        </main>
    );
}

export default AuthCallback;
