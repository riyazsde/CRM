import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Logo />
        <p className="eyebrow">Workspace access</p>
        <h1>Welcome back.</h1>
        <p className="auth-copy">Sign in to manage your pipeline and customer relationships.</p>

        <form onSubmit={submit} className="auth-form">
          <label>Email<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn primary wide" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>

        <p className="auth-footer">New to RiyazCRM? <Link to="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
