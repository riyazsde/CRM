import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) return setError("Password must be at least 8 characters.");

    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate("/", { replace: true });
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
        <p className="eyebrow">Create workspace</p>
        <h1>Start your CRM.</h1>
        <p className="auth-copy">Keep leads, prospects and customers in one clean workspace.</p>

        <form onSubmit={submit} className="auth-form">
          <label>Full name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Email<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" required minLength="8" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn primary wide" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
