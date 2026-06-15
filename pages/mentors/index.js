import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col } from "react-bootstrap";

const G = {
  bg:         "#111111",
  card:       "#1a1a1a",
  cardBorder: "1px solid rgba(212,160,23,0.25)",
  gold:       "#d4a017",
  goldLight:  "#f5d76e",
  goldFaint:  "rgba(212,160,23,0.08)",
  text:       "#f1f1f1",
  muted:      "#888888",
  divider:    "rgba(212,160,23,0.15)",
  input:      "#222222",
  rowHover:   "rgba(212,160,23,0.06)",
};

const SPECIALIZATIONS = ["All Specializations", "Tactical Strength", "Business Growth", "Nutrition", "Biometric"];

const INITIAL_MENTORS = [
  { id: 1, name: "Elias Thorne",  role: "Senior Executive Mentor", contact: "+1 (555) 012-7209", specialization: "Tactical Strength", specializations: ["Tactical Strength", "Business Growth", "Nutrition", "Leadership"], extraSpec: 3, assignedPts: 12, ptSaturation: 12, ptSaturationMax: 30, unit: "", status: "Active", experience: "8", region: "North America" },
  { id: 2, name: "Sarah Jenkins", role: "Operations Specialist",   contact: "+1 (555) 012-1154", specialization: "Business Growth",   specializations: ["Business Growth"], extraSpec: 0, assignedPts: 8,  ptSaturation: 8,  ptSaturationMax: 30, unit: "Personnel", status: "Active",    experience: "5", region: "Europe" },
  { id: 3, name: "Marcus Vane",   role: "Biometric Lead",          contact: "+1 (555) 012-4432", specialization: "Nutrition",         specializations: ["Nutrition", "Biometric"], extraSpec: 0, assignedPts: 4,  ptSaturation: 4,  ptSaturationMax: 30, unit: "Personnel", status: "In Review", experience: "3", region: "Asia Pacific" },
  { id: 4, name: "Adrian Locke",  role: "Strategic Analyst",       contact: "+1 (555) 012-0012", specialization: "Tactical Strength", specializations: ["Tactical Strength"], extraSpec: 0, assignedPts: 0,  ptSaturation: 0,  ptSaturationMax: 30, unit: "Personnel", status: "Suspended", experience: "2", region: "South America" },
];

