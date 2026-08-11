import { useEffect, useState } from "react";

const empty = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "Lead",
  notes: ""
};

export default function ContactModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState(contact || empty);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(contact || empty);
  }, [contact]);

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 2) return setError("Name must contain at least 2 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Enter a valid email.");
    if (form.phone.trim().length < 7) return setError("Enter a valid phone number.");
    if (form.company.trim().length < 2) return setError("Company is required.");

    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">{contact ? "Update record" : "New record"}</p>
            <h2>{contact ? "Edit contact" : "Add contact"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-grid">
          <label>Name<input value={form.name} onChange={e => update("name", e.target.value)} /></label>
          <label>Email<input type="email" value={form.email} onChange={e => update("email", e.target.value)} /></label>
          <label>Phone<input value={form.phone} onChange={e => update("phone", e.target.value)} /></label>
          <label>Company<input value={form.company} onChange={e => update("company", e.target.value)} /></label>
          <label>Status
            <select value={form.status} onChange={e => update("status", e.target.value)}>
              <option>Lead</option>
              <option>Prospect</option>
              <option>Customer</option>
            </select>
          </label>
          <label className="full">Notes<textarea rows="4" value={form.notes} onChange={e => update("notes", e.target.value)} /></label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary">{contact ? "Save changes" : "Create contact"}</button>
        </div>
      </form>
    </div>
  );
}
