import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  useEffect(() => {
    setTrainers(JSON.parse(localStorage.getItem("gymTrainers")) || []);
    setCustomers(JSON.parse(localStorage.getItem("gymCustomers")) || []);
  }, []);

  /* ================= STATUS UPDATE ================= */
  const updateTrainerStatus = (id, newStatus) => {
    const updated = trainers.map((trainer) =>
      trainer.id === id ? { ...trainer, status: newStatus } : trainer
    );
    setTrainers(updated);
    localStorage.setItem("gymTrainers", JSON.stringify(updated));
  };

  /* ================= FILTER ================= */
  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch = trainer.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filterStatus === "All" || trainer.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  /* ================= BULK DELETE ================= */
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    const updated = trainers.filter(
      (trainer) => !selectedIds.includes(trainer.id)
    );
    setTrainers(updated);
    localStorage.setItem("gymTrainers", JSON.stringify(updated));
    setSelectedIds([]);
    setSelectionMode(false);
  };

  /* ================= ASSIGN TRAINER ================= */
  const openAssignModal = (customer) => {
    setSelectedCustomer(customer);
    setSelectedTrainerId(customer.assignedTrainerId || "");
    setShowModal(true);
  };

  const handleAssignTrainer = () => {
    const updatedCustomers = customers.map((cust) =>
      cust.id === selectedCustomer.id
        ? { ...cust, assignedTrainerId: selectedTrainerId }
        : cust
    );

    setCustomers(updatedCustomers);
    localStorage.setItem("gymCustomers", JSON.stringify(updatedCustomers));
    setShowModal(false);
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find((t) => t.id === trainerId);
    return trainer ? trainer.name : null;
  };

  return (
    <div className="p-4">

      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-1">Trainer Management</h3>
          <small className="text-muted">
            Manage all trainers and customers
          </small>
        </Col>

        <Col className="text-end d-flex justify-content-end gap-2">

          {/* FILTER */}
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="btn btn-light border"
              style={{ width: 42, height: 42 }}
            >
              <i className="fe fe-filter"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                active={filterStatus === "All"}
                onClick={() => setFilterStatus("All")}
              >
                All
              </Dropdown.Item>
              <Dropdown.Item
                active={filterStatus === "Active"}
                onClick={() => setFilterStatus("Active")}
              >
                Active
              </Dropdown.Item>
              <Dropdown.Item
                active={filterStatus === "Inactive"}
                onClick={() => setFilterStatus("Inactive")}
              >
                Inactive
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* DELETE MODE */}
          <Button
            variant={selectionMode ? "danger" : "outline-danger"}
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds([]);
            }}
          >
            <i className="fe fe-trash"></i>
          </Button>

          <Link href="/trainers/create">
            <Button variant="primary" className="px-4">
              + Create Trainer
            </Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>

          {/* TABS */}
          <div className="duralux-tabs mb-4">
            <div
              className={`duralux-tab ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </div>
            <div
              className={`duralux-tab ${
                activeTab === "customers" ? "active" : ""
              }`}
              onClick={() => setActiveTab("customers")}
            >
              Customer List
            </div>
          </div>

          {/* ================= PROFILE TAB ================= */}
          {activeTab === "profile" && (
            <>
<Row className="mb-3 align-items-center">
  <Col>
    <h6 className="fw-semibold mb-0">All Trainers</h6>
  </Col>

  <Col md="auto">
    <Form.Control
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ width: "250px" }}
    />
  </Col>
</Row>


              {selectionMode && selectedIds.length > 0 && (
                <Button
                  variant="danger"
                  className="mb-3"
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedIds.length})
                </Button>
              )}

              <Table responsive>
                <thead>
                  <tr>
                    {selectionMode && <th></th>}
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    {!selectionMode && <th className="text-end">Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredTrainers.map((trainer) => (
                    <tr key={trainer.id}>
                      {selectionMode && (
                        <td>
                          <Form.Check
                            checked={selectedIds.includes(trainer.id)}
                            onChange={() => toggleSelect(trainer.id)}
                          />
                        </td>
                      )}

                      <td>{trainer.name}</td>
                      <td>{trainer.email}</td>
                      <td>{trainer.phone}</td>

                      {/* STATUS DROPDOWN */}
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            as="button"
                            className="btn btn-sm border-0 bg-transparent d-flex align-items-center gap-2"
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor:
                                  trainer.status === "Active"
                                    ? "#22c55e"
                                    : "#dc3545",
                              }}
                            ></span>
                            <span
                              className={
                                trainer.status === "Active"
                                  ? "text-success fw-semibold"
                                  : "text-danger fw-semibold"
                              }
                            >
                              {trainer.status}
                            </span>
                            <i className="fe fe-chevron-down small"></i>
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() =>
                                updateTrainerStatus(trainer.id, "Active")
                              }
                            >
                              <span className="text-success">
                                ● Active
                              </span>
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                updateTrainerStatus(trainer.id, "Inactive")
                              }
                            >
                              <span className="text-danger">
                                ● Inactive
                              </span>
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>

                      {/* ACTION */}
                      {!selectionMode && (
                        <td className="text-end">
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              as="button"
                              className="btn btn-sm btn-light border-0"
                            >
                              <i className="fe fe-more-vertical"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>View</Dropdown.Item>
                              <Dropdown.Item>Edit</Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger">
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {/* ================= CUSTOMER TAB ================= */}
          {activeTab === "customers" && (
            <>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Control
                    placeholder="Search customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
              </Row>

              <Table responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Assigned Trainer</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers
                    .filter((customer) =>
                      customer.name
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
                    .map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>
                          <span
                            className={`badge ${
                              customer.status === "Active"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>

                        <td>
                          {customer.assignedTrainerId ? (
                            <span className="badge bg-primary">
                              {getTrainerName(
                                customer.assignedTrainerId
                              )}
                            </span>
                          ) : (
                            <span className="text-muted">
                              Not Assigned
                            </span>
                          )}
                        </td>

                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              openAssignModal(customer)
                            }
                          >
                            Assign
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>

      {/* ASSIGN MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Trainer</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Select
            value={selectedTrainerId}
            onChange={(e) => setSelectedTrainerId(e.target.value)}
          >
            <option value="">Select Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignTrainer}
            disabled={!selectedTrainerId}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
