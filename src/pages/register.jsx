import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api.register(form);

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">P</div>
        <span>ProjectFlow</span>
      </div>

      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >
        <div className="auth-header">
          <h1>Create your account</h1>
          <p>
            Start organizing your projects today.
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <label>Full name</label>

        <input
          name="name"
          placeholder="Shreyas Kharat"
          value={form.name}
          onChange={updateField}
          required
        />

        <label>Email address</label>

        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={updateField}
          required
        />

        <label>Password</label>

        <input
          name="password"
          type="password"
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={updateField}
          minLength={6}
          required
        />

        <button
          className="primary-button full-button"
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}