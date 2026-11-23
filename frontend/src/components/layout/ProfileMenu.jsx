
import { useState } from "react";
import { UserRound, ChevronDown, LogOut, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProfileMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const name = user?.name || "WorkHub User";
  const email = user?.email || "";
  const role = user?.role?.toLowerCase() || "employee";

  const formattedRole =
    role.charAt(0).toUpperCase() + role.slice(1);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    sessionStorage.removeItem("workhub_verified_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
          {initials || <UserRound size={20} />}
        </div>

        <div className="hidden text-left sm:block">
          <p className="max-w-36 truncate text-sm font-semibold text-white">
            {name}
          </p>

          <p className="text-xs text-blue-300">
            {formattedRole}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`text-gray-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <button
            aria-label="Close profile menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1b31] shadow-2xl shadow-black/40">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                  {initials || <UserRound size={22} />}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {name}
                  </p>
                  <p className="text-xs text-blue-300">
                    {formattedRole}
                  </p>
                </div>
              </div>

              {email && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Mail size={14} />
                  <span className="truncate">{email}</span>
                </div>
              )}
            </div>

            <div className="p-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileMenu;
