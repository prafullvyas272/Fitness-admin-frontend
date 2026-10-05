import { useState, useEffect, useCallback } from "react";
import { Modal, Spinner } from "react-bootstrap";

const BASE = "https://fitness-app-seven-beryl.vercel.app";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  goldFaint: "rgba(248,227,150,0.07)", goldBorder: "rgba(248,227,150,0.18)",
  text: "#ffffff", muted: "#888888", divider: "#1e1e1e", input: "#111111",
};

const STATUS_MAP = {
  PENDING:   { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", color: "#fbbf24" },
  OPEN:      { bg: "rgba(248,227,150,0.12)", border: "rgba(248,227,150,0.3)", color: "#f8e396" },
  IN_REVIEW: { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  color: "#fbbf24" },
  RESOLVED:  { bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)",  color: "#4ade80" },
};

const token    = () => typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";
const fmtTime  = (value) => {
  if (!value) return "—";
  if (!String(value).includes("T")) {
    const clock = String(value).match(/^(\d{1,2}:\d{2})\s*(am|pm)$/i);
    if (clock) return `${clock[1]}${clock[2].toLowerCase()}`;
    const parsed = new Date(`1970-01-01T${value}`);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase().replace(" ", "");
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase().replace(" ", "");
};
const fmtSlot = (slot) => slot ? `${fmtTime(slot.startTime)}-${fmtTime(slot.endTime)}` : "—";
const fullName = (obj) => obj ? obj.name || `${obj.firstName || ""} ${obj.lastName || ""}`.trim() || "—" : "—";
const getReporter = (report) => {
  const type = String(report?.reportType || "").toUpperCase();
  if (type.startsWith("TRAINER_REPORTED")) return report.trainer;
  if (type.startsWith("MENTOR_REPORTED")) return report.mentor;
  return report.customer;
};

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

const InfoBox = ({ title, rows }) => (
  <div style={{ background: G.input, border: `1px solid ${G.divider}`, borderRadius: 10, padding: 16 }}>
    <p style={{ color: G.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>{title}</p>
    {rows.map(([l, v]) => (
      <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${G.divider}` }}>
        <span style={{ color: G.muted, fontSize: 12 }}>{l}</span>
        <span style={{ color: G.text, fontSize: 12, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v || "—"}</span>
      </div>
    ))}
  </div>
);

const Pagination = ({ page, setPage, totalPages, total, pageSize, count }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: `1px solid ${G.divider}` }}>
    <span style={{ color: G.muted, fontSize: 12 }}>Showing {count ? (page-1)*pageSize+1 : 0}–{(page-1)*pageSize+count} of {total}</span>
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <button className="rp-pg" disabled={page<=1} onClick={() => setPage((p) => p-1)}><i className="fe fe-chevron-left" style={{ fontSize: 12 }} /></button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map((p) => <button key={p} className={`rp-pg${page===p?" active":""}`} onClick={() => setPage(p)}>{p}</button>)}
      {totalPages > 5 && <><span style={{ color: G.muted, fontSize: 12 }}>…</span><button className="rp-pg" onClick={() => setPage(totalPages)}>{totalPages}</button></>}
      <button className="rp-pg" disabled={page>=totalPages} onClick={() => setPage((p) => p+1)}><i className="fe fe-chevron-right" style={{ fontSize: 12 }} /></button>
    </div>
  </div>
);

export default function CancelledReports() {
  const [trainers, setTrainers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cancelledSessions, setCancelledSessions] = useState([]);
  const [cancelledSessionsTotal, setCancelledSessionsTotal] = useState(0);
  const [trainerFilter, setTrainerFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cancelled");
  const [statusFilter,   setStatusFilter]   = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("");
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 10;

  const [reports,       setReports]       = useState([]);
  const [total,         setTotal]         = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);

  useEffect(() => {
    let active = true;
    const headers = { Authorization: `Bearer ${token()}` };
    const loadFiltersAndSessions = async () => {
      setSessionsLoading(true);
      try {
        const [trainerRes, customerRes] = await Promise.all([
          fetch(`${BASE}/api/trainers`, { headers }),
          fetch(`${BASE}/api/customers`, { headers }),
        ]);
        const trainerData = await trainerRes.json();
        const customerData = await customerRes.json();
        const trainerList = trainerData.data?.trainers || trainerData.data || [];
        const customerList = customerData.data?.customers || customerData.data || [];
        if (!active) return;
        setTrainers(Array.isArray(trainerList) ? trainerList : []);
        setCustomers(Array.isArray(customerList) ? customerList : []);

        const [cancelledRes, bookingLists] = await Promise.all([
          (async () => {
            const firstPage = await fetch(`${BASE}/api/cancelled-sessions/admin?page=1&pageSize=100`, { headers }).then((res) => res.json());
            const pageCount = firstPage.data?.pagination?.totalPages || 1;
            if (pageCount <= 1) return firstPage;
            const remainingPages = await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) =>
              fetch(`${BASE}/api/cancelled-sessions/admin?page=${index + 2}&pageSize=100`, { headers }).then((res) => res.json())
            ));
            return {
              ...firstPage,
              data: {
                ...firstPage.data,
                sessions: [
                  ...(firstPage.data?.sessions || []),
                  ...remainingPages.flatMap((result) => result.data?.sessions || []),
                ],
              },
            };
          })(),
          Promise.all((Array.isArray(trainerList) ? trainerList : []).map(async (trainer) => {
            try {
              const res = await fetch(`${BASE}/api/trainers/${trainer.id}/bookings`, { headers });
              const data = await res.json();
              return (data.data?.bookings || []).map((booking) => ({ ...booking, trainerId: booking.trainerId || trainer.id }));
            } catch { return []; }
          })),
        ]);
        if (active) {
          setBookings(bookingLists.flat());
          setCancelledSessions(cancelledRes.data?.sessions || []);
          setCancelledSessionsTotal(cancelledRes.data?.pagination?.total || cancelledRes.data?.sessions?.length || 0);
        }
      } catch {
        if (active) { setTrainers([]); setCustomers([]); setBookings([]); setCancelledSessions([]); }
      } finally {
        if (active) setSessionsLoading(false);
      }
    };
    loadFiltersAndSessions();
    return () => { active = false; };
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      const res  = await fetch(`${BASE}/api/admin/reports?${p}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (res.ok && data.success) {
        const list = data.data?.reports || [];
        setReports(list);
        setTotal(data.data?.pagination?.total || data.data?.total || list.length);
      } else { setReports([]); }
    } catch { setReports([]); }
    finally  { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const openDetail = (report) => setSelected(report);

  const resetFilters = () => { setStatusFilter(""); setCategoryFilter(""); setReportTypeFilter(""); setPage(1); };
  const totalPages   = Math.ceil(total / PAGE_SIZE);
  const matchesFilters = (item) => {
    const itemTrainerId = item.trainerId || item.trainer?.id || item.trainer?._id;
    const itemCustomerId = item.customerId || item.customer?.id || item.customer?._id;
    return (!trainerFilter || String(itemTrainerId) === String(trainerFilter)) &&
      (!customerFilter || String(itemCustomerId) === String(customerFilter));
  };
  const filteredBookings = bookings.filter(matchesFilters);
  const filteredReports = reports.filter((report) => matchesFilters(report) &&
    (!statusFilter || report.status === statusFilter) &&
    (!categoryFilter || String(report.reason || "").toUpperCase() === categoryFilter) &&
    (!reportTypeFilter || report.reportType === reportTypeFilter));
  const visibleReports = filteredReports;
  const filteredCancelledSessions = cancelledSessions.filter((session) => {
    const trainerId = session.trainer?.id || session.trainerId;
    const customerId = session.customer?.id || session.customerId;
    return (!trainerFilter || String(trainerId) === String(trainerFilter)) &&
      (!customerFilter || String(customerId) === String(customerFilter));
  });
  const cancelledByTrainer = filteredCancelledSessions.length;
  const attendedSessions = filteredBookings.filter((booking) => {
    const status = String(booking.status || "").toUpperCase();
    return booking.attended === true || status === "ATTENDED" || status === "COMPLETED";
  }).length;

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
        <h3 style={{ color: G.text, fontWeight: 700, margin: "0 0 4px" }}>Cancelled & reports</h3>
        <small style={{ color: G.muted }}>Manage and resolve trainer support requests</small>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        {[{ label: "Trainer", value: trainerFilter, onChange: setTrainerFilter, options: trainers }, { label: "Customer", value: customerFilter, onChange: setCustomerFilter, options: customers }].map((filter) => (
          <label key={filter.label} style={{ display: "flex", flexDirection: "column", gap: 6, color: G.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {filter.label}
            <select value={filter.value} onChange={(event) => filter.onChange(event.target.value)} style={{ minWidth: 220, background: G.input, border: `1px solid ${G.divider}`, borderRadius: 7, color: G.text, padding: "9px 12px", fontSize: 12, outline: "none" }}>
              <option value="">All {filter.label === "Trainer" ? "trainers" : "customers"}</option>
              {filter.options.map((person) => <option key={person.id} value={person.id}>{fullName(person) !== "—" ? fullName(person) : person.name || person.email || person.id}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon="calendar" label="Total Sessions" value={filteredBookings.length} sub="All sessions" loading={sessionsLoading} />
        <StatCard icon="x-circle" label="Cancelled by Trainer" value={cancelledByTrainer} sub="Trainer cancellations" loading={sessionsLoading} />
        <StatCard icon="check-circle" label="Attended Sessions" value={attendedSessions} sub="Completed / attended" loading={sessionsLoading} />
        <StatCard icon="alert-circle" label="Reported Sessions" value={filteredReports.length} sub="Matching reports" loading={loading} />
      </div>

      <div role="tablist" aria-label="Session reports" style={{ display: "flex", gap: 8, borderBottom: `1px solid ${G.divider}`, marginBottom: 18 }}>
        {[{ id: "cancelled", label: "Cancelled Sessions" }, { id: "reported", label: "Reported Events" }].map((tab) => (
          <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? G.gold : "transparent"}`, color: activeTab === tab.id ? G.gold : G.muted, padding: "11px 16px", cursor: "pointer", fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 13 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "cancelled" && <>
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${G.divider}` }}>
          <h4 style={{ color: G.text, fontSize: 14, fontWeight: 700, margin: 0 }}>Cancelled Sessions ({cancelledSessionsTotal})</h4>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Booking ID", "Customer", "Trainer", "Date", "Time", "Reason", "Cancelled At"].map((heading) => <th key={heading} className="rp-th">{heading}</th>)}</tr></thead>
            <tbody>
              {sessionsLoading ? (
                <tr><td colSpan={7} className="rp-td" style={{ textAlign: "center", padding: "32px 0" }}><Spinner animation="border" size="sm" style={{ borderColor: G.gold, borderRightColor: "transparent" }} /></td></tr>
              ) : filteredCancelledSessions.length === 0 ? (
                <tr><td colSpan={7} className="rp-td" style={{ textAlign: "center", color: G.muted, padding: "32px 0" }}>No cancelled sessions found.</td></tr>
              ) : filteredCancelledSessions.map((session) => (
                <tr key={session.bookingId}>
                  <td className="rp-td" style={{ color: G.gold, fontWeight: 700 }}>{session.bookingId?.slice(-6)?.toUpperCase() || "—"}</td>
                  <td className="rp-td">{session.customer?.name || "—"}</td>
                  <td className="rp-td">{session.trainer?.name || "—"}</td>
                  <td className="rp-td" style={{ color: G.muted }}>{fmtDate(session.date)}</td>
                  <td className="rp-td">{session.slotTime || "—"}</td>
                  <td className="rp-td">{session.reason || "—"}</td>
                  <td className="rp-td" style={{ color: G.muted }}>{fmtDate(session.cancelledAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>}

      {activeTab === "reported" && <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "end" }}>
        {[
          { label: "Status", value: statusFilter, onChange: setStatusFilter, options: ["PENDING", "RESOLVED"] },
          { label: "Report Type", value: reportTypeFilter, onChange: setReportTypeFilter, options: ["CUSTOMER_REPORTED_TRAINER"] },
          { label: "Category", value: categoryFilter, onChange: setCategoryFilter, options: ["CONDUCT", "PERFORMANCE", "ATTENDANCE", "PAYMENT", "ACCOUNT", "OTHER"] },
        ].map((filter) => (
          <label key={filter.label} style={{ display: "flex", flexDirection: "column", gap: 6, color: G.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {filter.label}
            <select value={filter.value} onChange={(event) => { filter.onChange(event.target.value); setPage(1); }} style={{ minWidth: 170, background: G.input, border: `1px solid ${G.divider}`, borderRadius: 7, color: G.text, padding: "9px 12px", fontSize: 12, outline: "none" }}>
              <option value="">All</option>
              {filter.options.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}
            </select>
          </label>
        ))}
        {(statusFilter || categoryFilter || reportTypeFilter) && <button onClick={resetFilters} style={{ background: "transparent", border: `1px solid ${G.divider}`, color: "#f87171", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Clear</button>}
      </div>

      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Report ID", "Reported By", "Customer", "Trainer", "Reason", "Status", "Session Date", "Slot", "Reported At", "Action"].map((h) => <th key={h} className="rp-th">{h}</th>)}</tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="rp-td" style={{ textAlign: "center", padding: "40px 0" }}><Spinner animation="border" size="sm" style={{ borderColor: G.gold, borderRightColor: "transparent" }} /></td></tr>
              ) : visibleReports.length === 0 ? (
                <tr><td colSpan={10} className="rp-td" style={{ textAlign: "center", color: G.muted, padding: "40px 0" }}>No reported events found.</td></tr>
              ) : visibleReports.map((r, i) => (
                <tr key={r.id || i} className="rp-tr" onClick={() => openDetail(r)}>
                  <td className="rp-td" style={{ color: G.gold, fontWeight: 700 }}>{r.id?.slice(-6)?.toUpperCase()}</td>
                  <td className="rp-td">{fullName(getReporter(r))}</td>
                  <td className="rp-td">{fullName(r.customer)}</td>
                  <td className="rp-td">{fullName(r.trainer)}</td>
                  <td className="rp-td">{r.reason || "—"}</td>
                  <td className="rp-td"><Pill label={r.status} map={STATUS_MAP} /></td>
                  <td className="rp-td" style={{ color: G.muted }}>{fmtDate(r.booking?.timeSlot?.date || r.booking?.timeSlot?.startTime)}</td>
                  <td className="rp-td">{fmtSlot(r.booking?.timeSlot)}</td>
                  <td className="rp-td" style={{ color: G.muted }}>{fmtDate(r.createdAt)}</td>
                  <td className="rp-td">
                    <button aria-label={`View report ${r.id}`} onClick={(event) => { event.stopPropagation(); openDetail(r); }} style={{ background: G.goldFaint, border: `1px solid ${G.goldBorder}`, color: G.gold, width: 32, height: 30, borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="fe fe-eye" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} setPage={setPage} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} count={visibleReports.length} />
      </div>
      </>}

      <Modal show={!!selected} onHide={() => setSelected(null)} centered className="modal-gold" size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: G.goldLight, fontWeight: 700, fontSize: 16 }}>Reported Event — <span style={{ color: G.muted, fontWeight: 400 }}>{selected?.id?.slice(-6)?.toUpperCase()}</span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoBox title="Trainer" rows={[["Name", fullName(selected.trainer)], ["Email", selected.trainer?.email], ["Phone", selected.trainer?.phone]]} />
                <InfoBox title="Customer" rows={[["Name", fullName(selected.customer)], ["Email", selected.customer?.email], ["Phone", selected.customer?.phone]]} />
              </div>
              <InfoBox title="Report Details" rows={[
                ["Report Type", selected.reportType],
                ["Reason", selected.reason],
                ["Status", <Pill key="s" label={selected.status} map={STATUS_MAP} />],
                ["Booking ID", selected.bookingId],
                ["Session Date", fmtDate(selected.booking?.timeSlot?.date || selected.booking?.timeSlot?.startTime)],
                ["Slot", fmtSlot(selected.booking?.timeSlot)],
                ["Reported At", fmtDate(selected.createdAt)],
              ]} />
              {selected.description && <div style={{ background: G.input, border: `1px solid ${G.divider}`, borderRadius: 10, padding: 14 }}><p style={{ color: G.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Description</p><p style={{ color: G.text, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{selected.description}</p></div>}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setSelected(null)} style={{ background: "#2a2a2a", border: `1px solid ${G.divider}`, color: G.text, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Close</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}





