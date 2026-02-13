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

  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  // ================= PAGINATION =================
const [currentPage, setCurrentPage] = useState(1);
const [entriesPerPage, setEntriesPerPage] = useState(10);


useEffect(() => {
  const fetchTrainers = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/trainers",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch trainers");
      }

      // 🔥 Format backend response
      const formatted = (data.data || []).map((trainer) => ({
        id: trainer.id,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        email: trainer.email,
        phone: trainer.phone,
        isActive: trainer.isActive,
        createdAt: trainer.createdAt,
      }));

      setTrainers(formatted);

    } catch (error) {
      console.error("Fetch Error:", error.message);
      alert(error.message);
    }
  };

  fetchTrainers();
}, []);



const updateTrainerStatus = async (id, newStatus) => {
  try {
    const token = localStorage.getItem("adminToken");

    const trainerToUpdate = trainers.find((t) => t.id === id);

    const response = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: trainerToUpdate.firstName,
          lastName: trainerToUpdate.lastName,
          email: trainerToUpdate.email,
          phone: trainerToUpdate.phone,
          isActive: newStatus === "Active",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update status");
    }

    // Update UI instantly after success
    const updated = trainers.map((trainer) =>
      trainer.id === id
        ? { ...trainer, isActive: newStatus === "Active" }
        : trainer
    );

    setTrainers(updated);

  } catch (error) {
    console.error("Status Update Error:", error.message);
    alert(error.message);
  }
};



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

    setTrainers((prev) => prev.filter((t) => t.id !== id));

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

  const handleBulkDelete = async () => {
  if (selectedIds.length === 0) {
    alert("Select trainers first");
    return;
  }

  if (!confirm("Delete selected trainers?")) return;

  try {
    const token = localStorage.getItem("adminToken");

    await Promise.all(
      selectedIds.map((id) =>
        fetch(
          `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      )
    );

    // remove from UI
    setTrainers((prev) =>
      prev.filter((trainer) => !selectedIds.includes(trainer.id))
    );

    setSelectedIds([]);
    alert("Deleted successfully ✅");

  } catch (err) {
    alert("Delete failed");
  }
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
                <th className="text-center">Status</th>
                {!selectionMode && <th className="text-end">Action</th>}
              </tr>
            </thead>

            <tbody>
              {currentTrainers.map((trainer) => (
                <tr key={trainer.id}>
                  {selectionMode && (
                    <td>
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

                  <td className="fw-semibold text-dark">
                    {trainer.firstName} {trainer.lastName}
                  </td>

                  <td className="text-dark">
                    {trainer.email}
                  </td>

                  <td className="text-dark">
                    {trainer.phone}
                  </td>

                  <td className="text-center align-middle">
  <Dropdown>
                      <Dropdown.Toggle
                        as="button"
                        className={`status-pill ${
  trainer.isActive ? "status-active" : "status-inactive"
}`}
                      >
<span
  style={{
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: trainer.isActive
      ? "#22c55e"
      : "#dc3545",
  }}
></span>


                        <span className="fw-semibold text-dark">
                          {trainer.isActive ? "Active" : "Inactive"}
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
