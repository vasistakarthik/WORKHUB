
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Layers3,
    Users,
    ChartNoAxesColumnIncreasing,
    ShieldCheck,
    ArrowRight,
    ChevronDown,
    ClipboardList,
    Zap,
    TrendingUp,
    Target,
    FolderKanban,
    CalendarDays,
    ListChecks,
    LayoutDashboard,
    CheckCircle2,
    BriefcaseBusiness,
    UserRound,
    Code2,
    BarChart3,
    MessageSquare,
    LockKeyhole,
    Workflow,
    Sparkles,
} from "lucide-react";

import "./Home.css";
import ThemeToggle from "../../components/ThemeToggle";
const features = [
    {
        id: "project",
        title: "Project Management",
        shortDescription: "Plan and organize projects efficiently.",
        description:
            "Create projects, organize work, assign responsibilities, and manage every stage of your project from one centralized workspace.",
        icon: Layers3,
        details: [
            "Create and manage multiple projects",
            "Organize projects into work items",
            "Assign team leads and employees",
            "Monitor project progress",
        ],
    },
    {
        id: "collaboration",
        title: "Team Collaboration",
        shortDescription: "Connect managers, leads and employees.",
        description:
            "Bring your entire team together. Managers, leads, and employees can coordinate their work through a structured team workflow.",
        icon: Users,
        details: [
            "Role-based team collaboration",
            "Assign responsibilities to team members",
            "Improve communication across teams",
            "Track individual contributions",
        ],
    },
    {
        id: "progress",
        title: "Track Progress",
        shortDescription: "Monitor tasks and project performance.",
        description:
            "Get a clear view of ongoing work, completed tasks, pending items, and sprint progress with organized tracking tools.",
        icon: ChartNoAxesColumnIncreasing,
        details: [
            "Track task status",
            "Monitor sprint progress",
            "View project performance",
            "Identify pending and overdue work",
        ],
    },
    {
        id: "security",
        title: "Secure & Reliable",
        shortDescription: "Protect your workspace with role access.",
        description:
            "Keep your workspace organized with Microsoft authentication and role-based access for managers, leads, and employees.",
        icon: ShieldCheck,
        details: [
            "Microsoft single sign-on",
            "Role-based access control",
            "Protected application routes",
            "Secure team workspace",
        ],
    },
];

const statistics = [
    { label: "Projects", value: "500+", icon: ClipboardList },
    { label: "Team Members", value: "1K+", icon: Users },
    { label: "Work Items", value: "10K+", icon: Zap },
    { label: "Success Rate", value: "98%", icon: TrendingUp },
];

const workflow = [
    {
        number: "01",
        title: "Manager",
        subtitle: "Plan & Organize",
        description:
            "Managers create projects, plan sprints, assign team leads, and monitor overall project performance.",
        icon: BriefcaseBusiness,
        responsibilities: [
            "Create projects",
            "Assign team leads",
            "Plan sprints",
            "Monitor performance",
        ],
    },
    {
        number: "02",
        title: "Lead",
        subtitle: "Manage & Assign",
        description:
            "Leads manage their assigned projects, create stories and work items, and assign tasks to employees.",
        icon: UserRound,
        responsibilities: [
            "Manage assigned projects",
            "Create stories and tasks",
            "Assign employees",
            "Review team progress",
        ],
    },
    {
        number: "03",
        title: "Employee",
        subtitle: "Work & Deliver",
        description:
            "Employees view their assigned work, update task status, and complete their responsibilities.",
        icon: Code2,
        responsibilities: [
            "View assigned tasks",
            "Update task status",
            "Track personal work",
            "Complete work items",
        ],
    },
];

const solutions = [
    {
        title: "Project Boards",
        description:
            "Organize projects and visualize work across different stages.",
        icon: FolderKanban,
        tag: "Project Organization",
    },
    {
        title: "Sprint Planning",
        description:
            "Plan sprints, organize workloads, and manage development cycles.",
        icon: CalendarDays,
        tag: "Agile Planning",
    },
    {
        title: "Work Item Tracking",
        description:
            "Create stories and tasks, assign owners, and track progress.",
        icon: ListChecks,
        tag: "Task Management",
    },
    {
        title: "Team Dashboards",
        description:
            "Get an overview of team activities and project performance.",
        icon: LayoutDashboard,
        tag: "Performance",
    },
];

