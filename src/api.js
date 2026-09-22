const API_URL =
  "/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message || "Request failed"
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  register(data) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProjects() {
    return request("/projects");
  },

  createProject(data) {
    return request("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProject(id) {
    return request(`/projects/${id}`);
  },

  deleteProject(id) {
    return request(`/projects/${id}`, {
      method: "DELETE",
    });
  },

  createTask(projectId, data) {
    return request(`/tasks/${projectId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTask(id, data) {
    return request(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteTask(id) {
    return request(`/tasks/${id}`, {
      method: "DELETE",
    });
  },
};