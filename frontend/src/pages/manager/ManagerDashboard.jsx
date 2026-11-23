
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  RefreshCw,
  BarChart3,
  CalendarDays,
  BriefcaseBusiness,
  Settings,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Plus,
  ArrowUpRight,
  Clock,
  CircleCheck,
  AlertTriangle,
  TrendingUp,
  Menu,
  X,
  Eye,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Projects", icon: FolderKanban },
  { name: "My Team", icon: Users },
  { name: "Tasks", icon: CheckSquare },
  { name: "Sprints", icon: RefreshCw },
  { name: "Reports", icon: BarChart3 },
  { name: "Calendar", icon: CalendarDays },
  { name: "Work Items", icon: BriefcaseBusiness },
  { name: "People", icon: Users },
  { name: "Settings", icon: Settings },
];

const stats = [
  {
    title: "Total Projects",
    value: "12",
    change: "+2 this month",
    icon: FolderKanban,
    color: "blue",
  },
  {
    title: "Open Work Items",
    value: "28",
    change: "+5 this week",
    icon: CheckSquare,
    color: "purple",
  },
  {
    title: "Team Members",
    value: "18",
    change: "2 teams",
    icon: Users,
    color: "cyan",
  },
  {
    title: "Active Sprints",
    value: "4",
    change: "Across projects",
    icon: RefreshCw,
    color: "orange",
  },
];

const projects = [
  {
    name: "WorkHub Platform",
    key: "WH-001",
    status: "On Track",
    progress: 80,
    start: "Oct 01, 2026",
    end: "Dec 30, 2026",
    owner: "Karthik",
  },
  {
    name: "Mobile App",
    key: "MB-002",
    status: "At Risk",
    progress: 65,
    start: "Oct 05, 2026",
    end: "Jan 15, 2027",
    owner: "Priya",
  },
  {
    name: "AI Integration",
    key: "AI-003",
    status: "On Track",
    progress: 75,
    start: "Sep 15, 2026",
    end: "Jan 20, 2027",
    owner: "Rahul",
  },
  {
    name: "HR Portal",
    key: "HR-004",
    status: "Delayed",
    progress: 40,
    start: "Aug 20, 2026",
    end: "Dec 15, 2026",
    owner: "Ananya",
  },
  {
    name: "Analytics Dashboard",
    key: "AD-005",
    status: "On Track",
    progress: 90,
    start: "Sep 01, 2026",
    end: "Dec 20, 2026",
    owner: "Vikram",
  },
];

const team = [
  { name: "Sai Teja", role: "Frontend Developer", done: 8, total: 10 },
  { name: "Priya Sharma", role: "Backend Developer", done: 7, total: 10 },
  { name: "Rahul Verma", role: "UI/UX Designer", done: 5, total: 7 },
  { name: "Ananya Reddy", role: "QA Engineer", done: 4, total: 8 },
  { name: "Vikram", role: "Developer", done: 7, total: 10 },
];

