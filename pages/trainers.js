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

  useEffect(() => {
    setTrainers(JSON.parse(localStorage.getItem("gymTrainers")) || []);
  }, []);

  const updateTrainerStatus = (id, newStatus) => {
    const updated = trainers.map((trainer) =>
      trainer.id === id ? { ...trainer, status: newStatus } : trainer
    );
    setTrainers(updated);
    localStorage.setItem("gymTrainers", JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    const updated = trainers.filter((trainer) => trainer.id !== id);
    setTrainers(updated);
    localStorage.setItem("gymTrainers", JSON.stringify(updated));
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const fullName = `${trainer.firstName || ""} ${trainer.lastName || ""}`.toLowerCase();

    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      (trainer.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterStatus === "All" || trainer.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
              <i className="fe fe-filter"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 rounded-3 p-2">

              <Dropdown.Item
                active={filterStatus === "All"}
                onClick={() => setFilterStatus("All")}
                className="d-flex align-items-center gap-2"
              >
                <i className="fe fe-eye text-primary"></i>
                All
              </Dropdown.Item>

              <Dropdown.Item
                active={filterStatus === "Active"}
                onClick={() => setFilterStatus("Active")}
                className="d-flex align-items-center gap-2"
              >
                <i className="fe fe-user-check text-success"></i>
                Active
              </Dropdown.Item>

              <Dropdown.Item
                active={filterStatus === "Inactive"}
                onClick={() => setFilterStatus("Inactive")}
                className="d-flex align-items-center gap-2"
              >
                <i className="fe fe-user-x text-danger"></i>
                Inactive
              </Dropdown.Item>

            </Dropdown.Menu>
          </Dropdown>

          {/* DELETE BUTTON (same style as filter) */}
          <Button
            className={`btn btn-light border d-flex align-items-center justify-content-center ${
              selectionMode ? "text-danger" : ""
            }`}
            style={{ width: 42, height: 42 }}
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds([]);
            }}
          >
            <i className="fe fe-trash"></i>
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

          {/* TOP BAR */}
          <Row className="mb-3 align-items-center">
            <Col>
              <span className="fw-semibold">
                Showing {filteredTrainers.length} trainers
              </span>
            </Col>

            <Col md="auto">
              <Form.Control
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 220 }}
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

          {/* TABLE */}
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

                  <td className="fw-semibold">
                    {trainer.firstName} {trainer.lastName}
                  </td>

                  <td className="text-muted">{trainer.email}</td>
                  <td>{trainer.phone}</td>

                  <td>
                    <span
                      className={
                        trainer.status === "Active"
                          ? "text-success fw-semibold"
                          : "text-danger fw-semibold"
                      }
                    >
                      {trainer.status}
                    </span>
                  </td>

                  {!selectionMode && (
                    <td className="text-end">
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          as="button"
                          className="btn btn-sm btn-light border-0"
                        >
                          <i className="fe fe-more-vertical"></i>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="shadow border-0 rounded-3">

                          <Dropdown.Item
                            onClick={() =>
                              router.push(`/trainers/view/${trainer.id}`)
                            }
                          >
                            <i className="fe fe-eye me-2 text-primary"></i>
                            View
                          </Dropdown.Item>

                          <Dropdown.Item
                            onClick={() =>
                              router.push(`/trainers/edit/${trainer.id}`)
                            }
                          >
                            <i className="fe fe-edit me-2 text-warning"></i>
                            Edit
                          </Dropdown.Item>

                          <Dropdown.Divider />

                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => handleDelete(trainer.id)}
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

        </Card.Body>
      </Card>
    </div>
  );
}
