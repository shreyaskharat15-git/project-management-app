import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

const STATUSES = ["Todo", "In Progress", "Done"];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [projects, setProjects] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function scrollToProjects() {
    const section = document.getElementById("projects-section");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  async function loadDashboard(showRefresh = false) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await api.getProjects();

      setProjects(data);

      const detailResults = await Promise.all(
        data.map(async (project) => {
          try {
            const detail = await api.getProject(project.id);

            return [project.id, detail];
          } catch {
            return [
              project.id,
              {
                ...project,
                tasks: [],
              },
            ];
          }
        })
      );

      setProjectDetails(
        Object.fromEntries(detailResults)
      );
    } catch (error) {
      if (error.status === 401) {
        logout();
      } else {
        setError(
          error.message || "Unable to load dashboard."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, []);

  async function createProject(event) {
    event.preventDefault();

    if (!name.trim()) return;

    try {
      setCreating(true);
      setError("");

      const project = await api.createProject({
        name: name.trim(),
        description: description.trim(),
      });

      setProjects((current) => [
        project,
        ...current,
      ]);

      setProjectDetails((current) => ({
        ...current,
        [project.id]: {
          ...project,
          tasks: [],
        },
      }));

      setName("");
      setDescription("");
      setShowCreate(false);
    } catch (error) {
      if (error.status === 401) {
        logout();
      } else {
        setError(
          error.message || "Unable to create project."
        );
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteProject(id) {
    const confirmed = window.confirm(
      "Delete this project and all of its tasks?"
    );

    if (!confirmed) return;

    try {
      await api.deleteProject(id);

      setProjects((current) =>
        current.filter(
          (project) => project.id !== id
        )
      );

      setProjectDetails((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    } catch (error) {
      if (error.status === 401) {
        logout();
      } else {
        setError(
          error.message || "Unable to delete project."
        );
      }
    }
  }

  const allTasks = useMemo(() => {
    return projects.flatMap((project) => {
      const detail = projectDetails[project.id];

      return (detail?.tasks || []).map((task) => ({
        ...task,
        projectId: project.id,
        projectName: project.name,
      }));
    });
  }, [projects, projectDetails]);

  const totalTasks = allTasks.length;

  const completedTasks = allTasks.filter(
    (task) => task.status === "Done"
  ).length;

  const inProgressTasks = allTasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const todoTasks = allTasks.filter(
    (task) => task.status === "Todo"
  ).length;

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  const focusTasks = allTasks
    .filter((task) => task.status !== "Done")
    .slice(0, 6);

  const filteredProjects = projects.filter(
    (project) => {
      const text =
        `${project.name} ${
          project.description || ""
        }`.toLowerCase();

      return text.includes(search.toLowerCase());
    }
  );

  return (
    <div className="pf-dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .pf-dashboard {
          min-height: 100vh;
          background: #f5f7fb;
          color: #172033;
          display: flex;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .pf-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #111827;
          color: white;
          padding: 24px 18px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
        }

        .pf-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 30px;
        }

        .pf-brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #ffffff;
          color: #111827;
          font-weight: 800;
          font-size: 18px;
        }

        .pf-brand span {
          font-size: 18px;
          font-weight: 700;
        }

        .pf-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pf-nav-item {
          border: 0;
          background: transparent;
          color: #aeb7c7;
          text-decoration: none;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s ease;
          width: 100%;
          text-align: left;
        }

        .pf-nav-item:hover,
        .pf-nav-item.active {
          color: white;
          background: #1f2937;
        }

        .pf-sidebar-bottom {
          margin-top: auto;
          border-top: 1px solid #293241;
          padding-top: 18px;
        }

        .pf-user-mini {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .pf-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #e5e7eb;
          color: #111827;
          font-weight: 700;
        }

        .pf-user-info {
          min-width: 0;
        }

        .pf-user-info strong {
          display: block;
          color: white;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pf-user-info small {
          display: block;
          color: #8993a4;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 3px;
        }

        .pf-logout {
          width: 100%;
          border: 1px solid #374151;
          background: transparent;
          color: #d1d5db;
          padding: 10px 12px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13px;
        }

        .pf-logout:hover {
          background: #1f2937;
        }

        .pf-main {
          flex: 1;
          min-width: 0;
          padding: 32px;
        }

        .pf-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 28px;
        }

        .pf-eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #7c8698;
        }

        .pf-topbar h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.2;
        }

        .pf-subtitle {
          margin: 8px 0 0;
          color: #717b8d;
          font-size: 14px;
        }

        .pf-top-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .pf-search {
          width: 220px;
          border: 1px solid #dce1e9;
          background: white;
          padding: 11px 13px;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
        }

        .pf-search:focus {
          border-color: #9aa5b5;
        }

        .pf-button {
          border: 1px solid #d9dee7;
          background: white;
          color: #1f2937;
          border-radius: 10px;
          padding: 11px 14px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .pf-button:hover {
          background: #f9fafb;
        }

        .pf-button-primary {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .pf-button-primary:hover {
          background: #1f2937;
        }

        .pf-error {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .pf-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .pf-stat {
          background: white;
          border: 1px solid #e5e9ef;
          border-radius: 14px;
          padding: 19px;
        }

        .pf-stat-label {
          color: #7b8493;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .pf-stat-value {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }

        .pf-stat-value strong {
          font-size: 27px;
        }

        .pf-stat-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          background: #f0f2f5;
          font-size: 15px;
        }

        .pf-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.9fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .pf-card {
          background: white;
          border: 1px solid #e5e9ef;
          border-radius: 14px;
          padding: 20px;
        }

        .pf-card-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: center;
          margin-bottom: 18px;
        }

        .pf-card-header h2 {
          margin: 0;
          font-size: 16px;
        }

        .pf-card-header p {
          margin: 5px 0 0;
          color: #7b8493;
          font-size: 12px;
        }

        .pf-rate {
          font-size: 25px;
          font-weight: 800;
        }

        .pf-progress {
          height: 9px;
          background: #edf0f4;
          border-radius: 999px;
          overflow: hidden;
        }

        .pf-progress-fill {
          height: 100%;
          background: #111827;
          border-radius: inherit;
        }

        .pf-health-list {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .pf-health-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
        }

        .pf-health-name {
          font-weight: 600;
          font-size: 13px;
        }

        .pf-health-meta {
          color: #7b8493;
          font-size: 11px;
          margin-top: 4px;
        }

        .pf-health-percent {
          font-size: 12px;
          font-weight: 700;
        }

        .pf-health-bar {
          grid-column: 1 / -1;
        }

        .pf-task-list {
          display: flex;
          flex-direction: column;
        }

        .pf-task {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 13px 0;
          border-bottom: 1px solid #eef1f5;
        }

        .pf-task:last-child {
          border-bottom: 0;
        }

        .pf-task-status {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #9ca3af;
          margin-top: 5px;
          flex: 0 0 auto;
        }

        .pf-task-status.progress {
          background: #475569;
        }

        .pf-task-content {
          min-width: 0;
        }

        .pf-task-title {
          font-size: 13px;
          font-weight: 600;
          color: #273244;
        }

        .pf-task-project {
          margin-top: 4px;
          color: #8590a1;
          font-size: 11px;
        }

        .pf-status-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pf-status-item {
          display: grid;
          grid-template-columns: 100px 1fr 38px;
          gap: 10px;
          align-items: center;
        }

        .pf-status-name {
          font-size: 12px;
          color: #667085;
        }

        .pf-status-track {
          height: 8px;
          background: #edf0f4;
          border-radius: 999px;
          overflow: hidden;
        }

        .pf-status-fill {
          height: 100%;
          background: #4b5563;
          border-radius: inherit;
        }

        .pf-status-count {
          text-align: right;
          font-size: 12px;
          font-weight: 700;
        }

        .pf-section {
          margin-bottom: 20px;
          scroll-margin-top: 25px;
        }

        .pf-projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 14px;
        }

        .pf-projects-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .pf-projects-header p {
          margin: 5px 0 0;
          font-size: 12px;
          color: #7b8493;
        }

        .pf-project-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .pf-project {
          border: 1px solid #e5e9ef;
          border-radius: 14px;
          padding: 18px;
          background: white;
          min-width: 0;
        }

        .pf-project-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .pf-project-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #111827;
          color: white;
          display: grid;
          place-items: center;
          font-weight: 700;
        }

        .pf-project-tasks {
          font-size: 11px;
          color: #7b8493;
          background: #f3f4f6;
          padding: 5px 8px;
          border-radius: 999px;
        }

        .pf-project h3 {
          margin: 14px 0 6px;
          font-size: 14px;
        }

        .pf-project p {
          margin: 0;
          color: #7b8493;
          font-size: 12px;
          line-height: 1.5;
          min-height: 38px;
        }

        .pf-project-progress {
          margin-top: 17px;
        }

        .pf-project-progress-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 7px;
          font-size: 11px;
          color: #778196;
        }

        .pf-project-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-top: 17px;
        }

        .pf-project-open {
          text-decoration: none;
          color: #111827;
          font-size: 12px;
          font-weight: 700;
        }

        .pf-delete {
          border: 0;
          background: transparent;
          color: #a3abb8;
          font-size: 11px;
          cursor: pointer;
        }

        .pf-delete:hover {
          color: #b91c1c;
        }

        .pf-empty {
          text-align: center;
          padding: 40px 20px;
          color: #7b8493;
          font-size: 13px;
        }

        .pf-create {
          margin-bottom: 20px;
        }

        .pf-create-form {
          display: grid;
          grid-template-columns: 1fr 1.4fr auto;
          gap: 10px;
        }

        .pf-create-form input {
          width: 100%;
          border: 1px solid #dfe4eb;
          border-radius: 10px;
          background: #fff;
          padding: 11px 12px;
          outline: none;
          font-size: 13px;
        }

        .pf-create-form input:focus {
          border-color: #9aa5b5;
        }

        .pf-loading {
          display: grid;
          place-items: center;
          min-height: 60vh;
          width: 100%;
          color: #7b8493;
        }

        @media (max-width: 1100px) {
          .pf-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .pf-project-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 850px) {
          .pf-sidebar {
            width: 205px;
          }

          .pf-layout {
            grid-template-columns: 1fr;
          }

          .pf-topbar {
            flex-direction: column;
          }

          .pf-top-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .pf-search {
            flex: 1;
            min-width: 180px;
          }
        }

        @media (max-width: 650px) {
          .pf-dashboard {
            display: block;
          }

          .pf-sidebar {
            position: static;
            min-height: auto;
            width: 100%;
            padding: 14px;
          }

          .pf-brand {
            padding-bottom: 14px;
          }

          .pf-nav {
            display: flex;
            flex-direction: row;
          }

          .pf-nav-item {
            flex: 1;
          }

          .pf-sidebar-bottom {
            display: none;
          }

          .pf-main {
            padding: 18px;
          }

          .pf-topbar h1 {
            font-size: 24px;
          }

          .pf-stats {
            grid-template-columns: 1fr 1fr;
          }

          .pf-project-grid {
            grid-template-columns: 1fr;
          }

          .pf-create-form {
            grid-template-columns: 1fr;
          }

          .pf-status-item {
            grid-template-columns: 92px 1fr 30px;
          }
        }
      `}</style>

      <aside className="pf-sidebar">
        <div className="pf-brand">
          <div className="pf-brand-mark">P</div>
          <span>ProjectFlow</span>
        </div>

        <nav className="pf-nav">
          <button
            className="pf-nav-item active"
            onClick={() => window.scrollTo({
              top: 0,
              behavior: "smooth",
            })}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="pf-nav-item"
            onClick={scrollToProjects}
          >
            <span>◫</span>
            Projects
          </button>
        </nav>

        <div className="pf-sidebar-bottom">
          <div className="pf-user-mini">
            <div className="pf-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="pf-user-info">
              <strong>{user?.name || "User"}</strong>
              <small>{user?.email || ""}</small>
            </div>
          </div>

          <button
            className="pf-logout"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="pf-main">
        <header className="pf-topbar">
          <div>
            <p className="pf-eyebrow">
              WORKSPACE OVERVIEW
            </p>

            <h1>
              {greeting}, {user?.name || "there"} 👋
            </h1>

            <p className="pf-subtitle">
              Track your work, projects, and progress
              from one place.
            </p>
          </div>

          <div className="pf-top-actions">
            <input
              className="pf-search"
              placeholder="Search projects..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button
              className="pf-button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <button
              className="pf-button pf-button-primary"
              onClick={() =>
                setShowCreate((current) => !current)
              }
            >
              + New Project
            </button>
          </div>
        </header>

        {error && (
          <div className="pf-error">
            {error}
          </div>
        )}

        {showCreate && (
          <section className="pf-card pf-create">
            <div className="pf-card-header">
              <div>
                <h2>Create a project</h2>
                <p>
                  Set up a new workspace for your work.
                </p>
              </div>
            </div>

            <form
              className="pf-create-form"
              onSubmit={createProject}
            >
              <input
                placeholder="Project name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              <input
                placeholder="Project description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <button
                className="pf-button pf-button-primary"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Project"}
              </button>
            </form>
          </section>
        )}

        {loading ? (
          <div className="pf-loading">
            Loading your workspace...
          </div>
        ) : (
          <>
            <section className="pf-stats">
              <div className="pf-stat">
                <div className="pf-stat-label">
                  Total Projects
                </div>

                <div className="pf-stat-value">
                  <strong>{projects.length}</strong>
                  <div className="pf-stat-icon">◫</div>
                </div>
              </div>

              <div className="pf-stat">
                <div className="pf-stat-label">
                  Total Tasks
                </div>

                <div className="pf-stat-value">
                  <strong>{totalTasks}</strong>
                  <div className="pf-stat-icon">✓</div>
                </div>
              </div>

              <div className="pf-stat">
                <div className="pf-stat-label">
                  In Progress
                </div>

                <div className="pf-stat-value">
                  <strong>{inProgressTasks}</strong>
                  <div className="pf-stat-icon">→</div>
                </div>
              </div>

              <div className="pf-stat">
                <div className="pf-stat-label">
                  Completion Rate
                </div>

                <div className="pf-stat-value">
                  <strong>{completionRate}%</strong>
                  <div className="pf-stat-icon">%</div>
                </div>
              </div>
            </section>

            <section className="pf-layout">
              <div className="pf-card">
                <div className="pf-card-header">
                  <div>
                    <h2>Workspace progress</h2>
                    <p>
                      Overall completion across all
                      tasks.
                    </p>
                  </div>

                  <div className="pf-rate">
                    {completionRate}%
                  </div>
                </div>

                <div className="pf-progress">
                  <div
                    className="pf-progress-fill"
                    style={{
                      width: `${completionRate}%`,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 14,
                    fontSize: 12,
                    color: "#7b8493",
                  }}
                >
                  <span>
                    {completedTasks} completed
                  </span>

                  <span>
                    {totalTasks - completedTasks}{" "}
                    remaining
                  </span>
                </div>
              </div>

              <div className="pf-card">
                <div className="pf-card-header">
                  <div>
                    <h2>Task distribution</h2>
                    <p>
                      Current workspace status.
                    </p>
                  </div>
                </div>

                <div className="pf-status-list">
                  {STATUSES.map((status) => {
                    const count =
                      status === "Todo"
                        ? todoTasks
                        : status === "In Progress"
                        ? inProgressTasks
                        : completedTasks;

                    const percentage =
                      totalTasks === 0
                        ? 0
                        : Math.round(
                            (count / totalTasks) *
                              100
                          );

                    return (
                      <div
                        className="pf-status-item"
                        key={status}
                      >
                        <span className="pf-status-name">
                          {status}
                        </span>

                        <div className="pf-status-track">
                          <div
                            className="pf-status-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="pf-status-count">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="pf-layout">
              <div className="pf-card">
                <div className="pf-card-header">
                  <div>
                    <h2>My focus</h2>
                    <p>
                      Tasks that still need attention.
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      color: "#7b8493",
                    }}
                  >
                    {focusTasks.length} active
                  </span>
                </div>

                {focusTasks.length === 0 ? (
                  <div className="pf-empty">
                    No active tasks right now.
                  </div>
                ) : (
                  <div className="pf-task-list">
                    {focusTasks.map((task) => (
                      <div
                        className="pf-task"
                        key={task.id}
                      >
                        <span
                          className={`pf-task-status ${
                            task.status ===
                            "In Progress"
                              ? "progress"
                              : ""
                          }`}
                        />

                        <div className="pf-task-content">
                          <div className="pf-task-title">
                            {task.title}
                          </div>

                          <div className="pf-task-project">
                            {task.projectName} ·{" "}
                            {task.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pf-card">
                <div className="pf-card-header">
                  <div>
                    <h2>Quick actions</h2>
                    <p>
                      Get where you need to go.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <button
                    className="pf-button"
                    onClick={() =>
                      setShowCreate(true)
                    }
                  >
                    + Create a project
                  </button>

                  <button
                    className="pf-button"
                    onClick={() => {
                      const firstProject =
                        projects[0];

                      if (firstProject) {
                        navigate(
                          `/projects/${firstProject.id}`
                        );
                      }
                    }}
                    disabled={projects.length === 0}
                  >
                    → Open latest project
                  </button>

                  <button
                    className="pf-button"
                    onClick={scrollToProjects}
                  >
                    ↓ View all projects
                  </button>
                </div>
              </div>
            </section>

            <section className="pf-section">
              <div className="pf-projects-header">
                <div>
                  <h2>Project health</h2>
                  <p>
                    Progress across your current
                    projects.
                  </p>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="pf-card pf-empty">
                  Create your first project to start
                  tracking progress.
                </div>
              ) : (
                <div className="pf-card">
                  <div className="pf-health-list">
                    {projects.map((project) => {
                      const detail =
                        projectDetails[project.id];

                      const tasks = detail?.tasks || [];

                      const done = tasks.filter(
                        (task) =>
                          task.status === "Done"
                      ).length;

                      const progress =
                        tasks.length === 0
                          ? 0
                          : Math.round(
                              (done / tasks.length) *
                                100
                            );

                      return (
                        <div
                          className="pf-health-row"
                          key={project.id}
                        >
                          <div>
                            <div className="pf-health-name">
                              {project.name}
                            </div>

                            <div className="pf-health-meta">
                              {tasks.length} task
                              {tasks.length !== 1
                                ? "s"
                                : ""}{" "}
                              · {done} completed
                            </div>
                          </div>

                          <span className="pf-health-percent">
                            {progress}%
                          </span>

                          <div className="pf-health-bar">
                            <div className="pf-progress">
                              <div
                                className="pf-progress-fill"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section
              className="pf-section"
              id="projects-section"
            >
              <div className="pf-projects-header">
                <div>
                  <h2>Your projects</h2>
                  <p>
                    Open a project to manage its
                    tasks and workflow.
                  </p>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    color: "#7b8493",
                  }}
                >
                  {filteredProjects.length} shown
                </span>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="pf-card pf-empty">
                  No projects match your search.
                </div>
              ) : (
                <div className="pf-project-grid">
                  {filteredProjects.map((project) => {
                    const detail =
                      projectDetails[project.id];

                    const tasks = detail?.tasks || [];

                    const done = tasks.filter(
                      (task) =>
                        task.status === "Done"
                    ).length;

                    const progress =
                      tasks.length === 0
                        ? 0
                        : Math.round(
                            (done / tasks.length) *
                              100
                          );

                    return (
                      <article
                        className="pf-project"
                        key={project.id}
                      >
                        <div className="pf-project-top">
                          <div className="pf-project-icon">
                            {project.name
                              ?.charAt(0)
                              .toUpperCase() || "P"}
                          </div>

                          <span className="pf-project-tasks">
                            {tasks.length} tasks
                          </span>
                        </div>

                        <h3>{project.name}</h3>

                        <p>
                          {project.description ||
                            "No description added."}
                        </p>

                        <div className="pf-project-progress">
                          <div className="pf-project-progress-head">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>

                          <div className="pf-progress">
                            <div
                              className="pf-progress-fill"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="pf-project-actions">
                          <Link
                            to={`/projects/${project.id}`}
                            className="pf-project-open"
                          >
                            Open project →
                          </Link>

                          <button
                            className="pf-delete"
                            onClick={() =>
                              deleteProject(project.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}