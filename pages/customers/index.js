import { useState, useEffect } from "react";
import { Table, Modal, Badge, Dropdown, Form, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { Card, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  deleteCustomer,
  toggleCustomerStatus,
  assignTrainer,
} from "../../redux/slices/customerSlice";


export default function AllCustomers() {

  const [trainers, setTrainers] = useState([]);

  const [filterType, setFilterType] = useState("All");

  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
const [selectedCustomers, setSelectedCustomers] = useState([]);

  //redux
  const dispatch = useDispatch();

const { customers, loading } = useSelector(
  (state) => state.customers
);

  //searc box
  const [trainerSearch, setTrainerSearch] = useState("");

  //pagination logic
  const [currentPage, setCurrentPage] = useState(1);
const [entriesPerPage, setEntriesPerPage] = useState(10);
const [search, setSearch] = useState("");

  const router = useRouter();

  // Load customers + trainers

// To this:
useEffect(() => {
  dispatch(fetchCustomers());
}, [dispatch]);

useEffect(() => {
  const fetchTrainers = async () => {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      "https://fitness-app-seven-beryl.vercel.app/api/trainers",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();

    if (response.ok) {
      setTrainers(data.data);
    }
  };

  fetchTrainers();
}, []);


  // VIEW
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
        fetch(
          `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || `Failed to delete customer ${id}`);
          }
          return id;
        })
      )
    );

    // Only remove from Redux if API succeeded
    results.forEach((id) => {
  dispatch({ type: "customers/deleteCustomer/fulfilled", payload: id });
});

    setSelectedCustomers([]);
    setBulkMode(false);
    alert("Deleted successfully ✅");

  } catch (err) {
    console.error("Bulk delete error:", err.message);
    alert(`Delete failed: ${err.message}`);
  } finally {
    setBulkDeleteLoading(false);
  }
};

  // EDIT
 // EDIT (Redirect to create page in edit mode)
const handleEditOpen = (customer) => {
  router.push(`/customers/create?id=${customer.id}`);
};


  // ASSIGN TRAINER
  const handleAssignOpen = (customer) => {
    setSelectedCustomer(customer);

    // Find assigned trainer from trainers list
    const assignedTrainer = trainers.find((trainer) =>
      trainer.assignedCustomers?.some(
        (item) => item.customerId === customer.id
      )
    );

    if (assignedTrainer) {
      setSelectedTrainer(assignedTrainer.id);
    } else {
      setSelectedTrainer("");
    }

    setShowAssign(true);
  };

 const handleAssignSave = async () => {
  await dispatch(
    assignTrainer({
      trainerId: selectedTrainer,
      customerId: selectedCustomer.id,
    })
  );

  setShowAssign(false);
};


const filteredCustomers = customers
  .filter((customer) => {
    const fullName =
      `${customer.firstName} ${customer.lastName}`.toLowerCase();

    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;

    if (filterType === "Active") {
      matchesFilter = customer.isActive === true;
    }

    if (filterType === "Inactive") {
      matchesFilter = customer.isActive === false;
    }

    if (filterType === "Premium") {
      matchesFilter = customer.plan === "Premium"; // adjust if needed
    }

    if (filterType === "Free") {
      matchesFilter = customer.plan === "Free"; // adjust if needed
    }

    return matchesSearch && matchesFilter;
  });
const indexOfLastCustomer = currentPage * entriesPerPage;
const indexOfFirstCustomer = indexOfLastCustomer - entriesPerPage;

const currentCustomers = filteredCustomers.slice(
  indexOfFirstCustomer,
  indexOfLastCustomer
);

const totalPages = Math.ceil(
  filteredCustomers.length / entriesPerPage
);

const filteredTrainers = trainers
  .filter((trainer) =>
    `${trainer.firstName} ${trainer.lastName}`
      .toLowerCase()
      .includes(trainerSearch.toLowerCase())
  )
  .sort((a, b) => {
    // Move selected trainer to top
    if (a.id === selectedTrainer) return -1;
    if (b.id === selectedTrainer) return 1;
    return 0;
  });


  return (
  <div className="p-4">
    {/* Full page loader overlay */}
{bulkDeleteLoading && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
    }}
  >
    <div
      className="spinner-border text-light"
      role="status"
      style={{ width: "48px", height: "48px" }}
    />
    <p style={{ color: "#fff", fontWeight: "600", fontSize: "16px", margin: 0 }}>
      Deleting customers...
    </p>
  </div>
)}

    {/* HEADER */}
    <Row className="align-items-center mb-4">
  <Col>
    <h3 className="fw-bold mb-1">All Customers</h3>
    <small className="text-muted">Manage all customers</small>
  </Col>

  <Col className="text-end d-flex justify-content-end align-items-center gap-2">

  {/* FILTER DROPDOWN */}
  <Dropdown align="end">
  <Dropdown.Toggle
    as="button"
    className="btn btn-light border d-flex align-items-center justify-content-center"
    style={{ width: 42, height: 42 }}
  >
    <i className="fe fe-filter text-secondary"></i>
  </Dropdown.Toggle>

    <Dropdown.Menu
  align="end"
  className="shadow border-0 rounded-3 py-2"
  style={{ width: 180 }}
>

      <Dropdown.Item
  active={filterType === "All"}
  onClick={() => setFilterType("All")}
  className={`filter-item ${
    filterType === "All" ? "active-filter" : ""
  }`}
>
  <span className="filter-dot filter-all me-2"></span>
  All
</Dropdown.Item>

<Dropdown.Item
  active={filterType === "Active"}
  onClick={() => setFilterType("Active")}
  className={`filter-item ${
    filterType === "Active" ? "active-filter" : ""
  }`}
>
  <span className="filter-dot filter-active me-2"></span>
  Active
</Dropdown.Item>

<Dropdown.Item
  active={filterType === "Inactive"}
  onClick={() => setFilterType("Inactive")}
  className={`filter-item ${
    filterType === "Inactive" ? "active-filter" : ""
  }`}
>
  <span className="filter-dot filter-inactive me-2"></span>
  Inactive
</Dropdown.Item>

<Dropdown.Item
  active={filterType === "Premium"}
  onClick={() => setFilterType("Premium")}
  className={`filter-item ${
    filterType === "Premium" ? "active-filter" : ""
  }`}
>
  <span className="filter-dot filter-premium me-2"></span>
  Premium
</Dropdown.Item>

<Dropdown.Item
  active={filterType === "Free"}
  onClick={() => setFilterType("Free")}
  className={`filter-item ${
    filterType === "Free" ? "active-filter" : ""
  }`}
>
  <span className="filter-dot filter-free me-2"></span>
  Free
</Dropdown.Item>

    </Dropdown.Menu>
  </Dropdown>

{/* BULK DELETE BUTTON */}
<Button
  variant="light"
  className={`btn border icon-square-btn delete-toggle-btn ${
    bulkMode ? "active-delete" : ""
  }`}
  onClick={() => {
    setBulkMode(!bulkMode);
    setSelectedCustomers([]);
  }}
>
  <i className="fe fe-trash text-secondary"></i>
</Button>
  {/* CREATE BUTTON */}
  <Button
    variant="primary"
    className="px-4"
    onClick={() => router.push("/customers/create")}
  >
    + Create Customer
  </Button>

</Col>
</Row>

    {/* CARD */}
    <Card className="shadow-sm border-0 rounded-3">
      <Card.Body>

        {/* SHOW + SEARCH ROW */}
        <Row className="mb-3 align-items-center">
          <Col md={6} className="d-flex align-items-center gap-2">
            <span className="text-muted small">Show</span>

            <Form.Select
  size="sm"
  style={{ width: 80 }}
  value={entriesPerPage}
  onChange={(e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  }}
>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>

            <span className="text-muted small">entries</span>
          </Col>

          <Col md={6} className="text-end">
            <Form.Control
  placeholder="Search..."
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }}
  style={{ width: 220, display: "inline-block" }}
  size="sm"
/>
          </Col>
        </Row>
{bulkMode && selectedCustomers.length > 0 && (
  <div className="mb-3">
    <Button
      variant="danger"
      onClick={handleBulkDelete}
      disabled={bulkDeleteLoading}
    >
      {bulkDeleteLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Deleting...
        </>
      ) : (
        `Delete Selected (${selectedCustomers.length})`
      )}
    </Button>
  </div>
)}
        {/* TABLE */}
        <Table responsive hover className="align-middle">
          <thead className="bg-light">
            <tr className="text-muted text-uppercase small">
  {bulkMode && <th style={{ width: 40 }}></th>}
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th> 
              <th className="text-center">Status</th>
              <th>Trainer</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
  <tr>
    <td colSpan={bulkMode ? 7 : 6} className="text-center py-4 text-muted fw-semibold">
      Loading customers...
    </td>
  </tr>
) : currentCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted fw-semibold">
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
          setSelectedCustomers([
            ...selectedCustomers,
            customer.id,
          ]);
        } else {
          setSelectedCustomers(
            selectedCustomers.filter(
              (id) => id !== customer.id
            )
          );
        }
      }}
    />
  </td>
)}

                  <td className="fw-semibold text-dark">
                    {customer.firstName} {customer.lastName}
                  </td>

                  <td className="text-dark">
                    {customer.email}
                  </td>

                  <td className="text-dark">
                    {customer.phone}
                  </td>

                  <td>
  {customer.gender
    ? customer.gender.toLowerCase()
    : "—"}
</td>

                  <td className="text-center align-middle">
  <Dropdown>
    <Dropdown.Toggle
      as="button"
      className={`status-pill ${
        customer.isActive ? "status-active" : "status-inactive"
      }`}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: customer.isActive
            ? "#22c55e"
            : "#dc3545",
        }}
      ></span>

      <span className="fw-semibold text-dark">
        {customer.isActive ? "Active" : "Inactive"}
      </span>

      <i className="fe fe-chevron-down small text-muted"></i>
    </Dropdown.Toggle>

    <Dropdown.Menu className="shadow border-0 rounded-3">
      <Dropdown.Item
  onClick={() =>
    dispatch(toggleCustomerStatus({ id: customer.id, isActive: true }))
  }
>
  <span className="text-success me-2">●</span>
  Active
</Dropdown.Item>

<Dropdown.Item
  onClick={() =>
    dispatch(toggleCustomerStatus({ id: customer.id, isActive: false }))
  }
>
  <span className="text-danger me-2">●</span>
  Inactive
</Dropdown.Item>

    </Dropdown.Menu>
  </Dropdown>
</td>

                  <td>
  {(() => {
    const assignedTrainer = trainers.find((trainer) =>
      trainer.assignedCustomers?.some(
        (item) => item.customerId === customer.id
      )
    );

    return assignedTrainer
      ? `${assignedTrainer.firstName} ${assignedTrainer.lastName}`
      : "Not Assigned";
  })()}
</td>

                  <td className="text-end">
                    <Dropdown align="end">
                      <Dropdown.Toggle
                        as="button"
                        className="btn btn-sm btn-light border-0"
                      >
                        <i className="fe fe-more-vertical text-secondary"></i>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="shadow border-0 rounded-3">
                        <Dropdown.Item onClick={() => handleView(customer)}>
                          <i className="fe fe-eye me-2 text-secondary"></i>
                          View
                        </Dropdown.Item>

{customer.isActive && (
  <Dropdown.Item
    onClick={() => handleAssignOpen(customer)}
  >
    <i className="fe fe-user-plus me-2 text-secondary"></i>

    {(() => {
      const isAssigned = trainers.some((trainer) =>
        trainer.assignedCustomers?.some(
          (item) => item.customerId === customer.id
        )
      );

      return isAssigned ? "Change Trainer" : "Assign Trainer";
    })()}
  </Dropdown.Item>
)}


                        <Dropdown.Item
                          onClick={() => handleEditOpen(customer)}
                        >
                          <i className="fe fe-edit me-2 text-secondary"></i>
                          Edit
                        </Dropdown.Item>

                        <Dropdown.Divider />

                        <Dropdown.Item
                          className="text-dark"
                          onClick={async () => {
  if (!confirm("Delete this customer?")) return;
  await dispatch(deleteCustomer(customer.id));
}}
                        >
                          <i className="fe fe-trash me-2"></i>
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* PAGINATION STYLE (UI ONLY) */}
        <Row className="mt-4 align-items-center">
  <Col md={6} className="text-muted small">
    Showing {filteredCustomers.length === 0 ? 0 : indexOfFirstCustomer + 1} to{" "}
    {Math.min(indexOfLastCustomer, filteredCustomers.length)} of{" "}
    {filteredCustomers.length} entries
  </Col>

  <Col md={6} className="text-end">
    <nav>
      <ul className="pagination pagination-sm justify-content-end mb-0">

        <li className={`page-item ${currentPage === 1 && "disabled"}`}>
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
            className={`page-item ${
              currentPage === i + 1 ? "active" : ""
            }`}
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
          className={`page-item ${
            currentPage === totalPages && "disabled"
          }`}
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

      </Card.Body>
    </Card>

    {/* ASSIGN TRAINER MODAL (UNCHANGED) */}
    <Modal show={showAssign} onHide={() => setShowAssign(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>
      {(() => {
        const isAssigned = trainers.some((trainer) =>
          trainer.assignedCustomers?.some(
            (item) => item.customerId === selectedCustomer?.id
          )
        );

        return isAssigned ? "Change Trainer" : "Assign Trainer";
      })()}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>

    {/* 🔎 SEARCH BAR */}
    <Form.Control
      type="text"
      placeholder="Search trainer..."
      className="mb-3"
      value={trainerSearch}
      onChange={(e) => setTrainerSearch(e.target.value)}
    />

    {/* TRAINER LIST */}
    <div
  style={{
    maxHeight: "250px",
    overflowY: "auto",
    paddingLeft: "4px",
  }}
>

      {filteredTrainers.length === 0 ? (
        <p className="text-muted text-center">No trainers found</p>
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
    <Button
      variant="secondary"
      onClick={() => setShowAssign(false)}
    >
      Cancel
    </Button>

    <Button
      variant="primary"
      onClick={handleAssignSave}
      disabled={!selectedTrainer}
    >
      {(() => {
        const isAssigned = trainers.some((trainer) =>
          trainer.assignedCustomers?.some(
            (item) => item.customerId === selectedCustomer?.id
          )
        );

        return isAssigned ? "Change Trainer" : "Assign Trainer";
      })()}
    </Button>
  </Modal.Footer>
</Modal>

  </div>
);
}