function StatusBadge({ status }) {
  const map = {
    Active:      { bg: "rgba(34,197,94,0.12)",  color: "#4ade80", dot: "#4ade80" },
    "In Review": { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", dot: "#fbbf24" },
    Suspended:   { bg: "rgba(239,68,68,0.12)",  color: "#f87171", dot: "#f87171" },
  };
  const s = map[status] || map.Active;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

function SpecBadge({ spec, extra }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
      <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(212,160,23,0.15)", color: G.goldLight, border: `1px solid ${G.divider}` }}>
        {spec}
      </span>
      {extra > 0 && (
        <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(212,160,23,0.08)", color: G.gold, border: `1px solid ${G.divider}` }}>
          + {extra}
        </span>
      )}
    </span>
  );
}

export default function MentorsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState(INITIAL_MENTORS);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("All Specializations");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Load persisted mentors from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mentors_data");
    if (saved) {
      try { setMentors(JSON.parse(saved)); } catch (_) {}
    }
    setReady(true);
  }, []);

  // Persist to localStorage whenever mentors change
  useEffect(() => {
    if (ready) localStorage.setItem("mentors_data", JSON.stringify(mentors));
  }, [mentors, ready]);

  // Re-load mentors when navigating back to this page (after save on profile page)
  useEffect(() => {
    const handleFocus = () => {
      const saved = localStorage.getItem("mentors_data");
      if (saved) {
        try { setMentors(JSON.parse(saved)); } catch (_) {}
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const filtered = mentors.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.contact.includes(search) ||
      m.specialization.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === "All Specializations" || m.specialization === specFilter;
    return matchSearch && matchSpec;
  });

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const totalActive    = mentors.filter((m) => m.status === "Active").length;
  const pendingReviews = mentors.filter((m) => m.status === "In Review").length;
  const totalPts       = mentors.reduce((sum, m) => sum + m.assignedPts, 0);

  const handleDelete = (id) => {
    if (!confirm("Delete this mentor?")) return;
    const updated = mentors.filter((m) => m.id !== id);
    setMentors(updated);
  };

  const exportCSV = () => {
    const header = ["Name", "Role", "Contact", "Specialization", "Assigned Pts", "Status"];
    const rows = mentors.map((m) => [m.name, m.role, m.contact, m.specialization, m.assignedPts, m.status]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mentors.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: "28px" }}>
      <style>{`
        .tr-mentor td { background: ${G.card} !important; border-bottom: 1px solid ${G.divider} !important; color: ${G.text} !important; padding: 14px 16px !important; font-size: 13px; vertical-align: middle; }
        .tr-mentor:hover td { background: ${G.rowHover} !important; }
        .th-mentor { background: #161616 !important; color: ${G.goldLight} !important; border-bottom: 2px solid ${G.divider} !important; font-size: 11px !important; letter-spacing: 0.8px !important; padding: 12px 16px !important; font-weight: 700; }
        .inp-gold { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px !important; }
        .inp-gold::placeholder { color: #555 !important; }
        .inp-gold:focus { border-color: ${G.gold} !important; box-shadow: 0 0 0 3px rgba(212,160,23,0.15) !important; outline: none !important; }
        .inp-gold option { background: #1a1a1a; color: ${G.text}; }
        .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: rgba(212,160,23,0.15); border: 1px solid ${G.divider}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: ${G.goldLight}; flex-shrink: 0; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: "0 0 4px" }}>
            Terminal &rsaquo; Mentors
          </p>
          <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>Mentor Management HQ</h3>
          <small style={{ color: G.muted }}>Oversee, validate, and manage elite instructional personnel.</small>
        </div>
        <button
          onClick={() => router.push("/mentors/new")}
          style={{ background: `linear-gradient(135deg, ${G.gold}, #b8860b)`, color: "#111", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(212,160,23,0.3)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
        >
          + Register New Mentor
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
        {[
          { label: "Total Active Mentors", value: String(totalActive).padStart(2, "0"), icon: null },
          { label: "Pending Reviews",      value: String(pendingReviews).padStart(2, "0"), icon: null },
          { label: "Total Managed Pts",    value: String(totalPts), icon: "fe-users" },
        ].map((stat, i) => (
          <div key={i} style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "24px 28px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "radial-gradient(circle at top right, rgba(212,160,23,0.1), transparent 70%)", borderRadius: "0 12px 0 0" }} />
            <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: "0 0 8px" }}>{stat.label}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2 style={{ color: G.text, fontWeight: 800, margin: 0, fontSize: 36 }}>{stat.value}</h2>
              {stat.icon && (
                <div style={{ width: 36, height: 36, borderRadius: 8, background: G.goldFaint, border: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fe ${stat.icon}`} style={{ color: G.gold, fontSize: 15 }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* TABLE CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, overflow: "hidden" }}>

        {/* TOOLBAR */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${G.divider}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <i className="fe fe-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 14 }} />
            <input className="inp-gold" placeholder="Filter by Name, Contact Number and speciality" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} style={{ width: "100%", padding: "8px 12px 8px 36px", fontSize: 13 }} />
          </div>
          <select className="inp-gold" style={{ padding: "8px 12px", fontSize: 13, minWidth: 160 }} value={specFilter} onChange={(e) => { setSpecFilter(e.target.value); setCurrentPage(1); }}>
            {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={exportCSV} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: G.goldFaint, border: `1px solid ${G.divider}`, color: G.goldLight }}>
            Export CSV
          </button>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="th-mentor">MENTOR</th>
                <th className="th-mentor">CONTACT NUMBER</th>
                <th className="th-mentor">SPECIALIZATION</th>
                <th className="th-mentor">ASSIGNED PTS</th>
                <th className="th-mentor">STATUS</th>
                <th className="th-mentor" style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr className="tr-mentor">
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: G.muted }}>No mentors found</td>
                </tr>
              ) : paginated.map((mentor) => (
                <tr key={mentor.id} className="tr-mentor">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="avatar-circle">{mentor.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: G.text }}>{mentor.name}</div>
                        <div style={{ fontSize: 11, color: G.muted, textTransform: "uppercase", letterSpacing: "0.05rem", marginTop: 2 }}>{mentor.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: G.muted }}>{mentor.contact}</td>
                  <td><SpecBadge spec={mentor.specialization} extra={mentor.extraSpec} /></td>
                  <td style={{ fontWeight: 700 }}>
                    {String(mentor.assignedPts).padStart(2, "0")}
                    {mentor.unit && <span style={{ color: G.muted, fontWeight: 400, marginLeft: 4 }}>{mentor.unit}</span>}
                  </td>
                  <td><StatusBadge status={mentor.status} /></td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      <button
                        onClick={() => router.push(`/mentors/${mentor.id}`)}
                        style={{ width: 32, height: 32, borderRadius: 6, cursor: "pointer", background: G.goldFaint, border: `1px solid ${G.divider}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <i className="fe fe-edit-2" style={{ color: G.goldLight, fontSize: 13 }} />
                      </button>
                      <button
                        onClick={() => handleDelete(mentor.id)}
                        style={{ width: 32, height: 32, borderRadius: 6, cursor: "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <i className="fe fe-trash-2" style={{ color: "#f87171", fontSize: 13 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: G.muted, fontSize: 13 }}>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} of {filtered.length} Ledger Entries
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[
              { label: "‹", page: currentPage - 1, disabled: currentPage === 1 },
              ...[...Array(totalPages || 1)].map((_, i) => ({ label: i + 1, page: i + 1, disabled: false })),
              { label: "›", page: currentPage + 1, disabled: currentPage === totalPages || totalPages === 0 },
            ].map((btn, i) => {
              const isActive = btn.label === currentPage;
              return (
                <button key={i} disabled={btn.disabled} onClick={() => !btn.disabled && setCurrentPage(btn.page)}
                  style={{ width: 32, height: 32, borderRadius: 6, fontSize: 13, cursor: btn.disabled ? "not-allowed" : "pointer", fontWeight: isActive ? 700 : 400, border: `1px solid ${G.divider}`, background: isActive ? G.gold : "#1a1a1a", color: btn.disabled ? "#444" : isActive ? "#111" : G.goldLight, opacity: btn.disabled ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