const milestones = [
  { title: "Sprint 4 Review", date: "Nov 05, 2026", left: "2 days", color: "purple" },
  { title: "Mobile App Release", date: "Nov 15, 2026", left: "12 days", color: "blue" },
  { title: "QA Planning", date: "Nov 20, 2026", left: "17 days", color: "orange" },
  { title: "Project Milestone", date: "Dec 01, 2026", left: "28 days", color: "cyan" },
];

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-xl border border-white/10 bg-[#081a31]/90 p-4 shadow-lg transition hover:border-blue-400/40">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{item.title}</p>
        <div className={`rounded-lg p-2 ${
          item.color === "blue" ? "bg-blue-500/15 text-blue-400" :
          item.color === "purple" ? "bg-purple-500/15 text-purple-400" :
          item.color === "cyan" ? "bg-cyan-500/15 text-cyan-400" :
          "bg-orange-500/15 text-orange-400"
        }`}>
          <Icon size={18} />
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-bold text-white">{item.value}</h2>
      <p className="mt-2 text-xs text-emerald-400">{item.change}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "On Track": "bg-emerald-500/15 text-emerald-400",
    "At Risk": "bg-amber-500/15 text-amber-400",
    Delayed: "bg-red-500/15 text-red-400",
  };

  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-white/10 bg-[#081a31]/90 p-4 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {action && (
          <button className="text-xs text-blue-400 transition hover:text-blue-300">
            {action}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export default function ManagerDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(2, 9, 22, 0.90), rgba(2, 9, 22, 0.94)), url('/images/workhub-office.png')",
      }}
    >
      <div className="flex min-h-screen bg-[#020817]/30">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#061329]/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-blue-500">W</span>
                <span className="text-white">Work</span>
                <span className="text-blue-400">Hub</span>
              </h1>
              <p className="text-[9px] tracking-widest text-slate-400">
                INTERNAL PROJECT MANAGEMENT
              </p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-3 py-5">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveNav(item.name)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                      active
                        ? "border border-blue-400/20 bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 to-indigo-900/30 p-4">
              <p className="font-semibold text-white">Build. Collaborate.</p>
              <p className="text-sm text-blue-300">Deliver.</p>
              <p className="mt-2 text-xs text-slate-400">
                One workspace for your entire team.
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">

          {/* Top header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#061329]/90 px-4 backdrop-blur-xl md:px-7">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-300 lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:flex md:w-72">
                <Search size={16} className="text-slate-400" />
                <input
                  placeholder="Search projects, tasks, people..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <h2 className="text-sm font-semibold text-white md:hidden">
                Manager Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative rounded-lg p-2 text-slate-300 hover:bg-white/5">
                <Bell size={19} />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <button className="rounded-lg p-2 text-slate-300 hover:bg-white/5">
                <HelpCircle size={19} />
              </button>

              <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold">
                  K
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold">Manager</p>
                  <p className="text-[10px] text-slate-400">Administrator</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>
          </header>

          <div className="space-y-6 p-4 md:p-7">

            {/* Welcome section */}
            <section className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
                  Workspace Overview
                </p>
                <h1 className="mt-2 text-2xl font-bold md:text-3xl">
                  Manager Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Welcome back! Here's an overview of your projects, team and progress.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#081a31]/80 px-3 py-2 text-xs text-slate-300">
                <CalendarDays size={15} className="text-blue-400" />
                Tuesday, November 03, 2026
              </div>
            </section>

            {/* KPI cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => (
                <StatCard key={item.title} item={item} />
              ))}
            </section>

            {/* Analytics row */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">

              {/* Project progress */}
              <Panel title="Project Progress Overview" action="View All" className="xl:col-span-1">
                <div className="flex flex-wrap items-center justify-center gap-6 py-3">
                  <div
                    className="flex h-36 w-36 items-center justify-center rounded-full"
                    style={{
                      background: "conic-gradient(#3b82f6 0% 76%, #1e293b 76% 100%)",
                    }}
                  >
                    <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#081a31]">
                      <span className="text-3xl font-bold">76%</span>
                      <span className="text-[10px] text-slate-400">Overall Progress</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      ["On Track", "7", "bg-emerald-400"],
                      ["At Risk", "3", "bg-amber-400"],
                      ["Delayed", "1", "bg-red-400"],
                      ["Completed", "1", "bg-blue-400"],
                    ].map(([label, value, color]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${color}`} />
                        <span className="text-slate-400">{label}</span>
                        <strong className="ml-auto text-white">{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              {/* Tasks by status */}
              <Panel title="Tasks by Status" action="View All">
                <div className="flex h-44 items-end justify-around gap-3 px-2 pb-2">
                  {[
                    { label: "To Do", value: 12, height: "35%", color: "bg-blue-500" },
                    { label: "In Progress", value: 18, height: "65%", color: "bg-purple-500" },
                    { label: "Review", value: 8, height: "28%", color: "bg-amber-500" },
                    { label: "Done", value: 32, height: "100%", color: "bg-emerald-500" },
                  ].map((bar) => (
                    <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-white">{bar.value}</span>
                      <div className={`w-full max-w-12 rounded-t-md ${bar.color}`} style={{ height: bar.height }} />
                      <span className="text-[10px] text-slate-400">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Team workload */}
              <Panel title="Team Workload" action="View Team">
                <div className="space-y-4">
                  {team.map((member, index) => {
                    const percentage = Math.round((member.done / member.total) * 100);

                    return (
                      <div key={member.name}>
                        <div className="mb-1 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-white">{member.name}</p>
                            <p className="text-[10px] text-slate-500">{member.role}</p>
                          </div>
                          <span className="text-xs text-slate-300">
                            {member.done}/{member.total}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              index === 0 ? "bg-emerald-400" :
                              index === 1 ? "bg-blue-400" :
                              index === 2 ? "bg-purple-400" :
                              index === 3 ? "bg-orange-400" :
                              "bg-cyan-400"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </section>

            {/* Projects and milestones */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">

              {/* Recent projects table */}
              <Panel
                title="Recent Projects"
                action="View All"
                className="overflow-hidden xl:col-span-2"
              >
                <div className="mb-4 flex justify-end">
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500">
                    <Plus size={15} />
                    New Project
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500">
                        <th className="px-3 py-3 font-medium">Project Name</th>
                        <th className="px-3 py-3 font-medium">Key</th>
                        <th className="px-3 py-3 font-medium">Status</th>
                        <th className="px-3 py-3 font-medium">Progress</th>
                        <th className="px-3 py-3 font-medium">Owner</th>
                      </tr>
                    </thead>

                    <tbody>
                      {projects.map((project) => (
                        <tr
                          key={project.key}
                          className="border-b border-white/5 transition hover:bg-white/[0.03]"
                        >
                          <td className="px-3 py-4 font-medium text-white">
                            {project.name}
                          </td>
                          <td className="px-3 py-4 text-slate-400">{project.key}</td>
                          <td className="px-3 py-4">
                            <StatusBadge status={project.status} />
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-slate-300">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-slate-300">{project.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* Upcoming milestones */}
              <Panel title="Upcoming Milestones" action="View All">
                <div className="space-y-5">
                  {milestones.map((milestone) => (
                    <div key={milestone.title} className="flex gap-3">
                      <div className={`mt-1 h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${
                        milestone.color === "purple" ? "bg-purple-500/15 text-purple-400" :
                        milestone.color === "blue" ? "bg-blue-500/15 text-blue-400" :
                        milestone.color === "orange" ? "bg-orange-500/15 text-orange-400" :
                        "bg-cyan-500/15 text-cyan-400"
                      }`}>
                        <Clock size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white">{milestone.title}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{milestone.date}</p>
                      </div>

                      <span className="h-fit rounded-md bg-white/5 px-2 py-1 text-[10px] text-slate-300">
                        {milestone.left}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            {/* Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 py-4 text-[11px] text-slate-500">
              <p>© 2026 WorkHub. All rights reserved.</p>
              <p>Plan. Track. Deliver.</p>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
