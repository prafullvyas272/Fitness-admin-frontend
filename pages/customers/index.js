import { useState, useEffect } from "react";
import { Table, Modal, Badge, Dropdown, Form, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { Card, Row, Col } from "react-bootstrap";


export default function AllCustomers() {
  const [customers, setCustomers] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedTrainer, setSelectedTrainer] = useState("");

  //pagination logic
  const [currentPage, setCurrentPage] = useState(1);
const [entriesPerPage, setEntriesPerPage] = useState(10);
const [search, setSearch] = useState("");

  const router = useRouter();

  // Load customers + trainers
useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.push("/login");
        return;
      }

      // Fetch Customers
      const customerRes = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/customers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const customerData = await customerRes.json();

      if (customerRes.ok) {
        setCustomers(customerData.data);
      }

      // Fetch Trainers
      const trainerRes = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/trainers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const trainerData = await trainerRes.json();

      if (trainerRes.ok) {
        setTrainers(trainerData.data);
      }

    } catch (error) {
      console.error(error.message);
    }
  };

  fetchData();
}, []);


  // Save customers
  const saveCustomers = (updated) => {
    setCustomers(updated);
    localStorage.setItem("gymCustomers", JSON.stringify(updated));
  };

  // DELETE
  const deleteCustomer = async (id) => {
  try {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}`,
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

    setCustomers(customers.filter((c) => c.id !== id));
  } catch (error) {
    alert(error.message);
  }
};


  // VIEW
const handleView = (customer) => {
  router.push(`/customers/${customer.id}`);
};


  // EDIT
  const handleEditOpen = (customer) => {
    setEditData(customer);
    setShowEdit(true);
  };

  const handleEditSave = () => {
    const updated = customers.map((c) =>
      c.id === editData.id ? editData : c
    );
    saveCustomers(updated);
    setShowEdit(false);
  };

  // ASSIGN TRAINER
  const handleAssignOpen = (customer) => {
    setSelectedCustomer(customer);
    setSelectedTrainer(customer.assignedTrainer || "");
    setShowAssign(true);
  };

 const handleAssignSave = async () => {
  try {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      "https://fitness-app-seven-beryl.vercel.app/api/assign-customer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trainerId: selectedTrainer,
          customerId: selectedCustomer.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Assign failed");
    }

    alert("Trainer Assigned ✅");

    setShowAssign(false);

    // Refresh customers list
    window.location.reload();

  } catch (error) {
    alert(error.message);
  }
};

const updateCustomerStatus = async (id, newStatus) => {
  try {
    const token = localStorage.getItem("adminToken");

    const customerToUpdate = customers.find((c) => c.id === id);

    const response = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: customerToUpdate.firstName,
          lastName: customerToUpdate.lastName,
          email: customerToUpdate.email,
          phone: customerToUpdate.phone,
          isActive: newStatus === "Active",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update status");
    }

    const updated = customers.map((customer) =>
      customer.id === id
        ? { ...customer, isActive: newStatus === "Active" }
        : customer
    );

    setCustomers(updated);

  } catch (error) {
    alert(error.message);
  }
};

const filteredCustomers = customers.filter((customer) => {
  const fullName =
    `${customer.firstName} ${customer.lastName}`.toLowerCase();

  return (
    fullName.includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  );
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

  return (
  <div className="p-4">

    {/* HEADER */}
    <Row className="align-items-center mb-4">
      <Col>
        <h3 className="fw-bold mb-1">All Customers</h3>
        <small className="text-muted">Manage all customers</small>
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

        {/* TABLE */}
        <Table responsive hover className="align-middle">
          <thead className="bg-light">
            <tr className="text-muted text-uppercase small">
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th className="text-center">Status</th>
              <th>Trainer</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No Customers Found
                </td>
              </tr>
            ) : (
              currentCustomers.map((customer) => (
                <tr key={customer.id}>

                  <td className="fw-semibold text-dark">
                    {customer.firstName} {customer.lastName}
                  </td>

                  <td className="text-dark">
                    {customer.email}
                  </td>

                  <td className="text-dark">
                    {customer.phone}
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
          updateCustomerStatus(customer.id, "Active")
        }
      >
        <span className="text-success me-2">●</span>
        Active
      </Dropdown.Item>

      <Dropdown.Item
        onClick={() =>
          updateCustomerStatus(customer.id, "Inactive")
        }
      >
        <span className="text-danger me-2">●</span>
        Inactive
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
</td>

                  <td>
                    {customer.assignedTrainers &&
                    customer.assignedTrainers.length > 0
                      ? "Assigned"
                      : "Not Assigned"}
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

                        <Dropdown.Item
                          onClick={() => handleAssignOpen(customer)}
                        >
                          <i className="fe fe-user-plus me-2 text-secondary"></i>
                          Assign Trainer
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleEditOpen(customer)}
                        >
                          <i className="fe fe-edit me-2 text-secondary"></i>
                          Edit
                        </Dropdown.Item>

                        <Dropdown.Divider />

                        <Dropdown.Item
                          className="text-dark"
                          onClick={() => deleteCustomer(customer.id)}
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

    {/* EDIT MODAL (UNCHANGED) */}
    <Modal show={showEdit} onHide={() => setShowEdit(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Customer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Control
            className="mb-3"
            value={editData.name || ""}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
          />
          <Form.Control
            className="mb-3"
            value={editData.email || ""}
            onChange={(e) =>
              setEditData({ ...editData, email: e.target.value })
            }
          />
          <Form.Control
            className="mb-3"
            value={editData.phone || ""}
            onChange={(e) =>
              setEditData({ ...editData, phone: e.target.value })
            }
          />
          <Button onClick={handleEditSave}>Save Changes</Button>
        </Form>
      </Modal.Body>
    </Modal>

    {/* ASSIGN TRAINER MODAL (UNCHANGED) */}
    <Modal show={showAssign} onHide={() => setShowAssign(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Trainer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Select
          value={selectedTrainer}
          onChange={(e) => setSelectedTrainer(e.target.value)}
        >
          <option value="">Select Trainer</option>
          {trainers.map((trainer) => (
            <option key={trainer.id} value={trainer.id}>
              {trainer.firstName} {trainer.lastName}
            </option>
          ))}
        </Form.Select>

        <Button className="mt-3" onClick={handleAssignSave}>
          Assign
        </Button>
      </Modal.Body>
    </Modal>

  </div>
);
}
