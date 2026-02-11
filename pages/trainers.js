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
} from "react-bootstrap";

export default function Trainers() {
  const router = useRouter();

  const demoData = [
    {
      id: 1,
      firstName: "John",
      lastName: "Smith",
      email: "john@gmail.com",
      phone: "9876543210",
      status: "Active",
    },
    {
      id: 2,
      firstName: "Alex",
      lastName: "Brown",
      email: "alex@gmail.com",
      phone: "9876543211",
      status: "Inactive",
    },
    {
      id: 3,
      firstName: "David",
      lastName: "Wilson",
      email: "david@gmail.com",
      phone: "9876543212",
      status: "Active",
    },
    {
      id: 4,
      firstName: "Emma",
      lastName: "Clark",
      email: "emma@gmail.com",
      phone: "9876543213",
      status: "Active",
    },
    {
      id: 5,
      firstName: "Olivia",
      lastName: "Lee",
      email: "olivia@gmail.com",
      phone: "9876543214",
      status: "Inactive",
    },
  ];

  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  // ================= PAGINATION =================
const [currentPage, setCurrentPage] = useState(1);
const [entriesPerPage, setEntriesPerPage] = useState(10);


useEffect(() => {
  let stored = JSON.parse(localStorage.getItem("gymTrainers"));

  if (!stored) {
    stored = [];
  }

  // If less than 5 trainers, reset demo data
  if (stored.length < 5) {
    const demoTrainers = [
      {
        id: 1,
        firstName: "John",
        lastName: "Smith",
        email: "john@gmail.com",
        phone: "9876543210",
        status: "Active",
      },
      {
        id: 2,
        firstName: "Alex",
        lastName: "Brown",
        email: "alex@gmail.com",
        phone: "9876543211",
        status: "Inactive",
      },
      {
        id: 3,
        firstName: "David",
        lastName: "Wilson",
        email: "david@gmail.com",
        phone: "9876543212",
        status: "Active",
      },
      {
        id: 4,
        firstName: "Emma",
        lastName: "Clark",
        email: "emma@gmail.com",
        phone: "9876543213",
        status: "Active",
      },
      {
        id: 5,
        firstName: "Olivia",
        lastName: "Lee",
        email: "olivia@gmail.com",
        phone: "9876543214",
        status: "Inactive",
      },
    ];

    localStorage.setItem("gymTrainers", JSON.stringify(demoTrainers));
    setTrainers(demoTrainers);
  } else {
    setTrainers(stored);
  }
}, []);


  const updateTrainerStatus = (id, newStatus) => {
    const updated = trainers.map((trainer) =>
      trainer.id === id ? { ...trainer, status: newStatus } : trainer
    );
    setTrainers(updated);
    localStorage.setItem("gymTrainers", JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this trainer?")) return;
    const updated = trainers.filter((trainer) => trainer.id !== id);
    setTrainers(updated);
    localStorage.setItem("gymTrainers", JSON.stringify(updated));
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const fullName =
      `${trainer.firstName} ${trainer.lastName}`.toLowerCase();

    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      trainer.email.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterStatus === "All" || trainer.status === filterStatus;

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

  const handleBulkDelete = () => {
    const updated = trainers.filter(
      (trainer) => !selectedIds.includes(trainer.id)
    );
    setTrainers(updated);
    localStorage.setItem("gymTrainers", JSON.stringify(updated));
    setSelectedIds([]);
    setSelectionMode(false);
  };

  return (
    <div className="p-4">

      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-1">All Trainers</h3>
          <small className="text-muted">Manage all trainers</small>
        </Col>

        <Col className="text-end d-flex justify-content-end gap-2">

          {/* FILTER BUTTON */}
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="btn btn-light border d-flex align-items-center justify-content-center"
              style={{ width: 42, height: 42 }}
            >
              <i className="fe fe-filter text-secondary"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 rounded-3 p-2">
              <Dropdown.Item onClick={() => setFilterStatus("All")}>
                <i className="fe fe-eye me-2 text-secondary"></i> All
              </Dropdown.Item>

              <Dropdown.Item onClick={() => setFilterStatus("Active")}>
                <span className="text-success me-2">●</span> Active
              </Dropdown.Item>

              <Dropdown.Item onClick={() => setFilterStatus("Inactive")}>
                <span className="text-danger me-2">●</span> Inactive
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* DELETE BUTTON (same style) */}
          <Button
            className="btn btn-light border d-flex align-items-center justify-content-center"
            style={{ width: 42, height: 42 }}
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds([]);
            }}
          >
            <i className="fe fe-trash text-secondary"></i>
          </Button>

          {/* CREATE BUTTON */}
          <Link href="/trainers/create">
            <Button variant="primary" className="px-4">
              + Create Trainer
            </Button>
          </Link>
        </Col>
      </Row>

      {/* CARD */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>

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


          {selectionMode && selectedIds.length > 0 && (
            <Button
              variant="danger"
              className="mb-3"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}

          <Table responsive hover className="align-middle">
            <thead className="bg-light">
              <tr className="text-muted text-uppercase small">
                {selectionMode && <th></th>}
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                {!selectionMode && <th className="text-end">Action</th>}
              </tr>
            </thead>

            <tbody>
              {currentTrainers.map((trainer) => (
                <tr key={trainer.id}>
                  {selectionMode && (
                    <td>
                      <Form.Check
                        checked={selectedIds.includes(trainer.id)}
                        onChange={() => toggleSelect(trainer.id)}
                      />
                    </td>
                  )}

                  <td className="fw-semibold text-dark">
                    {trainer.firstName} {trainer.lastName}
                  </td>

                  <td className="text-dark">
                    {trainer.email}
                  </td>

                  <td className="text-dark">
                    {trainer.phone}
                  </td>

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

                        <span className="fw-semibold text-dark">
                          {trainer.status}
                        </span>

                        <i className="fe fe-chevron-down small text-muted"></i>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="shadow border-0 rounded-3">

                        <Dropdown.Item
                          onClick={() =>
                            updateTrainerStatus(trainer.id, "Active")
                          }
                        >
                          <span className="text-success me-2">●</span>
                          Active
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            updateTrainerStatus(trainer.id, "Inactive")
                          }
                        >
                          <span className="text-danger me-2">●</span>
                          Inactive
                        </Dropdown.Item>

                      </Dropdown.Menu>
                    </Dropdown>
                  </td>

                  {!selectionMode && (
                    <td className="text-end">
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          as="button"
                          className="btn btn-sm btn-light border-0"
                        >
                          <i className="fe fe-more-vertical text-secondary"></i>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="shadow border-0 rounded-3">

                          <Dropdown.Item
                            onClick={() =>
                              router.push(`/trainers/view/${trainer.id}`)
                            }
                          >
                            <i className="fe fe-eye me-2 text-secondary"></i>
                            View
                          </Dropdown.Item>

                          <Dropdown.Item
                            onClick={() =>
                              router.push(`/trainers/edit/${trainer.id}`)
                            }
                          >
                            <i className="fe fe-edit me-2 text-secondary"></i>
                            Edit
                          </Dropdown.Item>

                          <Dropdown.Divider />

                          <Dropdown.Item
  onClick={() => handleDelete(trainer.id)}
  className="text-dark"
  style={{ color: "#344767" }}
>
  <i className="fe fe-trash me-2"></i>
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
              {/* ================= BOTTOM PAGINATION ================= */}
<Row className="mt-4 align-items-center">
  <Col md={6} className="text-muted small">
    Showing {filteredTrainers.length === 0 ? 0 : indexOfFirstTrainer + 1} to{" "}
    {Math.min(indexOfLastTrainer, filteredTrainers.length)} of{" "}
    {filteredTrainers.length} entries
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
    </div>
  );
}
