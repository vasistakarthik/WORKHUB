
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
} from "lucide-react";

import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "../ThemeToggle";

function TopNavbar({ user, onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 grid h-[60px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 bg-[#061225]/95 px-3 backdrop-blur-2xl sm:px-5">

      {/* LEFT: MOBILE MENU */}
      <div className="flex min-w-0 items-center justify-start">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-cyan-400 lg:hidden"
        >
          <Menu size={21} />
        </button>
      </div>

      {/* CENTER: SEARCH */}
      <div className="flex w-[min(42vw,520px)] min-w-[180px] items-center gap-3 rounded-xl border border-blue-400/30 bg-[#0a1b32]/90 px-3 py-2 shadow-inner transition focus-within:border-cyan-400/70 focus-within:shadow-[0_0_15px_rgba(0,180,255,0.12)]">

        <Search size={18} className="shrink-0 text-slate-400" />

        <input
          type="text"
          placeholder="Search projects, tasks, people..."
          className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />

        <span className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-slate-500 sm:block">
          Ctrl K
        </span>
      </div>

      {/* RIGHT: ACTIONS AND PROFILE */}
      <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">

        {/* NOTIFICATIONS */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-cyan-400"
        >
          <Bell size={19} />

          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            5
          </span>
        </button>

        {/* HELP */}
        <button
          type="button"
          aria-label="Help"
          className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-cyan-400"
        >
          <HelpCircle size={19} />
        </button>

        {/* LIGHT / DARK MODE */}
        <ThemeToggle />

        {/* PROFILE */}
        <div className="border-l border-white/10 pl-2 sm:pl-3">
          <ProfileMenu user={user} />
        </div>

      </div>
    </header>
  );
}

export default TopNavbar;