function Home() {
    const navigate = useNavigate();

    const [selectedFeature, setSelectedFeature] = useState("project");

    const activeFeature = features.find(
        (feature) => feature.id === selectedFeature
    );

    // Scroll reveal animation
    useEffect(() => {
        const elements = document.querySelectorAll(
            ".reveal, .reveal-card"
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px",
            }
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    // Scroll to section
    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    // Navigate to Login page
    const handleMicrosoftLogin = () => {
        navigate("/login");
    };

    return (
        <main className="home-page theme-background">

            {/* HERO SECTION */}
            <section className="home-hero-section" id="home">

                <header className="home-header">

                    <div
                        className="home-brand"
                        onClick={() => scrollToSection("home")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                scrollToSection("home");
                            }
                        }}
                    >
                        <div className="brand-symbol">W</div>

                        <div className="brand-content">
                            <h2>
                                Work<span>Hub</span>
                            </h2>
                            <p>Plan Track Deliver</p>
                        </div>
                    </div>

                    <nav className="home-nav">

                        <button onClick={() => scrollToSection("features")}>
                            Features <ChevronDown size={15} />
                        </button>

                        <button onClick={() => scrollToSection("roles")}>
                            Roles
                        </button>

                        <button onClick={() => scrollToSection("solutions")}>
                            Solutions
                        </button>

                        <button onClick={() => scrollToSection("about-workhub")}>
                            About
                        </button>

                    </nav>

                    <div className="home-theme-toggle">
                        <ThemeToggle />
                    </div>

                </header>

                <div className="hero-content">

                    <p className="hero-eyebrow">
                        INTERNAL PROJECT MANAGEMENT
                    </p>

                    <h1>
                        Build Together<span>.</span>
                        <br />
                        Deliver <strong>Stronger.</strong>
                    </h1>

                    <p className="hero-description">
                        A unified workspace for teams to plan, collaborate,
                        <br className="desktop-break" />
                        track progress and deliver exceptional results.
                    </p>

                    <div className="hero-feature-highlights">

                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <button
                                    key={feature.id}
                                    className="hero-feature-item"
                                    onClick={() => {
                                        setSelectedFeature(feature.id);
                                        scrollToSection("features");
                                    }}
                                >
                                    <span className="hero-feature-icon">
                                        <Icon size={29} />
                                    </span>

                                    <span className="hero-feature-label">
                                        {feature.title}
                                    </span>
                                </button>
                            );
                        })}

                    </div>

                    {/* LOGIN NAVIGATION */}
                    <div className="hero-login-area">

                        <button
                            className="microsoft-login-button"
                            onClick={handleMicrosoftLogin}
                        >
                            <span className="microsoft-logo">
                                <span className="ms-square ms-red" />
                                <span className="ms-square ms-green" />
                                <span className="ms-square ms-blue" />
                                <span className="ms-square ms-yellow" />
                            </span>

                            <span>Sign in with Microsoft</span>

                            <ArrowRight size={21} />
                        </button>

                        <p className="login-caption">
                            Use your organization account to access WorkHub
                        </p>

                    </div>
                </div>

                {/* STATISTICS */}
                <div className="home-statistics">

                    {statistics.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div className="statistic-item" key={item.label}>

                                <Icon className="statistic-icon" size={30} />

                                <div>
                                    <p>{item.label}</p>
                                    <h3>{item.value}</h3>
                                </div>

                            </div>
                        );
                    })}

                </div>
            </section>

            {/* FEATURES SECTION */}
            <section
                className="home-section features-section"
                id="features"
            >

                <div className="section-heading reveal">

                    <span className="section-eyebrow">WHAT WE OFFER</span>

                    <h2>
                        Everything Your Team Needs
                        <span> In One Place</span>
                    </h2>

                    <p>
                        Discover the tools that make planning, collaboration,
                        and delivery easier.
                    </p>

                </div>

                <div className="feature-cards-grid">

                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const isSelected = selectedFeature === feature.id;

                        return (
                            <button
                                key={feature.id}
                                className={`feature-card reveal-card ${isSelected ? "active" : ""
                                    }`}
                                style={{
                                    "--reveal-delay": `${index * 100}ms`,
                                }}
                                onClick={() => setSelectedFeature(feature.id)}
                            >

                                <div className="feature-card-top">

                                    <div className="feature-card-icon">
                                        <Icon size={29} />
                                    </div>

                                    <span className="feature-card-number">
                                        0{index + 1}
                                    </span>

                                </div>

                                <h3>{feature.title}</h3>

                                <p>{feature.shortDescription}</p>

                                <span className="feature-card-action">
                                    {isSelected ? "Selected" : "Explore feature"}
                                    <ArrowRight size={17} />
                                </span>

                            </button>
                        );
                    })}

                </div>

                {activeFeature && (
                    <div
                        className="feature-detail-panel reveal"
                        key={activeFeature.id}
                    >

                        <div className="feature-detail-content">

                            <span className="section-eyebrow">
                                FEATURE DETAILS
                            </span>

                            <h3>{activeFeature.title}</h3>

                            <p>{activeFeature.description}</p>

                            <ul className="feature-detail-list">

                                {activeFeature.details.map((detail) => (
                                    <li key={detail}>
                                        <CheckCircle2 size={18} />
                                        {detail}
                                    </li>
                                ))}

                            </ul>

                        </div>

                        <div className="feature-detail-visual">

                            <div className="feature-visual-glow">
                                {(() => {
                                    const Icon = activeFeature.icon;
                                    return <Icon size={82} strokeWidth={1.4} />;
                                })()}
                            </div>

                            <span>WorkHub Workspace</span>
                            <p>Plan. Track. Deliver.</p>

                        </div>

                    </div>
                )}

            </section>

            {/* ROLES SECTION */}
            <section
                className="home-section roles-section"
                id="roles"
            >

                <div className="section-heading reveal">

                    <span className="section-eyebrow">
                        SIMPLE TEAM WORKFLOW
                    </span>

                    <h2>
                        One Team.<span> Three Roles.</span>
                    </h2>

                    <p>
                        Every team member has a clear responsibility
                        in the WorkHub workflow.
                    </p>

                </div>

                <div className="workflow-grid">

                    {workflow.map((role, index) => {
                        const Icon = role.icon;

                        return (
                            <div
                                className="workflow-card reveal-card"
                                key={role.title}
                                style={{
                                    "--reveal-delay": `${index * 130}ms`,
                                }}
                            >

                                <div className="workflow-card-header">

                                    <span className="workflow-number">
                                        {role.number}
                                    </span>

                                    <div className="workflow-icon">
                                        <Icon size={29} />
                                    </div>

                                </div>

                                <h3>{role.title}</h3>

                                <span className="workflow-subtitle">
                                    {role.subtitle}
                                </span>

                                <p>{role.description}</p>

                                <div className="workflow-responsibilities">

                                    {role.responsibilities.map((task) => (
                                        <div key={task}>
                                            <CheckCircle2 size={16} />
                                            <span>{task}</span>
                                        </div>
                                    ))}

                                </div>

                                {index < workflow.length - 1 && (
                                    <div className="workflow-connector">
                                        <ArrowRight size={21} />
                                    </div>
                                )}

                            </div>
                        );
                    })}

                </div>
            </section>

            {/* SOLUTIONS SECTION */}
            <section
                className="home-section solutions-section"
                id="solutions"
            >

                <div className="section-heading reveal">

                    <span className="section-eyebrow">WORK SMARTER</span>

                    <h2>
                        Powerful Solutions for
                        <span> Modern Teams</span>
                    </h2>

                    <p>
                        Manage your entire project lifecycle using
                        one connected workspace.
                    </p>

                </div>

                <div className="solutions-grid">

                    {solutions.map((solution, index) => {
                        const Icon = solution.icon;

                        return (
                            <div
                                className="solution-card reveal-card"
                                key={solution.title}
                                style={{
                                    "--reveal-delay": `${index * 100}ms`,
                                }}
                            >

                                <div className="solution-icon">
                                    <Icon size={29} />
                                </div>

                                <span className="solution-tag">
                                    {solution.tag}
                                </span>

                                <h3>{solution.title}</h3>

                                <p>{solution.description}</p>

                                <div className="solution-card-footer">
                                    <span>WorkHub Solution</span>
                                    <ArrowRight size={18} />
                                </div>

                            </div>
                        );
                    })}

                </div>
            </section>

            {/* ABOUT SECTION */}
            <section
                className="home-section about-section"
                id="about-workhub"
            >

                <div className="about-content reveal">

                    <span className="section-eyebrow">
                        ABOUT WORKHUB
                    </span>

                    <h2>
                        Turn Teamwork Into
                        <span> Achievement.</span>
                    </h2>

                    <p>
                        WorkHub is an internal project management workspace
                        designed to bring managers, leads, and employees
                        together. From project planning to final delivery,
                        WorkHub helps teams stay organized, connected,
                        and focused on their goals.
                    </p>

                    <div className="about-highlights">

                        <div>
                            <Workflow size={22} />
                            <span>Structured Workflow</span>
                        </div>

                        <div>
                            <Target size={22} />
                            <span>Clear Responsibilities</span>
                        </div>

                        <div>
                            <BarChart3 size={22} />
                            <span>Progress Visibility</span>
                        </div>

                        <div>
                            <MessageSquare size={22} />
                            <span>Team Collaboration</span>
                        </div>

                    </div>

                </div>

                <div className="about-visual reveal">

                    <div className="about-visual-card">

                        <Sparkles size={34} />

                        <h3>Plan Better.</h3>
                        <h3>Work Smarter.</h3>
                        <h3>Deliver Stronger.</h3>

                        <p>
                            Everything your team needs to move forward.
                        </p>

                        <div className="about-visual-line" />

                        <div className="about-visual-footer">
                            <LockKeyhole size={17} />
                            <span>One Secure Workspace</span>
                        </div>

                    </div>

                </div>
            </section>

            {/* FOOTER */}
            <footer className="home-footer">

                <div className="footer-main">

                    <div className="footer-brand">

                        <div className="footer-brand-heading">
                            <span className="footer-brand-symbol">W</span>
                            <h2>Work<span>Hub</span></h2>
                        </div>

                        <p>Plan Track Deliver</p>

                        <span>
                            A smarter workspace for teams to plan,
                            collaborate, and deliver.
                        </span>

                    </div>

                    <div className="footer-links">

                        <h3>Explore</h3>

                        <button onClick={() => scrollToSection("home")}>
                            Home
                        </button>

                        <button onClick={() => scrollToSection("features")}>
                            Features
                        </button>

                        <button onClick={() => scrollToSection("roles")}>
                            Roles
                        </button>

                        <button onClick={() => scrollToSection("solutions")}>
                            Solutions
                        </button>

                    </div>

                    <div className="footer-links">

                        <h3>Workspace</h3>

                        <button onClick={() => scrollToSection("about-workhub")}>
                            About WorkHub
                        </button>

                        <button onClick={() => scrollToSection("features")}>
                            Project Management
                        </button>

                        <button onClick={() => scrollToSection("roles")}>
                            Team Workflow
                        </button>

                    </div>

                    <div className="footer-message">

                        <h3>Work Together.</h3>

                        <p>
                            Great things happen when teams work together.
                        </p>

                        <button onClick={() => scrollToSection("home")}>
                            Back to top <ArrowRight size={17} />
                        </button>

                    </div>

                </div>

                <div className="footer-bottom">

                    <p>
                        © {new Date().getFullYear()} WorkHub. All rights reserved.
                    </p>

                    <span>Plan Track Deliver.</span>

                </div>

            </footer>

        </main>
    );
}

export default Home;
