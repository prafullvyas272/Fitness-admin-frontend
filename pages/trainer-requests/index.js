import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Badge,
  Row,
  Col,
  Form,
  Spinner,
} from "react-bootstrap";

const BASE_URL = "https://fitness-app-seven-beryl.vercel.app";

const statusBadge = (status) => {
  if (status === "APPROVED") return <Badge bg="success">Approved</Badge>;
  if (status === "REJECTED") return <Badge bg="danger">Rejected</Badge>;
  return <Badge bg="warning" text="dark">Pending</Badge>;
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
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text.slice(0, 200));
        return;
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      const token = localStorage.getItem("adminToken");
      const url = `${BASE_URL}/api/customers/upt-requests/${id}/status`;
      console.log("PATCH →", url, { status });
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        if (selected?.id === id) setSelected((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter((r) => {
    const name =
      `${r.customer?.firstName} ${r.customer?.lastName}`.toLowerCase();
    const trainerName =
      `${r.trainer?.firstName} ${r.trainer?.lastName}`.toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      trainerName.includes(search.toLowerCase()) ||
      r.customer?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "ALL" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="p-4">
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-1">PT Requests</h3>
          <small className="text-muted">
            Manage customer requests for personal trainers
          </small>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>
          {/* Search + Filter */}
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <Form.Control
                placeholder="Search by customer, trainer or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                size="sm"
                style={{ maxWidth: 320 }}
              />
            </Col>
            <Col md={6} className="text-end d-flex justify-content-end gap-2">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={filterStatus === s ? "primary" : "outline-secondary"}
                  onClick={() => {
                    setFilterStatus(s);
                    setCurrentPage(1);
                  }}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </Button>
              ))}
            </Col>
          </Row>

          {/* Table */}
          <Table responsive hover className="align-middle">
            <thead className="bg-light">
              <tr className="text-muted text-uppercase small">
                <th>#</th>
                <th>Customer</th>
                <th>Customer Contact</th>
                <th>Trainer</th>
                <th>Trainer Contact</th>
                <th>Message</th>
                <th>Date</th>
                <th className="text-center">Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading requests...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted fw-semibold">
                    No PT requests found
                  </td>
                </tr>
              ) : (
                paginated.map((req, idx) => (
                  <tr key={req.id}>
                    <td className="text-muted small">
                      {(currentPage - 1) * entriesPerPage + idx + 1}
                    </td>
                    <td className="fw-semibold text-dark">
                      {req.customer?.firstName} {req.customer?.lastName}
                    </td>
                    <td>
                      <div className="small text-muted">{req.customer?.email}</div>
                      <div className="small text-muted">{req.customer?.phone}</div>
                    </td>
                    <td className="fw-semibold">
                      {req.trainer?.firstName} {req.trainer?.lastName}
                    </td>
                    <td>
                      <div className="small text-muted">{req.trainer?.email}</div>
                      <div className="small text-muted">{req.trainer?.phone}</div>
                    </td>
                    <td
                      className="text-muted small"
                      style={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {req.message || "—"}
                    </td>
                    <td className="small text-muted">
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="text-center">{statusBadge(req.status)}</td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setSelected(req);
                            setShowModal(true);
                          }}
                        >
                          View
                        </Button>
                        {req.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              disabled={actionLoading === req.id + "APPROVED"}
                              onClick={() => handleAction(req.id, "APPROVED")}
                            >
                              {actionLoading === req.id + "APPROVED" ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                "Approve"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={actionLoading === req.id + "REJECTED"}
                              onClick={() => handleAction(req.id, "REJECTED")}
                            >
                              {actionLoading === req.id + "REJECTED" ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                "Reject"
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <Row className="mt-3 align-items-center">
              <Col md={6} className="text-muted small">
                Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                {Math.min(currentPage * entriesPerPage, filtered.length)} of{" "}
                {filtered.length} entries
              </Col>
              <Col md={6} className="text-end">
                <nav>
                  <ul className="pagination pagination-sm justify-content-end mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>PT Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <Row>
              <Col md={6}>
                <h6 className="fw-bold text-muted text-uppercase small mb-3">
                  Customer
                </h6>
                <p className="mb-1">
                  <strong>Name:</strong> {selected.customer?.firstName}{" "}
                  {selected.customer?.lastName}
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> {selected.customer?.email}
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong> {selected.customer?.phone}
                </p>
              </Col>
              <Col md={6}>
                <h6 className="fw-bold text-muted text-uppercase small mb-3">
                  Requested Trainer
                </h6>
                <p className="mb-1">
                  <strong>Name:</strong> {selected.trainer?.firstName}{" "}
                  {selected.trainer?.lastName}
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> {selected.trainer?.email}
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong> {selected.trainer?.phone}
                </p>
              </Col>
              <Col xs={12} className="mt-3">
                <p className="mb-1">
                  <strong>Status:</strong> {statusBadge(selected.status)}
                </p>
                {selected.message && (
                  <p className="mb-1">
                    <strong>Message:</strong> {selected.message}
                  </p>
                )}
                {selected.createdAt && (
                  <p className="mb-1">
                    <strong>Requested On:</strong>{" "}
                    {new Date(selected.createdAt).toLocaleString("en-IN")}
                  </p>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selected?.status === "PENDING" && (
            <>
              <Button
                variant="danger"
                disabled={actionLoading === selected.id + "REJECTED"}
                onClick={() => handleAction(selected.id, "REJECTED")}
              >
                {actionLoading === selected.id + "REJECTED" ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Reject"
                )}
              </Button>
              <Button
                variant="success"
                disabled={actionLoading === selected.id + "APPROVED"}
                onClick={() => handleAction(selected.id, "APPROVED")}
              >
                {actionLoading === selected.id + "APPROVED" ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Approve"
                )}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
