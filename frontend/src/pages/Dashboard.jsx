import { useEffect, useMemo, useState } from "react";
import { Download, LogOut, Plus, Search, Users, UserRoundCheck, UserRoundPlus } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import ContactModal from "../components/ContactModal";
import ActivityPanel from "../components/ActivityPanel";
import Logo from "../components/Logo";

const emptyPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stats = useMemo(() => ({
    total: pagination.total,
    leads: contacts.filter(c => c.status === "Lead").length,
    customers: contacts.filter(c => c.status === "Customer").length
  }), [contacts, pagination.total]);

  async function loadContacts() {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page, limit: 10 });
      if (search.trim()) query.set("search", search.trim());
      if (status) query.set("status", status);

      const data = await api(`/contacts?${query.toString()}`);
      setContacts(data.contacts);
      setPagination(data.pagination);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadActivities() {
    try {
      const data = await api("/activities");
      setActivities(data.activities);
    } catch {}
  }

  useEffect(() => {
    loadContacts();
  }, [page, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadContacts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadActivities();
  }, []);

  async function saveContact(form) {
    if (modal?.mode === "edit") {
      await api(`/contacts/${modal.contact._id}`, {
        method: "PATCH",
        body: JSON.stringify(form)
      });
    } else {
      await api("/contacts", {
        method: "POST",
        body: JSON.stringify(form)
      });
    }

    setModal(null);
    await Promise.all([loadContacts(), loadActivities()]);
  }

  async function removeContact(contact) {
    if (!window.confirm(`Delete ${contact.name}?`)) return;

    try {
      await api(`/contacts/${contact._id}`, { method: "DELETE" });
      await Promise.all([loadContacts(), loadActivities()]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function exportCsv() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/contacts/export`, {
        credentials: "include",
        headers: {}
      });

      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "riyazcrm-contacts.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("CSV export requires a valid active session. Try refreshing the page first.");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo />
        <div className="topbar-user">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-meta">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={18} /></button>
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Customer workspace</p>
            <h1>Contacts that move deals forward.</h1>
            <p className="muted">A focused pipeline view for leads, prospects and customers.</p>
          </div>
          <div className="heading-actions">
            <button className="btn secondary" onClick={exportCsv}><Download size={16} /> Export CSV</button>
            <button className="btn primary" onClick={() => setModal({ mode: "create" })}><Plus size={17} /> Add contact</button>
          </div>
        </div>

        <section className="stats-grid">
          <div className="stat-card"><span><Users size={18} /></span><small>Total contacts</small><strong>{stats.total}</strong></div>
          <div className="stat-card"><span><UserRoundPlus size={18} /></span><small>Leads on page</small><strong>{stats.leads}</strong></div>
          <div className="stat-card"><span><UserRoundCheck size={18} /></span><small>Customers on page</small><strong>{stats.customers}</strong></div>
        </section>

        <section className="content-grid">
          <div className="contacts-card">
            <div className="toolbar">
              <div className="search-box">
                <Search size={17} />
                <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            {error && <div className="alert">{error}</div>}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Contact</th><th>Company</th><th>Status</th><th>Phone</th><th>Updated</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="empty">Loading contacts…</td></tr>
                  ) : contacts.length === 0 ? (
                    <tr><td colSpan="6" className="empty">No contacts found. Add your first contact.</td></tr>
                  ) : contacts.map(contact => (
                    <tr key={contact._id}>
                      <td>
                        <div className="contact-name">
                          <div className="mini-avatar">{contact.name.charAt(0).toUpperCase()}</div>
                          <div><strong>{contact.name}</strong><span>{contact.email}</span></div>
                        </div>
                      </td>
                      <td>{contact.company}</td>
                      <td><span className={`badge ${contact.status.toLowerCase()}`}>{contact.status}</span></td>
                      <td>{contact.phone}</td>
                      <td>{new Date(contact.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="row-actions">
                          <button className="link-btn" onClick={() => setModal({ mode: "edit", contact })}>Edit</button>
                          <button className="danger-link" onClick={() => removeContact(contact)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>Showing page {pagination.page} of {Math.max(pagination.totalPages, 1)} · 10 per page</span>
              <div>
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          </div>

          <ActivityPanel activities={activities} />
        </section>
      </main>

      {modal && (
        <ContactModal
          contact={modal.mode === "edit" ? modal.contact : null}
          onClose={() => setModal(null)}
          onSave={saveContact}
        />
      )}
    </div>
  );
}
