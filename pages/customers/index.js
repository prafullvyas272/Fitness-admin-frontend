import { useState, useEffect } from "react";
import { Table, Modal, Dropdown, Form } from "react-bootstrap";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  deleteCustomer,
  toggleCustomerStatus,
  assignTrainer,
} from "../../redux/slices/customerSlice";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  divider: "#1e1e1e", text: "#ffffff", muted: "#888888", input: "#111111",
  cardBorder: "1px solid #1e1e1e", rowHover: "#111111",
};

export default function AllCustomers() {

  const [trainers, setTrainers] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const dispatch = useDispatch();
  const { customers, loading } = useSelector((state) => state.customers);

  const [trainerSearch, setTrainerSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    const fetchTrainers = async () => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/trainers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) setTrainers(data.data);
    };
    fetchTrainers();
  }, []);

  const handleView = (customer) => {
    router.push(`/customers/${customer.id}`);
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    const confirmDelete = confirm("Are you sure you want to delete selected customers?");
    if (!confirmDelete) return;
    setBulkDeleteLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const results = await Promise.all(
        selectedCustomers.map((id) =>
          fetch(`https://fitness-app-seven-beryl.vercel.app/api/customers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `Failed to delete customer ${id}`);
            return id;
          })
        )
      );
      results.forEach((id) => {
        dispatch({ type: "customers/deleteCustomer/fulfilled", payload: id });
      });
      setSelectedCustomers([]);
      setBulkMode(false);
      alert("Deleted successfully ✅");
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleEditOpen = (customer) => {
    router.push(`/customers/create?id=${customer.id}`);
  };

  const handleRemoveTrainer = async (customer) => {
    const assignedTrainer = trainers.find((trainer) =>
      trainer.assignedCustomers?.some((item) => item.customerId === customer.id)
    );
    if (!assignedTrainer) { alert("No trainer assigned to this customer."); return; }
    if (!confirm(`Remove ${assignedTrainer.firstName} ${assignedTrainer.lastName} from this customer?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/unassign-customer/${customer.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ trainerId: assignedTrainer.id }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      dispatch(fetchCustomers());
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignOpen = (customer) => {
    setSelectedCustomer(customer);
    const assignedTrainer = trainers.find((trainer) =>
      trainer.assignedCustomers?.some((item) => item.customerId === customer.id)
    );
    setSelectedTrainer(assignedTrainer ? assignedTrainer.id : "");
    setShowAssign(true);
  };

  const handleAssignSave = async () => {
    await dispatch(assignTrainer({ trainerId: selectedTrainer, customerId: selectedCustomer.id }));
    setShowAssign(false);
  };

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase());
    let matchesFilter = true;
    if (filterType === "Active") matchesFilter = customer.isActive === true;
    if (filterType === "Inactive") matchesFilter = customer.isActive === false;
    if (filterType === "Premium") matchesFilter = customer.plan === "Premium";
    if (filterType === "Free") matchesFilter = customer.plan === "Free";
    return matchesSearch && matchesFilter;
  });

  const indexOfLastCustomer = currentPage * entriesPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - entriesPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / entriesPerPage);

  const filteredTrainers = trainers
    .filter((trainer) =>
      `${trainer.firstName} ${trainer.lastName}`.toLowerCase().includes(trainerSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (a.id === selectedTrainer) return -1;
      if (b.id === selectedTrainer) return 1;
      return 0;
    });

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        table { background: ${G.card} !important; }
        .table-responsive { background: ${G.card} !important; }
        .cu-thead th { background: #111111 !important; color: rgba(248,227,150,0.6) !important; border-bottom: 1px solid ${G.divider} !important; font-size: 10px !important; letter-spacing: 1.2px !important; padding: 12px 16px !important; font-weight: 700 !important; }
        .cu-tbody tr td { background: ${G.card} !important; color: #cccccc !important; border-bottom: 1px solid #141414 !important; padding: 14px 16px !important; vertical-align: middle; font-size: 12px !important; font-weight: 600 !important; line-height: 1.4 !important; font-family: Montserrat, Arial, sans-serif !important; }
        .cu-tbody tr:hover td { background: #111111 !important; }
        .cu-inp { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: #cccccc !important; border-radius: 7px; }
        .cu-inp:focus { background: ${G.input} !important; color: #cccccc !important; box-shadow: none !important; border-color: rgba(248,227,150,0.25) !important; }
        .cu-inp::placeholder { color: #2a2a2a !important; }
        .cu-inp option { background: #111111; }
        .cu-ddm { background: #0d0d0d !important; border: 1px solid ${G.divider} !important; }
        .cu-ddm .dropdown-item { color: ${G.text} !important; font-size: 13px; }
        .cu-ddm .dropdown-item:hover { background: #111111 !important; color: ${G.goldLight} !important; }
        .cu-ddm .dropdown-item.active, .cu-ddm .dropdown-item:active { background: #111111 !important; color: ${G.goldLight} !important; }
        .cu-ddm .dropdown-divider { border-color: ${G.divider} !important; }
        .cu-tbody .status-pill { background: transparent !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; }
        .cu-tbody .status-pill .fw-semibold { color: ${G.text} !important; }
        .cu-pg .page-link { background: transparent !important; border-color: #2a2a2a !important; color: #888888 !important; }
        .cu-pg .page-item.active .page-link { background: ${G.gold} !important; border-color: ${G.gold} !important; color: #000 !important; font-weight: 700; }
        .cu-pg .page-item.disabled .page-link { background: transparent !important; color: #444 !important; }
        .cu-pg .page-link:hover { border-color: ${G.gold} !important; color: ${G.gold} !important; }
        .modal-gold .modal-content { background: ${G.card}; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .modal-title { color: ${G.goldLight}; font-weight: 700; }
        .modal-gold .btn-close { filter: invert(1) brightness(0.6); }
        .modal-gold .modal-body { background: ${G.card} !important; }
        .modal-gold .form-control { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; }
        .modal-gold .form-control:focus { background: ${G.input} !important; box-shadow: none !important; }
        .modal-gold .form-control::placeholder { color: #555 !important; }
        .modal-gold .form-check-label { color: ${G.text}; }
        .modal-gold .form-check-input { background-color: #333; border-color: ${G.divider}; }
        @keyframes cu-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* BULK DELETE LOADER */}
      {bulkDeleteLoading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, border: "5px solid #333", borderTop: `5px solid ${G.gold}`, borderRadius: "50%", animation: "cu-spin 0.8s linear infinite" }} />
          <p style={{ color: G.text, fontWeight: 600, fontSize: 15, margin: 0 }}>Deleting customers...</p>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h3 style={{ color: G.text, fontWeight: 700, margin: 0 }}>All Customers</h3>
          <small style={{ color: G.muted }}>Manage all customers</small>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

          {/* FILTER DROPDOWN */}
          <Dropdown align="end">
            <Dropdown.Toggle as="button" style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 8, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <i className="fe fe-filter" style={{ color: G.muted }}></i>
            </Dropdown.Toggle>
            <Dropdown.Menu className="cu-ddm" align="end" style={{ width: 180 }}>
              {["All", "Active", "Inactive", "Premium", "Free"].map((type) => (
                <Dropdown.Item key={type} active={filterType === type} onClick={() => setFilterType(type)}>
                  {type}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* BULK DELETE TOGGLE */}
          <button
            onClick={() => { setBulkMode(!bulkMode); setSelectedCustomers([]); }}
            style={{ background: bulkMode ? "rgba(248,113,113,0.12)" : G.card, border: `1px solid ${bulkMode ? "rgba(248,113,113,0.4)" : G.divider}`, borderRadius: 8, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <i className="fe fe-trash" style={{ color: bulkMode ? "#f87171" : G.muted }}></i>
          </button>

          {/* CREATE BUTTON */}
          <button
            onClick={() => router.push("/customers/create")}
            style={{ background: G.gold, border: "none", color: "#000", padding: "8px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >
            + Create Customer
          </button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 24 }}>

        {/* SHOW + SEARCH ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: G.muted, fontSize: 13 }}>Show</span>
            <Form.Select size="sm" style={{ width: 80 }} value={entriesPerPage} className="cu-inp"
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
            <span style={{ color: G.muted, fontSize: 13 }}>entries</span>
          </div>
          <Form.Control
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ width: 220 }}
            size="sm"
            className="cu-inp"
          />
        </div>

        {/* BULK DELETE BUTTON */}
        {bulkMode && selectedCustomers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.4)", color: "#f87171", padding: "6px 18px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
            >
              {bulkDeleteLoading ? "Deleting..." : `Delete Selected (${selectedCustomers.length})`}
            </button>
          </div>
        )}

        {/* TABLE */}
        <Table responsive className="align-middle mb-0">
          <thead className="cu-thead">
            <tr>
              {bulkMode && <th style={{ width: 40 }}></th>}
              <th>NAME</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>GENDER</th>
              <th className="text-center">STATUS</th>
              <th>TRAINER</th>
              <th className="text-end">ACTION</th>
            </tr>
          </thead>
          <tbody className="cu-tbody">
            {loading ? (
              <tr>
                <td colSpan={bulkMode ? 8 : 7} style={{ textAlign: "center", padding: "32px 0", color: G.muted }}>
                  Loading customers...
                </td>
              </tr>
            ) : currentCustomers.length === 0 ? (
              <tr>
                <td colSpan={bulkMode ? 8 : 7} style={{ textAlign: "center", padding: "32px 0", color: G.muted }}>
                  No Customers Found
                </td>
              </tr>
            ) : (
              currentCustomers.map((customer) => (
                <tr key={customer.id}>
                  {bulkMode && (
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id]);
                          } else {
                            setSelectedCustomers(selectedCustomers.filter((id) => id !== customer.id));
                          }
                        }}
                      />
                    </td>
                  )}

                  <td>{customer.firstName} {customer.lastName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.gender ? customer.gender.toLowerCase() : "—"}</td>

                  <td className="text-center">
                    <Dropdown>
                      <Dropdown.Toggle as="button" className={`status-pill ${customer.isActive ? "status-active" : "status-inactive"}`}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: customer.isActive ? "#4ade80" : "#f87171" }}></span>
                        <span className="fw-semibold">{customer.isActive ? "Active" : "Inactive"}</span>
                        <i className="fe fe-chevron-down small" style={{ color: G.muted }}></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="cu-ddm">
                        <Dropdown.Item onClick={() => dispatch(toggleCustomerStatus({ id: customer.id, isActive: true }))}>
                          <span style={{ color: "#4ade80", marginRight: 8 }}>●</span>Active
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => dispatch(toggleCustomerStatus({ id: customer.id, isActive: false }))}>
                          <span style={{ color: "#f87171", marginRight: 8 }}>●</span>Inactive
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>

                  <td>
                    {(() => {
                      const assignedTrainer = trainers.find((trainer) =>
                        trainer.assignedCustomers?.some((item) => item.customerId === customer.id)
                      );
                      return assignedTrainer
                        ? `${assignedTrainer.firstName} ${assignedTrainer.lastName}`
                        : <span style={{ color: G.muted, fontSize: 13 }}>Not Assigned</span>;
                    })()}
                  </td>

                  <td className="text-end">
                    <Dropdown align="end">
                      <Dropdown.Toggle as="button" style={{ background: "transparent", border: `1px solid ${G.divider}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
                        <i className="fe fe-more-vertical" style={{ color: G.muted }}></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="cu-ddm">
                        <Dropdown.Item onClick={() => handleView(customer)}>
                          <i className="fe fe-eye me-2" style={{ color: G.muted }}></i>View
                        </Dropdown.Item>

                        {customer.isActive && (
                          <Dropdown.Item onClick={() => handleAssignOpen(customer)}>
                            <i className="fe fe-user-plus me-2" style={{ color: G.muted }}></i>
                            {(() => {
                              const isAssigned = trainers.some((trainer) =>
                                trainer.assignedCustomers?.some((item) => item.customerId === customer.id)
                              );
                              return isAssigned ? "Change Trainer" : "Assign Trainer";
                            })()}
                          </Dropdown.Item>
                        )}

                        {trainers.some((trainer) =>
                          trainer.assignedCustomers?.some((item) => item.customerId === customer.id)
                        ) && (
                          <Dropdown.Item style={{ color: "#f87171" }} onClick={() => handleRemoveTrainer(customer)}>
                            <i className="fe fe-user-x me-2"></i>Remove Trainer
                          </Dropdown.Item>
                        )}

                        <Dropdown.Item onClick={() => handleEditOpen(customer)}>
                          <i className="fe fe-edit me-2" style={{ color: G.muted }}></i>Edit
                        </Dropdown.Item>

                        <Dropdown.Divider />

                        <Dropdown.Item
                          style={{ color: "#f87171" }}
                          onClick={async () => {
                            if (!confirm("Delete this customer?")) return;
                            await dispatch(deleteCustomer(customer.id));
                          }}
                        >
                          <i className="fe fe-trash me-2"></i>Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* PAGINATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          <span style={{ color: G.muted, fontSize: 13 }}>
            Showing {filteredCustomers.length === 0 ? 0 : indexOfFirstCustomer + 1} to{" "}
            {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} entries
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
                    background: isActive ? G.gold : "transparent",
                    color: btn.disabled ? "#444" : isActive ? "#000" : "#888888",
                    opacity: btn.disabled ? 0.5 : 1,
                    transition: "all 0.15s ease",
                  }}>
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ASSIGN TRAINER MODAL */}
      <Modal show={showAssign} onHide={() => setShowAssign(false)} centered className="modal-gold">
        <Modal.Header closeButton>
          <Modal.Title>
            {(() => {
              const isAssigned = trainers.some((trainer) =>
                trainer.assignedCustomers?.some((item) => item.customerId === selectedCustomer?.id)
              );
              return isAssigned ? "Change Trainer" : "Assign Trainer";
            })()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Search trainer..."
            className="mb-3"
            value={trainerSearch}
            onChange={(e) => setTrainerSearch(e.target.value)}
          />
          <div style={{ maxHeight: 250, overflowY: "auto", paddingLeft: 4 }}>
            {filteredTrainers.length === 0 ? (
              <p style={{ color: G.muted, textAlign: "center", margin: 0 }}>No trainers found</p>
            ) : (
              filteredTrainers.map((trainer) => (
                <Form.Check
                  key={trainer.id}
                  type="radio"
                  name="trainerSelect"
                  label={`${trainer.firstName} ${trainer.lastName}`}
                  value={trainer.id}
                  checked={selectedTrainer === trainer.id}
                  onChange={() => setSelectedTrainer(trainer.id)}
                  className="mb-2"
                />
              ))
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => setShowAssign(false)}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssignSave}
            disabled={!selectedTrainer}
            style={{ background: selectedTrainer ? G.gold : "#333", border: "none", color: selectedTrainer ? "#000" : G.muted, padding: "6px 20px", borderRadius: 8, fontWeight: 700, cursor: selectedTrainer ? "pointer" : "not-allowed" }}
          >
            {(() => {
              const isAssigned = trainers.some((trainer) =>
                trainer.assignedCustomers?.some((item) => item.customerId === selectedCustomer?.id)
              );
              return isAssigned ? "Change Trainer" : "Assign Trainer";
            })()}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
