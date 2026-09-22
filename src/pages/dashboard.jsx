import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { api } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const totalTasks = useMemo(
    () =>
      projects.reduce(
        (sum, project) =>
          sum + (project._count?.tasks || 0),
        0
      ),
    [projects]
  );

  async function loadProjects() {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      if (error.status === 401) {
        logout();
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    loadProjects();
  }, []);

  async function createProject(e) {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setCreating(true);
      setError("");

      const project = await api.createProject({
        name,
        description,
      });

      setProjects((current) => [
        project,
        ...current,
      ]);

      setName("");
      setDescription("");
    } catch (error) {
      setError(error.message);
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
    } catch (error) {
      setError(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand-mark">P</div>
          <span>ProjectFlow</span>
        </div>

        <nav>
          <div className="nav-item active">
            <span>▦</span>
            Dashboard
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase() ||
                "U"}
            </div>

            <div>
              <strong>{user?.name || "User"}</strong>
              <small>{user?.email}</small>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              WORKSPACE
            </p>

            <h1>Good morning, {user?.name}</h1>

            <p className="muted">
              Here's what's happening with your
              projects.
            </p>
          </div>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Projects</span>
            <strong>{projects.length}</strong>
          </div>

          <div className="stat-card">
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
          </div>

          <div className="stat-card">
            <span>Workspace</span>
            <strong>Active</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Create a project</h2>
              <p>
                Start a new workspace for your team.
              </p>
            </div>
          </div>

          <form onSubmit={createProject}>
            <div className="project-form">
              <input
                placeholder="Project name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              <input
                placeholder="Short description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

              <button
                className="primary-button"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "+ Create Project"}
              </button>
            </div>
          </form>
        </section>

        <section className="projects-section">
          <div className="section-heading">
            <div>
              <h2>Your projects</h2>
              <p>
                Select a project to manage its tasks.
              </p>
            </div>

            <span className="project-total">
              {projects.length} projects
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">+</div>

              <h3>No projects yet</h3>

              <p>
                Create your first project above.
              </p>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <div
                  className="project-card"
                  key={project.id}
                >
                  <Link
                    to={`/projects/${project.id}`}
                    className="project-card-link"
                  >
                    <div className="project-icon">
                      {project.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="project-card-body">
                      <div className="project-card-title">
                        <h3>{project.name}</h3>

                        <span>
                          {project._count?.tasks ||
                            0}{" "}
                          tasks
                        </span>
                      </div>

                      <p>
                        {project.description ||
                          "No description added."}
                      </p>
                    </div>
                  </Link>

                  <div className="project-card-footer">
                    <button
                      className="danger-button"
                      onClick={() =>
                        deleteProject(
                          project.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}