import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Table,
  Dropdown,
  Card,
  Row,
  Col,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrainers,
  removeTrainer,
  updateTrainerStatusRedux,
  updateTrainerAssignedCustomers,
} from "../redux/slices/trainerSlice";



export default function Trainers() {
  const router = useRouter();

  const dispatch = useDispatch();

const { trainers, loading } = useSelector(
  (state) => state.trainers
);


  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);


  //Assign trainer 
const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedTrainerId, setSelectedTrainerId] = useState(null);
const [customers, setCustomers] = useState([]);
const [selectedCustomers, setSelectedCustomers] = useState([]);
const [customerSearch, setCustomerSearch] = useState("");

const [assignLoading, setAssignLoading] = useState(false);

  // ================= PAGINATION =================
const [currentPage, setCurrentPage] = useState(1);
const [entriesPerPage, setEntriesPerPage] = useState(10);


useEffect(() => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    router.push("/login");
    return;
  }

  // ✅ Only fetch if trainers not already in Redux
  if (trainers.length === 0) {
    dispatch(fetchTrainers());
  }

}, [dispatch, trainers.length, router]);






const updateTrainerStatus = async (id, newStatus) => {
  try {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}/toggle-active`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newStatus === "Active",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Status update failed");
    }

    // 🔥 Update UI instantly
   dispatch(
  updateTrainerStatusRedux({
    id,
    isActive: newStatus === "Active",
  })
);


  } catch (error) {
    console.error("Toggle Error:", error.message);
    alert(error.message);
  }
};


const [isDeleteSelected, setIsDeleteSelected] = useState(false);


const handleDelete = async (id) => {
  if (!confirm("Delete this trainer?")) return;

  try {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Delete failed");
    }

    dispatch(removeTrainer(id));

  } catch (error) {
    alert(error.message);
  }
};


  const filteredTrainers = trainers.filter((trainer) => {
    const fullName =
      `${trainer.firstName} ${trainer.lastName}`.toLowerCase();

    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      trainer.email.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
  filterStatus === "All" ||
  (trainer.isActive ? "Active" : "Inactive") === filterStatus;


    return matchesSearch && matchesFilter;
  });
  // ================= PAGINATION LOGIC =================
const indexOfLastTrainer = currentPage * entriesPerPage;
const indexOfFirstTrainer = indexOfLastTrainer - entriesPerPage;

const currentTrainers = filteredTrainers.slice(
  indexOfFirstTrainer,
  indexOfLastTrainer
);

const totalPages = Math.ceil(
  filteredTrainers.length / entriesPerPage
);


  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

    // OPEN ASSIGN MODAL
const openAssignModal = async (trainerId) => {
  setSelectedTrainerId(trainerId);
  setShowAssignModal(true);
  setAssignLoading(true);

  try {
    const token = localStorage.getItem("adminToken");

    // 1 Fetch all customers
    const customerRes = await fetch(
      "https://fitness-app-seven-beryl.vercel.app/api/customers",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const customerData = await customerRes.json();
    const allCustomers = customerData.data || [];
    setCustomers(allCustomers);

    // 2 Get trainer directly from Redux
  // 2 Fetch trainer fresh from API
const trainerRes = await fetch(
  `https://fitness-app-seven-beryl.vercel.app/api/trainers/${trainerId}/profile`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const trainerData = await trainerRes.json();
const trainerDetail = trainerData.data || trainerData;


console.log("trainerDetail keys:", Object.keys(trainerDetail));
console.log("assignedCustomers:", trainerDetail?.assignedCustomers);
console.log("assignedCustomersAsTrainer:", trainerDetail?.assignedCustomersAsTrainer);


const assignedIds =
  trainerDetail?.assignedCustomersAsTrainer?.map(
    (item) => String(item.customerId)
  ) || [];

    // 3 Pre-select
    setSelectedCustomers(assignedIds);
  } catch (err) {
    console.error(err);
  } finally {
    setAssignLoading(false);
  }
};
// ASSIGN CUSTOMERS
const handleAssignCustomers = async () => {
  if (selectedCustomers.length === 0) {
    alert("Select customers first");
    return;
  }

  try {
    const token = localStorage.getItem("adminToken");

    // selectedCustomers contains customer.id values
    for (const selectedCustomerId of selectedCustomers) {
      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/assign-customer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trainerId: selectedTrainerId,
            customerId: selectedCustomerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Assignment failed for one customer");
      }
    }

    alert("Customers assigned successfully ✅");

    selectedCustomers.forEach((customerId) => {
  dispatch(updateTrainerAssignedCustomers({
    trainerId: selectedTrainerId,
    customerId,
  }));
});

    setShowAssignModal(false);
    setSelectedCustomers([]);

  } catch (err) {
    alert(err.message);
  }
};

