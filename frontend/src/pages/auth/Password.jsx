
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LockKeyhole, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

export default function Password() {
    const navigate = useNavigate();
    const location = useLocation();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const accessToken = location.state?.accessToken;
    const user = location.state?.user;

    const handleContinue = async (event) => {
        event.preventDefault();
        setError("");

        if (!password.trim()) {
            setError("Please enter your WorkHub password.");
            return;
        }

        if (!accessToken) {
            setError("Your login session is missing. Please sign in again.");
            return;
        }

        // Password verification will be connected to the FastAPI endpoint next.
        setError("Password verification API is not connected yet.");
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-[#06152c]">
            <div
                className="fixed inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(3,12,28,0.35), rgba(3,12,28,0.55)), url('/images/workhub-office.png')",
                }}
            />

            <motion.section
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md rounded-3xl border border-blue-300/20 bg-[#0b1c35]/75 p-8 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl"
            >
                <div className="mb-7 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/30 bg-blue-400/10">
                        <LockKeyhole size={30} className="text-blue-300" />
                    </div>
                </div>

                <div className="text-center">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                        WorkHub Security
                    </p>

                    <h1 className="text-3xl font-bold text-white">
                        Enter Your Password
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        Enter your WorkHub password to continue securely
                        to your workspace.
                    </p>
                </div>

                {user?.email && (
                    <div className="mt-7 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="mt-1 break-all text-sm text-white">
                            {user.email}
                        </p>
                    </div>
                )}

                <form onSubmit={handleContinue} className="mt-7 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                            WorkHub Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                className="w-full rounded-xl border border-white/15 bg-[#07162b]/80 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110"
                    >
                        Verify Password
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={15} className="text-emerald-400" />
                    Your password is securely verified by WorkHub
                </div>
            </motion.section>
        </main>
    );
}
