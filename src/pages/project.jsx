import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { api } from "../api";

const STATUSES = [
  "Todo",
  "In Progress",
  "Done",
];

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function loadProject() {
    try {
      const data = await api.getProject(id);

      setProject(data);
      setTasks(data.tasks || []);
    } catch (error) {
      if (error.status === 401) {
        navigate("/login");
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

    loadProject();
  }, [id]);

  async function addTask(e) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setAdding(true);
      setError("");

      const task = await api.createTask(id, {
        title,
      });

      setTasks((current) => [
        task,
        ...current,
      ]);

      setTitle("");
    } catch (error) {
      setError(error.message);
    } finally {
      setAdding(false);
    }
  }

  async function changeStatus(taskId, status) {
    try {
      const updated = await api.updateTask(
        taskId,
        { status }
      );

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? updated
            : task
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteTask(taskId) {
    try {
      await api.deleteTask(taskId);

      setTasks((current) =>
        current.filter(
          (task) => task.id !== taskId
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="loading-screen">
        <h2>Project not found</h2>
        <Link to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand-mark">P</div>
          <span>ProjectFlow</span>
        </div>

        <nav>
          <Link
            to="/dashboard"
            className="nav-item"
          >
            <span>←</span>
            All Projects
          </Link>

          <div className="nav-item active">
            <span>▦</span>
            Project Board
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <Link
          to="/dashboard"
          className="back-link"
        >
          ← Back to projects
        </Link>

        <header className="project-header">
          <div>
            <p className="eyebrow">
              PROJECT BOARD
            </p>

            <h1>{project.name}</h1>

            <p className="muted">
              {project.description ||
                "Manage tasks and track project progress."}
            </p>
          </div>

          <div className="project-counter">
            {tasks.length} tasks
          </div>
        </header>

        <form
          className="task-form"
          onSubmit={addTask}
        >
          <input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <button
            className="primary-button"
            disabled={adding}
          >
            {adding ? "Adding..." : "+ Add Task"}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="kanban-board">
          {STATUSES.map((status) => {
            const columnTasks = tasks.filter(
              (task) => task.status === status
            );

            return (
              <div
                className="kanban-column"
                key={status}
              >
                <div className="kanban-header">
                  <div>
                    <h2>{status}</h2>
                    <span>
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                <div className="kanban-list">
                  {columnTasks.length === 0 ? (
                    <div className="column-empty">
                      No tasks
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <article
                        className="task-card"
                        key={task.id}
                      >
                        <div className="task-top">
                          <span className="task-dot" />

                          <button
                            className="task-delete"
                            onClick={() =>
                              deleteTask(
                                task.id
                              )
                            }
                          >
                            ×
                          </button>
                        </div>

                        <h3>{task.title}</h3>

                        <select
                          value={task.status}
                          onChange={(e) =>
                            changeStatus(
                              task.id,
                              e.target.value
                            )
                          }
                        >
                          {STATUSES.map(
                            (item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {item}
                              </option>
                            )
                          )}
                        </select>
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}