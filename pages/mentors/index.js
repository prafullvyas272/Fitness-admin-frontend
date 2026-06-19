import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentors, deleteMentor } from "../../redux/slices/mentorSlice";

const G = {
  bg:         "#0a0a0a",
  card:       "#0d0d0d",
  cardBorder: "1px solid #1e1e1e",
  gold:       "#f8e396",
  goldLight:  "#f8e396",
  goldFaint:  "rgba(248,227,150,0.07)",
  text:       "#ffffff",
  muted:      "#888888",
  divider:    "#1e1e1e",
  input:      "#111111",
  rowHover:   "#111111",
};

const STATUS_DISPLAY = { ACTIVE: "Active", IN_REVIEW: "In Review", SUSPENDED: "Suspended" };

const STATUS_TABS = [
  { label: "All",         value: ""           },
  { label: "Active",      value: "ACTIVE"     },
  { label: "In Review",   value: "IN_REVIEW"  },
  { label: "Suspended",   value: "SUSPENDED"  },
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
      <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(248,227,150,0.1)", color: G.goldLight, border: `1px solid ${G.divider}` }}>
        {spec}
      </span>
      {extra > 0 && (
        <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(248,227,150,0.07)", color: G.gold, border: `1px solid ${G.divider}` }}>
          + {extra}
        </span>
      )}
    </span>
  );
}

