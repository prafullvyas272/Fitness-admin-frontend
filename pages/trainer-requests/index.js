import { useState, useEffect } from "react";
import { Table, Modal, Row, Col, Spinner } from "react-bootstrap";

const BASE_URL = "https://fitness-app-seven-beryl.vercel.app";

const G = {
  bg: "#111111", card: "#1a1a1a", gold: "#d4a017", goldLight: "#f5d76e",
  divider: "rgba(212,160,23,0.2)", text: "#f1f1f1", muted: "#888888", input: "#222222",
};

const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: { bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.3)", color: "#4ade80" },
    REJECTED: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", color: "#f87171" },
    PENDING:  { bg: "rgba(212,160,23,0.12)",  border: "rgba(212,160,23,0.3)",  color: "#f5d76e" },
  };
  const s = styles[status] || styles.PENDING;
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
      {status ? status.charAt(0) + status.slice(1).toLowerCase() : "Pending"}
    </span>
  );
};

export default function PTRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${BASE_URL}/api/customers/upt-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        console.error("Non-JSON response:", text.slice(0, 200)); return;
      }
      if (res.ok) {
        setRequests(data.data || []);
      } else {
        console.error("API error:", res.status, data?.message);
      }
    } catch (err) {
      console.error("Failed to fetch PT requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${BASE_URL}/api/customers/upt-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        if (selected?.id === id) setSelected((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter((r) => {
    const name = `${r.customer?.firstName} ${r.customer?.lastName}`.toLowerCase();
    const trainerName = `${r.trainer?.firstName} ${r.trainer?.lastName}`.toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      trainerName.includes(search.toLowerCase()) ||
      r.customer?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const filterBtns = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        table { background: ${G.card} !important; }
        .table-responsive { background: ${G.card} !important; }
        .pt-thead th { background: #1f1f1f !important; color: ${G.muted} !important; border-bottom: 2px solid ${G.divider} !important; font-size: 11px; letter-spacing: 0.8px; padding: 12px 16px; }
        .pt-tbody tr td { background: ${G.card} !important; color: ${G.text} !important; border-bottom: 1px solid ${G.divider} !important; padding: 14px 16px; vertical-align: middle; }
        .pt-tbody tr:hover td { background: #202020 !important; }
        .pt-inp { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px; outline: none; padding: 7px 12px; font-size: 13px; width: 100%; max-width: 320px; }
        .pt-inp::placeholder { color: #555 !important; }
        .pt-inp:focus { box-shadow: none !important; border-color: ${G.gold} !important; }
        .pt-pg .page-link { background: #1a1a1a !important; border-color: ${G.divider} !important; color: ${G.muted} !important; }
        .pt-pg .page-item.active .page-link { background: ${G.gold} !important; border-color: ${G.gold} !important; color: #111 !important; font-weight: 600; }
        .pt-pg .page-item.disabled .page-link { background: #161616 !important; color: #444 !important; }
        .pt-pg .page-link:hover { background: rgba(212,160,23,0.1) !important; color: ${G.goldLight} !important; }
        .modal-gold .modal-content { background: ${G.card}; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .modal-title { color: ${G.goldLight}; font-weight: 700; }
        .modal-gold .btn-close { filter: invert(1) brightness(0.6); }
        .modal-gold .modal-body { background: ${G.card} !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: G.goldLight, fontWeight: 700, margin: 0 }}>PT Requests</h3>
        <small style={{ color: G.muted }}>Manage customer requests for personal trainers</small>
      </div>

      {/* MAIN CARD */}
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 24 }}>

        {/* SEARCH + FILTER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <input
            className="pt-inp"
            placeholder="Search by customer, trainer or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {filterBtns.map((s) => {
              const isActive = filterStatus === s;
              const colors = {
                ALL:      { active: G.gold,    text: "#111" },
                PENDING:  { active: "#f5d76e", text: "#111" },
                APPROVED: { active: "#4ade80", text: "#111" },
                REJECTED: { active: "#f87171", text: "#111" },
              };
              return (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                  style={{
                    background: isActive ? colors[s].active : "transparent",
                    border: `1px solid ${isActive ? colors[s].active : G.divider}`,
                    color: isActive ? colors[s].text : G.muted,
                    padding: "5px 14px",
                    borderRadius: 8,
                    fontWeight: isActive ? 700 : 400,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* TABLE */}
        <Table responsive className="align-middle mb-0" style={{ minWidth: 800 }}>
          <thead className="pt-thead">
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>CUSTOMER</th>
              <th>TRAINER</th>
              <th>MESSAGE</th>
              <th>DATE</th>
              <th className="text-center">STATUS</th>
              <th className="text-end">ACTION</th>
            </tr>
          </thead>
          <tbody className="pt-tbody">
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: G.muted }}>
                  <Spinner animation="border" size="sm" className="me-2" style={{ borderColor: G.gold, borderRightColor: "transparent" }} />
                  Loading requests...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: G.muted }}>
                  No PT requests found
                </td>
              </tr>
            ) : (
              paginated.map((req, idx) => (
                <tr key={req.id}>
                  <td style={{ color: G.muted, fontSize: 13 }}>
                    {(currentPage - 1) * entriesPerPage + idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.customer?.firstName} {req.customer?.lastName}</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>{req.customer?.email}</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>{req.customer?.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.trainer?.firstName} {req.trainer?.lastName}</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>{req.trainer?.email}</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>{req.trainer?.phone}</div>
                  </td>
                  <td style={{ maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: G.muted, fontSize: 13 }}>
                    {req.message || "—"}
                  </td>
                  <td style={{ fontSize: 13, color: G.muted, whiteSpace: "nowrap" }}>
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "—"}
                  </td>
                  <td className="text-center">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="text-end">
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => { setSelected(req); setShowModal(true); }}
                        style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                      >
                        View
                      </button>
                      {req.status === "PENDING" && (
                        <>
                          <button
                            disabled={actionLoading === req.id + "APPROVED"}
                            onClick={() => handleAction(req.id, "APPROVED")}
                            style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                          >
                            {actionLoading === req.id + "APPROVED" ? <Spinner animation="border" size="sm" /> : "Approve"}
                          </button>
                          <button
                            disabled={actionLoading === req.id + "REJECTED"}
                            onClick={() => handleAction(req.id, "REJECTED")}
                            style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                          >
                            {actionLoading === req.id + "REJECTED" ? <Spinner animation="border" size="sm" /> : "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* PAGINATION */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
            <span style={{ color: G.muted, fontSize: 13 }}>
              Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
              {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries
            </span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[
                { label: "Previous", page: currentPage - 1, disabled: currentPage === 1 },
                ...[...Array(totalPages)].map((_, i) => ({ label: i + 1, page: i + 1, disabled: false })),
                { label: "Next", page: currentPage + 1, disabled: currentPage === totalPages || totalPages === 0 },
              ].map((btn, i) => {
                const isActive = btn.label === currentPage;
                return (
                  <button key={i} disabled={btn.disabled}
                    onClick={() => !btn.disabled && setCurrentPage(btn.page)}
                    style={{
                      padding: "5px 12px", borderRadius: 6, fontSize: 13,
                      cursor: btn.disabled ? "not-allowed" : "pointer",
                      fontWeight: isActive ? 700 : 400,
                      border: `1px solid ${G.divider}`,
                      background: isActive ? G.gold : "#1a1a1a",
                      color: btn.disabled ? "#444" : isActive ? "#111" : G.goldLight,
                      opacity: btn.disabled ? 0.5 : 1,
                      transition: "all 0.15s ease",
                    }}>
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="modal-gold">
        <Modal.Header closeButton>
          <Modal.Title>PT Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <Row>
              <Col md={6}>
                <div style={{ color: G.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Customer</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div><span style={{ color: G.muted, fontSize: 13 }}>Name: </span><span style={{ color: G.text, fontWeight: 600 }}>{selected.customer?.firstName} {selected.customer?.lastName}</span></div>
                  <div><span style={{ color: G.muted, fontSize: 13 }}>Email: </span><span style={{ color: G.text }}>{selected.customer?.email}</span></div>
                  <div><span style={{ color: G.muted, fontSize: 13 }}>Phone: </span><span style={{ color: G.text }}>{selected.customer?.phone}</span></div>
                </div>
              </Col>
              <Col md={6}>
                <div style={{ color: G.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Requested Trainer</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div><span style={{ color: G.muted, fontSize: 13 }}>Name: </span><span style={{ color: G.text, fontWeight: 600 }}>{selected.trainer?.firstName} {selected.trainer?.lastName}</span></div>
                  <div><span style={{ color: G.muted, fontSize: 13 }}>Email: </span><span style={{ color: G.text }}>{selected.trainer?.email}</span></div>
                  <div><span style={{ color: G.muted, fontSize: 13 }}>Phone: </span><span style={{ color: G.text }}>{selected.trainer?.phone}</span></div>
                </div>
              </Col>
              <Col xs={12} style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${G.divider}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: G.muted, fontSize: 13 }}>Status: </span>
                    <StatusBadge status={selected.status} />
                  </div>
                  {selected.message && (
                    <div><span style={{ color: G.muted, fontSize: 13 }}>Message: </span><span style={{ color: G.text }}>{selected.message}</span></div>
                  )}
                  {selected.createdAt && (
                    <div><span style={{ color: G.muted, fontSize: 13 }}>Requested On: </span><span style={{ color: G.text }}>{new Date(selected.createdAt).toLocaleString("en-IN")}</span></div>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => setShowModal(false)}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Close
          </button>
          {selected?.status === "PENDING" && (
            <>
              <button
                disabled={actionLoading === selected.id + "REJECTED"}
                onClick={() => handleAction(selected.id, "REJECTED")}
                style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "6px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
              >
                {actionLoading === selected.id + "REJECTED" ? <Spinner animation="border" size="sm" /> : "Reject"}
              </button>
              <button
                disabled={actionLoading === selected.id + "APPROVED"}
                onClick={() => handleAction(selected.id, "APPROVED")}
                style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "6px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
              >
                {actionLoading === selected.id + "APPROVED" ? <Spinner animation="border" size="sm" /> : "Approve"}
              </button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
