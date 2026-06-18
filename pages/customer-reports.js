import { useState, useEffect, useCallback } from "react";
import { Modal, Spinner } from "react-bootstrap";

const BASE = "https://fitness-app-seven-beryl.vercel.app";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  goldFaint: "rgba(248,227,150,0.07)", goldBorder: "rgba(248,227,150,0.18)",
  text: "#ffffff", muted: "#888888", divider: "#1e1e1e", input: "#111111",
};

const PRIORITY_MAP = {
  CRITICAL: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", color: "#f87171" },
  HIGH:     { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  color: "#fbbf24" },
  ROUTINE:  { bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)",  color: "#4ade80" },
  LOW:      { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)", color: "#94a3b8" },
};
const STATUS_MAP = {
  OPEN:      { bg: "rgba(248,227,150,0.12)", border: "rgba(248,227,150,0.3)", color: "#f8e396" },
  IN_REVIEW: { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  color: "#fbbf24" },
  RESOLVED:  { bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)",  color: "#4ade80" },
};
const CAT_MAP = {
  CONDUCT:     { bg: "rgba(248,113,113,0.1)", color: "#f87171" },
  PERFORMANCE: { bg: "rgba(74,222,128,0.1)",  color: "#4ade80" },
  ATTENDANCE:  { bg: "rgba(96,165,250,0.1)",  color: "#60a5fa" },
  PAYMENT:     { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24" },
  ACCOUNT:     { bg: "rgba(167,139,250,0.1)", color: "#a78bfa" },
  OTHER:       { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" },
};
const STATUS_FLOW = ["OPEN", "IN_REVIEW", "RESOLVED"];

const token   = () => typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";
const custName = (r) => r?.customer ? `${r.customer.firstName || ""} ${r.customer.lastName || ""}`.trim() || r.customer.firstName || "—" : "—";

const Pill = ({ label, map }) => {
  const s = map[label] || { bg: G.goldFaint, border: G.goldBorder, color: G.gold };
  return <span style={{ background: s.bg, border: `1px solid ${s.border || "transparent"}`, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{label?.replace("_", " ")}</span>;
};

const StatCard = ({ icon, label, value, sub, subColor, loading }) => (
  <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 12, padding: "20px 22px", flex: 1, minWidth: 160 }}>
    <div style={{ width: 36, height: 36, borderRadius: 9, background: G.goldFaint, border: `1px solid ${G.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
      <i className={`fe fe-${icon}`} style={{ color: G.gold, fontSize: 16 }} />
    </div>
    <p style={{ color: G.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
    <p style={{ color: G.text, fontSize: 26, fontWeight: 800, margin: "0 0 6px", lineHeight: 1 }}>{loading ? "—" : value}</p>
    <span style={{ fontSize: 11, fontWeight: 600, color: subColor || G.muted }}>{sub}</span>
  </div>
);

const FilterBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ background: active ? G.gold : "transparent", border: `1px solid ${active ? G.gold : G.divider}`, color: active ? "#111" : G.muted, padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>
    {label}
  </button>
);

export default function CustomerReports() {
  const [statusFilter,   setStatusFilter]   = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 10;

  const [reports,  setReports]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updating,  setUpdating]  = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (statusFilter)   p.set("status",   statusFilter);
      if (categoryFilter) p.set("category", categoryFilter);
      if (priorityFilter) p.set("priority", priorityFilter);
      const res  = await fetch(`${BASE}/api/admin/customer-reports?${p}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (res.ok && data.success) {
        const list = data.data?.reports || [];
        setReports(list);
        setTotal(data.data?.pagination?.total || list.length);
      } else { setReports([]); }
    } catch { setReports([]); }
    finally  { setLoading(false); }
  }, [page, statusFilter, categoryFilter, priorityFilter]); // eslint-disable-line

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const openDetail = (r) => { setSelected(r); setAdminNote(""); setNewStatus(r.status); setUpdateMsg(""); };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true); setUpdateMsg("");
    try {
      const body = { status: newStatus };
      if (adminNote.trim()) body.adminNote = adminNote.trim();
      const res  = await fetch(`${BASE}/api/admin/customer-reports/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok && data.success) {
        setUpdateMsg("Updated successfully!");
        setSelected((p) => ({ ...p, status: newStatus }));
        fetchReports();
        setTimeout(() => setUpdateMsg(""), 2500);
      } else { setUpdateMsg(data.message || "Update failed"); }
    } catch (e) { setUpdateMsg(e.message); }
    finally { setUpdating(false); }
  };

  const resetFilters = () => { setStatusFilter(""); setCategoryFilter(""); setPriorityFilter(""); setPage(1); };
  const totalPages   = Math.ceil(total / PAGE_SIZE);
  const openCount    = reports.filter((r) => r.status === "OPEN").length;
  const critCount    = reports.filter((r) => r.priority === "CRITICAL" || r.priority === "HIGH").length;
  const resCount     = reports.filter((r) => r.status === "RESOLVED").length;

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 28, fontFamily: "Montserrat, Arial, sans-serif" }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg);} }
        .rp-ta { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px; padding: 10px 14px; font-size: 13px; outline: none; width: 100%; resize: vertical; font-family: inherit; }
        .rp-ta:focus { border-color: rgba(248,227,150,0.35) !important; }
        .rp-th { background: #111 !important; color: rgba(248,227,150,0.65) !important; font-size: 10px !important; font-weight: 700 !important; letter-spacing: 1.2px !important; padding: 12px 16px !important; text-transform: uppercase; border-bottom: 1px solid ${G.divider}; white-space: nowrap; }
        .rp-td { background: ${G.card} !important; color: #cccccc !important; border-bottom: 1px solid #141414 !important; padding: 13px 16px !important; font-size: 12px !important; font-weight: 600 !important; vertical-align: middle !important; font-family: Montserrat, Arial, sans-serif !important; line-height: 1.4 !important; }
        .rp-tr:hover .rp-td { background: #111 !important; cursor: pointer; }
        .rp-pg { background: transparent; border: 1px solid ${G.divider}; color: ${G.muted}; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; }
        .rp-pg:hover { border-color: ${G.gold}; color: ${G.gold}; }
        .rp-pg.active { background: ${G.gold}; border-color: ${G.gold}; color: #111; font-weight: 700; }
        .rp-pg:disabled { opacity: 0.35; cursor: not-allowed; }
        .modal-gold .modal-content { background: #0d0d0d; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .modal-body   { background: #0d0d0d !important; }
        .modal-gold .btn-close    { filter: invert(1) brightness(0.6); }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ color: G.text, fontWeight: 700, margin: "0 0 4px" }}>Customer Reports</h3>
        <small style={{ color: G.muted }}>Manage and resolve customer support requests</small>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon="inbox"          label="Total"          value={total}     sub="All records"     loading={loading} />
        <StatCard icon="alert-circle"   label="Open"          value={openCount}  sub="Needs attention" subColor={G.gold}  loading={loading} />
        <StatCard icon="alert-triangle" label="High Priority" value={critCount}  sub="Critical / High" subColor="#f87171" loading={loading} />
        <StatCard icon="check-circle"   label="Resolved"      value={resCount}   sub="Current page"    loading={loading} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <span style={{ color: G.muted, fontSize: 12 }}>Status:</span>
        {["", "OPEN", "IN_REVIEW", "RESOLVED"].map((s) => <FilterBtn key={s} label={s || "All"} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }} />)}
        <span style={{ color: G.divider }}>|</span>
        <span style={{ color: G.muted, fontSize: 12 }}>Priority:</span>
        {["", "CRITICAL", "HIGH", "ROUTINE", "LOW"].map((p) => <FilterBtn key={p} label={p || "All"} active={priorityFilter === p} onClick={() => { setPriorityFilter(p); setPage(1); }} />)}
        <span style={{ color: G.divider }}>|</span>
        <span style={{ color: G.muted, fontSize: 12 }}>Category:</span>
        {["", "CONDUCT", "PERFORMANCE", "ATTENDANCE", "PAYMENT", "ACCOUNT", "OTHER"].map((c) => <FilterBtn key={c} label={c || "All"} active={categoryFilter === c} onClick={() => { setCategoryFilter(c); setPage(1); }} />)}
        {(statusFilter || categoryFilter || priorityFilter) && <button onClick={resetFilters} style={{ background: "transparent", border: `1px solid ${G.divider}`, color: "#f87171", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Clear</button>}
      </div>

      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Report ID","Customer","Subject","Category","Priority","Status","Date","Action"].map((h) => <th key={h} className="rp-th">{h}</th>)}</tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="rp-td" style={{ textAlign: "center", padding: "40px 0" }}><Spinner animation="border" size="sm" style={{ borderColor: G.gold, borderRightColor: "transparent" }} /></td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={8} className="rp-td" style={{ textAlign: "center", color: G.muted, padding: "40px 0" }}>No customer reports found.</td></tr>
              ) : reports.map((r, i) => (
                <tr key={r.id || i} className="rp-tr" onClick={() => openDetail(r)}>
                  <td className="rp-td" style={{ color: G.gold, fontWeight: 700 }}>{r.id?.slice(-6)?.toUpperCase()}</td>
                  <td className="rp-td">{custName(r)}</td>
                  <td className="rp-td" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subject || "—"}</td>
                  <td className="rp-td"><span style={{ background: CAT_MAP[r.category]?.bg || G.goldFaint, color: CAT_MAP[r.category]?.color || G.gold, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{r.category || "—"}</span></td>
                  <td className="rp-td"><Pill label={r.priority} map={PRIORITY_MAP} /></td>
                  <td className="rp-td"><Pill label={r.status}   map={STATUS_MAP}   /></td>
                  <td className="rp-td" style={{ color: G.muted }}>{fmtDate(r.createdAt)}</td>
                  <td className="rp-td"><button onClick={(e) => { e.stopPropagation(); openDetail(r); }} style={{ background: G.goldFaint, border: `1px solid ${G.divider}`, color: G.gold, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: `1px solid ${G.divider}` }}>
          <span style={{ color: G.muted, fontSize: 12 }}>Showing {reports.length ? (page-1)*PAGE_SIZE+1 : 0}–{(page-1)*PAGE_SIZE+reports.length} of {total}</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="rp-pg" disabled={page<=1} onClick={() => setPage((p) => p-1)}><i className="fe fe-chevron-left" style={{ fontSize: 12 }} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map((p) => <button key={p} className={`rp-pg${page===p?" active":""}`} onClick={() => setPage(p)}>{p}</button>)}
            {totalPages > 5 && <><span style={{ color: G.muted, fontSize: 12 }}>…</span><button className="rp-pg" onClick={() => setPage(totalPages)}>{totalPages}</button></>}
            <button className="rp-pg" disabled={page>=totalPages} onClick={() => setPage((p) => p+1)}><i className="fe fe-chevron-right" style={{ fontSize: 12 }} /></button>
          </div>
        </div>
      </div>

      <Modal show={!!selected} onHide={() => setSelected(null)} centered className="modal-gold" size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: G.goldLight, fontWeight: 700, fontSize: 16 }}>Customer Report — <span style={{ color: G.muted, fontWeight: 400 }}>{selected?.id?.slice(-6)?.toUpperCase()}</span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Customer Info */}
              <div style={{ background: G.input, border: `1px solid ${G.divider}`, borderRadius: 10, padding: 16 }}>
                <p style={{ color: G.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>Customer Info</p>
                {[["Name", custName(selected)], ["Email", selected.customer?.email || "—"]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${G.divider}` }}>
                    <span style={{ color: G.muted, fontSize: 12 }}>{l}</span><span style={{ color: G.text, fontSize: 12, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Report Details */}
              <div style={{ background: G.input, border: `1px solid ${G.divider}`, borderRadius: 10, padding: 16 }}>
                <p style={{ color: G.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>Report Details</p>
                {[
                  ["Subject",  selected.subject || "—"],
                  ["Category", <span key="c" style={{ background: CAT_MAP[selected.category]?.bg || G.goldFaint, color: CAT_MAP[selected.category]?.color || G.gold, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{selected.category}</span>],
                  ["Priority", <Pill key="p" label={selected.priority} map={PRIORITY_MAP} />],
                  ["Status",   <Pill key="s" label={selected.status}   map={STATUS_MAP}   />],
                  ["Date",     fmtDate(selected.createdAt)],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${G.divider}` }}>
                    <span style={{ color: G.muted, fontSize: 12 }}>{l}</span><span style={{ color: G.text, fontSize: 12, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                {selected.adminNote && <div style={{ paddingTop: 10 }}><span style={{ color: G.muted, fontSize: 12 }}>Previous Admin Note</span><p style={{ color: G.muted, fontSize: 12, lineHeight: 1.7, margin: "6px 0 0", fontStyle: "italic" }}>{selected.adminNote}</p></div>}
              </div>
              {/* Update */}
              <div style={{ background: G.goldFaint, border: `1px solid ${G.goldBorder}`, borderRadius: 10, padding: 16 }}>
                <p style={{ color: G.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>Update Report</p>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: G.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>Change Status</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {STATUS_FLOW.map((s) => (
                      <button key={s} onClick={() => setNewStatus(s)} style={{ background: newStatus === s ? (STATUS_MAP[s]?.bg || G.goldFaint) : "transparent", border: `1px solid ${newStatus === s ? (STATUS_MAP[s]?.border || G.goldBorder) : G.divider}`, color: newStatus === s ? (STATUS_MAP[s]?.color || G.gold) : G.muted, padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: newStatus === s ? 700 : 400 }}>
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color: G.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>Admin Note</label>
                  <textarea className="rp-ta" rows={3} placeholder="Add a note or action taken..." value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
                </div>
                {updateMsg && <p style={{ color: updateMsg.includes("success") ? "#4ade80" : "#f87171", fontSize: 12, margin: "10px 0 0", fontWeight: 600 }}>{updateMsg}</p>}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setSelected(null)} style={{ background: "#2a2a2a", border: `1px solid ${G.divider}`, color: G.text, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Close</button>
          <button onClick={handleUpdate} disabled={updating} style={{ background: G.gold, border: "none", color: "#111", padding: "8px 22px", borderRadius: 8, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer", fontSize: 13, opacity: updating ? 0.7 : 1, display: "flex", alignItems: "center", gap: 7 }}>
            {updating && <span style={{ width: 12, height: 12, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #111", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