export default function MentorsPage() {
  const router   = useRouter();
  const dispatch = useDispatch();
  const { list: mentors, loading, total, totalPages, page, pageSize } = useSelector((s) => s.mentors);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);

  useEffect(() => {
    dispatch(fetchMentors({ page: currentPage, pageSize: 10, status: statusFilter }));
  }, [dispatch, currentPage, statusFilter]);

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  // Normalise mentor data from API response shape
  const normalised = mentors.map((m) => ({
    _id:            m.id,
    name:           [m.firstName, m.lastName].filter(Boolean).join(" ") || "—",
    role:           m.mentorProfile?.title   || "",
    contact:        m.phone                  || "",
    specialization: m.specialities?.[0]?.speciality?.name || "General",
    extraSpec:      Math.max(0, (m.specialities?.length || 0) - 1),
    assignedPts:    m.assignedPTs            ?? 0,
    status:         STATUS_DISPLAY[m.mentorProfile?.status] || "Active",
    profilePhoto:   m.mentorProfile?.avatarUrl || "",
  }));

  // client-side text search on the current page only
  const filtered = normalised.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.contact.includes(search) ||
    m.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered; // already the current page from API

  const totalActive    = normalised.filter((m) => m.status === "Active").length;
  const pendingReviews = normalised.filter((m) => m.status === "In Review").length;
  const totalPts       = normalised.reduce((sum, m) => sum + (m.assignedPts || 0), 0);

  const handleDelete = async (id) => {
    if (!confirm("Delete this mentor?")) return;
    dispatch(deleteMentor(id));
  };

  const exportCSV = () => {
    const header = ["Name", "Role", "Contact", "Specialization", "Assigned Pts", "Status"];
    const rows   = normalised.map((m) => [m.name, m.role, m.contact, m.specialization, m.assignedPts, m.status]);
    const csv    = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob   = new Blob([csv], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a"); a.href = url; a.download = "mentors.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: "28px" }}>
      <style>{`
        .tr-mentor td { background: ${G.card} !important; border-bottom: 1px solid #141414 !important; color: #cccccc !important; padding: 14px 16px !important; font-size: 12px !important; vertical-align: middle; font-weight: 600 !important; line-height: 1.4 !important; font-family: Montserrat, Arial, sans-serif !important; }
        .tr-mentor:hover td { background: ${G.rowHover} !important; }
        .th-mentor { background: #111111 !important; color: rgba(248,227,150,0.6) !important; border-bottom: 1px solid ${G.divider} !important; font-size: 10px !important; letter-spacing: 1.2px !important; padding: 12px 16px !important; font-weight: 700 !important; }
        .inp-gold { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: #cccccc !important; border-radius: 7px !important; }
        .inp-gold::placeholder { color: #2a2a2a !important; }
        .inp-gold:focus { border-color: rgba(248,227,150,0.25) !important; outline: none !important; }
        .inp-gold option { background: #111111; color: #cccccc; }
        .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: rgba(248,227,150,0.07); border: 1px solid ${G.divider}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: ${G.goldLight}; flex-shrink: 0; overflow: hidden; }
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
          style={{ background: G.gold, color: "#000", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
        >
          + Register New Mentor
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
        {[
          { label: "Total Active Mentors", value: String(totalActive).padStart(2, "0"),    accent: "#4ade80" },
          { label: "Pending Reviews",      value: String(pendingReviews).padStart(2, "0"), accent: "#f8e396" },
          { label: "Total Managed PTs",    value: String(totalPts),                        accent: "#f8e396" },
        ].map((stat, i) => (
          <div key={i} style={{ background: G.card, border: G.cardBorder, borderLeft: `3px solid ${stat.accent}`, borderRadius: 12, padding: "24px 28px", position: "relative", overflow: "hidden" }}>
            <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: "0 0 8px" }}>{stat.label}</p>
            <h2 style={{ color: G.text, fontWeight: 800, margin: 0, fontSize: 36 }}>{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* TABLE CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, overflow: "hidden" }}>

        {/* TOOLBAR */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${G.divider}` }}>
          {/* Status tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleStatusChange(tab.value)}
                  style={{
                    padding: "5px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: active ? G.gold : "transparent",
                    color: active ? "#000" : G.muted,
                    border: active ? "none" : `1px solid ${G.divider}`,
                    transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search + export */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <i className="fe fe-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 14 }} />
              <input className="inp-gold" placeholder="Filter by Name, Contact Number or specialization" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "8px 12px 8px 36px", fontSize: 13 }} />
            </div>
            <button onClick={exportCSV} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: G.goldFaint, border: `1px solid ${G.divider}`, color: G.goldLight }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <span className="spinner-border" style={{ color: G.gold }} />
            </div>
          ) : (
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
                  <tr key={mentor._id} className="tr-mentor">
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar-circle">
                          {mentor.profilePhoto
                            ? <img src={mentor.profilePhoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : mentor.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: G.text }}>{mentor.name}</div>
                          <div style={{ fontSize: 11, color: G.muted, textTransform: "uppercase", letterSpacing: "0.05rem", marginTop: 2 }}>{mentor.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: G.muted }}>{mentor.contact || "—"}</td>
                    <td><SpecBadge spec={mentor.specialization} extra={mentor.extraSpec} /></td>
                    <td style={{ fontWeight: 700 }}>
                      {String(mentor.assignedPts).padStart(2, "0")}
                      {mentor.unit && <span style={{ color: G.muted, fontWeight: 400, marginLeft: 4 }}>{mentor.unit}</span>}
                    </td>
                    <td><StatusBadge status={mentor.status} /></td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <button
                          onClick={() => router.push(`/mentors/${mentor._id}`)}
                          style={{ width: 32, height: 32, borderRadius: 6, cursor: "pointer", background: G.goldFaint, border: `1px solid ${G.divider}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <i className="fe fe-edit-2" style={{ color: G.goldLight, fontSize: 13 }} />
                        </button>
                        <button
                          onClick={() => handleDelete(mentor._id)}
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
          )}
        </div>

        {/* FOOTER / PAGINATION */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: G.muted, fontSize: 13 }}>
            Showing {total === 0 ? 0 : (currentPage - 1) * (pageSize || 10) + 1}–{Math.min(currentPage * (pageSize || 10), total)} of {total} mentors
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[
              { label: "‹", page: currentPage - 1, disabled: currentPage === 1 },
              ...[...Array(totalPages || 1)].map((_, i) => ({ label: i + 1, page: i + 1, disabled: false })),
              { label: "›", page: currentPage + 1, disabled: currentPage >= (totalPages || 1) },
            ].map((btn, i) => {
              const isActive = btn.label === currentPage;
              return (
                <button key={i} disabled={btn.disabled} onClick={() => !btn.disabled && setCurrentPage(btn.page)}
                  style={{ width: 30, height: 30, borderRadius: 6, fontSize: 11, cursor: btn.disabled ? "not-allowed" : "pointer", fontWeight: isActive ? 700 : 400, border: "1px solid #2a2a2a", background: isActive ? G.gold : "transparent", color: btn.disabled ? "#444" : isActive ? "#000" : "#888888", opacity: btn.disabled ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
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