const handleBulkDelete = async () => {
  if (selectedIds.length === 0) {
    alert("Select trainers first");
    return;
  }

  if (!confirm("Delete selected trainers?")) return;

  setBulkDeleteLoading(true); // 👈 start loader

  try {
    const token = localStorage.getItem("adminToken");

    const results = await Promise.all(
      selectedIds.map((id) =>
        fetch(
          `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || `Failed to delete trainer ${id}`);
          }
          return id;
        })
      )
    );

    results.forEach((id) => dispatch(removeTrainer(id)));
    setSelectedIds([]);
    setSelectionMode(false);
    alert("Deleted successfully ✅");

  } catch (err) {
    console.error("Bulk delete error:", err.message);
    alert(`Delete failed: ${err.message}`);
    dispatch(fetchTrainers());
  } finally {
    setBulkDeleteLoading(false); // 👈 stop loader
  }
};

const filteredCustomers = customers.filter((customer) => {
  const fullName =
    `${customer.firstName} ${customer.lastName}`.toLowerCase();

  return fullName.includes(customerSearch.toLowerCase());
});

  const G = {
    bg:         "#111111",
    card:       "#1a1a1a",
    cardBorder: "1px solid rgba(212,160,23,0.25)",
    gold:       "#d4a017",
    goldLight:  "#f5d76e",
    goldFaint:  "rgba(212,160,23,0.08)",
    text:       "#f1f1f1",
    muted:      "#888888",
    rowHover:   "rgba(212,160,23,0.06)",
    divider:    "rgba(212,160,23,0.15)",
    input:      "#222222",
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: "24px" }}>
      <style>{`
        .tr-gold td { background: ${G.card} !important; border-bottom: 1px solid ${G.divider} !important; color: ${G.text} !important; }
        .tr-gold:hover td { background: ${G.rowHover} !important; }
        table { background: ${G.card} !important; }
        .table-responsive { background: ${G.card} !important; }
        tbody tr td { background: ${G.card} !important; color: ${G.text} !important; border-color: ${G.divider} !important; }
        .th-gold { background: #161616 !important; color: ${G.goldLight} !important; border-bottom: 2px solid ${G.divider} !important; font-size: 11px; letter-spacing: 0.8px; }
        .pg-gold .page-link { background: #1a1a1a; border-color: ${G.divider}; color: ${G.goldLight}; }
        .pg-gold .page-link:hover { background: ${G.goldFaint}; color: ${G.gold}; }
        .pg-gold .page-item.active .page-link { background: ${G.gold}; border-color: ${G.gold}; color: #111; font-weight: 700; }
        .pg-gold .page-item.disabled .page-link { background: #161616; color: #444; border-color: ${G.divider}; }
        .inp-gold { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px !important; }
        .inp-gold::placeholder { color: #555 !important; }
        .inp-gold:focus { border-color: ${G.gold} !important; box-shadow: 0 0 0 3px rgba(212,160,23,0.15) !important; outline: none !important; }
        .inp-gold option { background: #1a1a1a; color: ${G.text}; }
        .ddm-gold { background: #1e1e1e !important; border: 1px solid ${G.divider} !important; }
        .ddm-gold .dropdown-item { color: ${G.text} !important; font-size: 13px; }
        .ddm-gold .dropdown-item:hover { background: ${G.goldFaint} !important; color: ${G.goldLight} !important; }
        .ddm-gold .dropdown-divider { border-color: ${G.divider} !important; }
        .modal-gold .modal-content { background: #1a1a1a; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .btn-close { filter: invert(1); }
        .modal-gold .modal-body { background: #1a1a1a !important; }
        .modal-gold .form-check-label { color: ${G.text}; }
      `}</style>

      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 2 }}>All Trainers</h3>
          <small style={{ color: G.muted }}>Manage all trainers</small>
        </Col>

        <Col className="text-end d-flex justify-content-end gap-2">

          {/* FILTER */}
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              style={{
                width: 42, height: 42, background: "#1a1a1a",
                border: `1px solid ${G.divider}`, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <i className="fe fe-filter" style={{ color: G.goldLight }}></i>
            </Dropdown.Toggle>
            <Dropdown.Menu className="ddm-gold shadow p-2">
              <Dropdown.Item onClick={() => { setFilterStatus("All"); setCurrentPage(1); }}>
                <span className="filter-dot filter-all me-2"></span>All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => { setFilterStatus("Active"); setCurrentPage(1); }}>
                <span className="filter-dot filter-active me-2"></span>Active
              </Dropdown.Item>
              <Dropdown.Item onClick={() => { setFilterStatus("Inactive"); setCurrentPage(1); }}>
                <span className="filter-dot filter-inactive me-2"></span>Inactive
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* TRASH TOGGLE */}
          <button
            onClick={() => { setSelectionMode(!selectionMode); setSelectedIds([]); }}
            style={{
              width: 42, height: 42, borderRadius: 8, cursor: "pointer",
              background: selectionMode ? "rgba(212,160,23,0.15)" : "#1a1a1a",
              border: selectionMode ? `1px solid ${G.gold}` : `1px solid ${G.divider}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <i className="fe fe-trash" style={{ color: selectionMode ? G.goldLight : G.muted }}></i>
          </button>

          {/* CREATE */}
          <Link href="/trainers/create">
            <button style={{
              background: `linear-gradient(135deg, ${G.gold}, #b8860b)`,
              color: "#111", border: "none", padding: "0 20px", height: 42,
              borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(212,160,23,0.3)",
            }}>
              + Create Trainer
            </button>
          </Link>
        </Col>
      </Row>

      {/* CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, overflow: "visible" }}>
        <div style={{ padding: "20px 24px" }}>

          <Row className="mb-3 align-items-center">
            <Col md={6} className="d-flex align-items-center gap-2">
              <span style={{ color: G.muted, fontSize: 13 }}>Show</span>
              <select
                className="inp-gold"
                style={{ width: 80, padding: "4px 8px", fontSize: 13 }}
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span style={{ color: G.muted, fontSize: 13 }}>entries</span>
            </Col>
            <Col md={6} className="text-end">
              <input
                className="inp-gold"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ width: 220, padding: "6px 12px", fontSize: 13 }}
              />
            </Col>
          </Row>

          {selectionMode && selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="mb-3"
              style={{
                background: "#7f1d1d", border: "1px solid #ef4444", color: "#fca5a5",
                padding: "6px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {bulkDeleteLoading ? (
                <><span className="spinner-border spinner-border-sm"></span> Deleting...</>
              ) : `Delete Selected (${selectedIds.length})`}
            </button>
          )}

          <Table responsive className="align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                {selectionMode && <th className="th-gold" style={{ padding: "12px 16px" }}></th>}
                <th className="th-gold" style={{ padding: "12px 16px" }}>NAME</th>
                <th className="th-gold" style={{ padding: "12px 16px" }}>EMAIL</th>
                <th className="th-gold" style={{ padding: "12px 16px" }}>PHONE</th>
                <th className="th-gold" style={{ padding: "12px 16px" }}>HOST GYM</th>
                <th className="th-gold" style={{ padding: "12px 16px" }}>GENDER</th>
                <th className="th-gold text-center" style={{ padding: "12px 16px" }}>STATUS</th>
                {!selectionMode && <th className="th-gold text-end" style={{ padding: "12px 16px" }}>ACTION</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={selectionMode ? 8 : 7} className="text-center py-5" style={{ color: G.muted }}>
                    <span className="spinner-border spinner-border-sm me-2" style={{ color: G.gold }}></span>
                    Loading trainers...
                  </td>
                </tr>
              ) : currentTrainers.length === 0 ? (
                <tr>
                  <td colSpan={selectionMode ? 7 : 6} className="text-center py-5" style={{ color: G.muted }}>
                    No trainer found
                  </td>
                </tr>
              ) : (
                currentTrainers.map((trainer) => (
                  <tr key={trainer.id} className="tr-gold">
                    {selectionMode && (
                      <td style={{ padding: "14px 16px" }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedIds.includes(trainer.id)}
                          onChange={() => {
                            if (selectedIds.includes(trainer.id)) {
                              setSelectedIds(selectedIds.filter((id) => id !== trainer.id));
                            } else {
                              setSelectedIds([...selectedIds, trainer.id]);
                            }
                          }}
                        />
                      </td>
                    )}
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{trainer.firstName} {trainer.lastName}</td>
                    <td style={{ padding: "14px 16px", color: G.muted, fontSize: 13 }}>{trainer.email}</td>
                    <td style={{ padding: "14px 16px", color: G.muted, fontSize: 13 }}>{trainer.phone}</td>
                    <td style={{ padding: "14px 16px", color: G.muted, fontSize: 13 }}>{trainer.userProfileDetails?.hostGymName || "N/A"}</td>
                    <td style={{ padding: "14px 16px", color: G.muted, fontSize: 13, textTransform: "capitalize" }}>{trainer.gender || "N/A"}</td>

                    <td className="text-center" style={{ padding: "14px 16px" }}>
                      <Dropdown>
                        <Dropdown.Toggle
                          as="button"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            cursor: "pointer", border: "none",
                            background: trainer.isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                            color: trainer.isActive ? "#4ade80" : "#f87171",
                          }}
                        >
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: trainer.isActive ? "#4ade80" : "#f87171",
                          }}></span>
                          {trainer.isActive ? "Active" : "Inactive"}
                          <i className="fe fe-chevron-down" style={{ fontSize: 10 }}></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="ddm-gold shadow">
                          <Dropdown.Item onClick={() => updateTrainerStatus(trainer.id, "Active")}>
                            <span style={{ color: "#4ade80", marginRight: 8 }}>●</span>Active
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => updateTrainerStatus(trainer.id, "Inactive")}>
                            <span style={{ color: "#f87171", marginRight: 8 }}>●</span>Inactive
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>

                    {!selectionMode && (
                      <td className="text-end" style={{ padding: "14px 16px" }}>
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            as="button"
                            style={{
                              background: "transparent", border: `1px solid ${G.divider}`,
                              borderRadius: 6, width: 32, height: 32,
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <i className="fe fe-more-vertical" style={{ color: G.goldLight }}></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="ddm-gold shadow">
                            <Dropdown.Item onClick={() => router.push(`/trainers/view/${trainer.id}`)}>
                              <i className="fe fe-eye me-2" style={{ color: G.muted }}></i>View
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => router.push(`/trainers/edit/${trainer.id}`)}>
                              <i className="fe fe-edit me-2" style={{ color: G.muted }}></i>Edit
                            </Dropdown.Item>
                            {trainer.isActive && (
                              <Dropdown.Item onClick={() => openAssignModal(trainer.id)}>
                                <i className="fe fe-users me-2" style={{ color: G.gold }}></i>Assign Customers
                              </Dropdown.Item>
                            )}
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => handleDelete(trainer.id)} style={{ color: "#f87171 !important" }}>
                              <i className="fe fe-trash me-2" style={{ color: "#f87171" }}></i>Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* PAGINATION */}
          <Row className="mt-4 align-items-center">
            <Col md={6} style={{ color: G.muted, fontSize: 13 }}>
              Showing {filteredTrainers.length === 0 ? 0 : indexOfFirstTrainer + 1} to{" "}
              {Math.min(indexOfLastTrainer, filteredTrainers.length)} of{" "}
              {filteredTrainers.length} entries
            </Col>
            <Col md={6} className="text-end">
              <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "flex-end" }}>
                {[
                  { label: "Previous", page: currentPage - 1, disabled: currentPage === 1 },
                  ...[...Array(totalPages)].map((_, i) => ({ label: i + 1, page: i + 1, disabled: false })),
                  { label: "Next", page: currentPage + 1, disabled: currentPage === totalPages || totalPages === 0 },
                ].map((btn, i) => {
                  const isActive = btn.label === currentPage;
                  return (
                    <button
                      key={i}
                      disabled={btn.disabled}
                      onClick={() => !btn.disabled && setCurrentPage(btn.page)}
                      style={{
                        padding: "5px 12px", borderRadius: 6, fontSize: 13, cursor: btn.disabled ? "not-allowed" : "pointer",
                        fontWeight: isActive ? 700 : 400, border: `1px solid ${G.divider}`,
                        background: isActive ? G.gold : "#1a1a1a",
                        color: btn.disabled ? "#444" : isActive ? "#111" : G.goldLight,
                        opacity: btn.disabled ? 0.5 : 1,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </Col>
          </Row>

        </div>

        {/* ASSIGN MODAL */}
        <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered className="modal-gold">
          <Modal.Header closeButton>
            <Modal.Title style={{ color: G.goldLight, fontWeight: 700 }}>Assign Customers</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              className="inp-gold"
              type="text"
              placeholder="Search customers..."
              style={{ width: "100%", padding: "8px 12px", marginBottom: 12, fontSize: 13 }}
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <div style={{ maxHeight: 250, overflowY: "auto" }}>
              {assignLoading ? (
                <p className="text-center py-3" style={{ color: G.muted }}>Loading customers...</p>
              ) : filteredCustomers.length === 0 ? (
                <p className="text-center py-3" style={{ color: G.muted }}>No customers found</p>
              ) : filteredCustomers.map((customer) => (
                <Form.Check
                  key={customer.id}
                  type="checkbox"
                  label={
                    <span style={{ color: G.text }}>
                      {customer.firstName} {customer.lastName}
                      <br />
                      <small style={{ color: G.muted }}>{customer.email}</small>
                    </span>
                  }
                  value={customer.id}
                  checked={selectedCustomers.includes(String(customer.id))}
                  onChange={(e) => {
                    const id = String(customer.id);
                    if (e.target.checked) {
                      setSelectedCustomers([...selectedCustomers, id]);
                    } else {
                      setSelectedCustomers(selectedCustomers.filter((sid) => sid !== id));
                    }
                  }}
                  className="mb-2"
                />
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={() => setShowAssignModal(false)}
              style={{
                background: "#2a2a2a", border: `1px solid ${G.divider}`, color: G.text,
                padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13,
              }}
            >Cancel</button>
            <button
              onClick={handleAssignCustomers}
              style={{
                background: `linear-gradient(135deg, ${G.gold}, #b8860b)`,
                border: "none", color: "#111", padding: "8px 18px",
                borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13,
              }}
            >Assign Selected</button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* BULK DELETE LOADER */}
      {bulkDeleteLoading && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)",
          zIndex: 9999, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            border: `5px solid rgba(212,160,23,0.2)`,
            borderTop: `5px solid ${G.gold}`,
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: G.goldLight, fontWeight: 600, fontSize: 15, margin: 0 }}>
            Deleting trainers...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
