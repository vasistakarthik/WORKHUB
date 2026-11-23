
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

function DashboardLayout() {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read authenticated user
  const storedUser = sessionStorage.getItem("workhub_verified_user");

  let parsedUser = null;

  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    parsedUser = null;
  }

  const user = location.state?.user || parsedUser || {
    name: "WorkHub User",
    email: "",
    role: "employee",
  };

  const role = user.role?.toLowerCase() || "employee";

  return (
    <div
      className="flex min-h-screen w-full overflow-x-hidden theme-background bg-[#061225] text-white"
      style={{
        backgroundImage: `
      linear-gradient(
        var(--background-overlay-start),
        var(--background-overlay-end)
      ),
      var(--background-image)
    `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >

      {/* DESKTOP SIDEBAR */}
      <div className="hidden shrink-0 lg:block">
        <Sidebar
          user={user}
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </div>

      {/* MOBILE SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative z-10 h-full w-[282px]">
            <Sidebar
              user={user}
              role={role}
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MAIN APPLICATION */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* TOP NAVBAR */}
        <TopNavbar
          user={user}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* PAGE CONTENT */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <Outlet context={{ user, role }} />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
