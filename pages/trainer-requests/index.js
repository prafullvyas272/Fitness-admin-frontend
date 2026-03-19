import { useState } from "react";
import { Card, Table, Button, Modal, Form, Badge } from "react-bootstrap";

export default function TrainerRequests() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // 🔥 Dummy Data (replace with API later)
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210",
      experience: "3 years",
      status: "pending",
      bio: "Certified fitness trainer",
    },
    {
      id: 2,
      name: "Amit Verma",
      email: "amit@gmail.com",
      phone: "9999999999",
      experience: "2 years",
      status: "pending",
      bio: "Weight loss specialist",
    },
  ]);

  /* ===============================
     HANDLE APPROVE / REJECT
  =============================== */
  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t
      )
    );
    setShowModal(false);
  };

  /* ===============================
     STATUS BADGE
  =============================== */
  const renderStatus = (status) => {
    if (status === "approved")
      return <Badge bg="success">Approved</Badge>;
    if (status === "rejected")
      return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-0">Trainer Requests</h3>
        <small className="text-muted">
          Manage trainer approvals
        </small>
      </div>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>

          {/* Table */}
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Experience</th>
                <th>Status</th>
                <th style={{ width: "180px" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((trainer) => (
                <tr key={trainer.id}>
                  <td>{trainer.name}</td>
                  <td>{trainer.email}</td>
                  <td>{trainer.phone}</td>
                  <td>{trainer.experience}</td>
                  <td>{renderStatus(trainer.status)}</td>

                  <td>
                    <div className="d-flex gap-2">

                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          setSelectedTrainer(trainer);
                          setShowModal(true);
                        }}
                      >
                        View
                      </Button>

                      {trainer.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() =>
                              handleAction(trainer.id, "approved")
                            }
                          >
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              handleAction(trainer.id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

        </Card.Body>
      </Card>

      {/* ===============================
         VIEW MODAL
      =============================== */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Trainer Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTrainer && (
            <>
              <p><strong>Name:</strong> {selectedTrainer.name}</p>
              <p><strong>Email:</strong> {selectedTrainer.email}</p>
              <p><strong>Phone:</strong> {selectedTrainer.phone}</p>
              <p><strong>Experience:</strong> {selectedTrainer.experience}</p>
              <p><strong>Bio:</strong> {selectedTrainer.bio}</p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>

          {selectedTrainer?.status === "pending" && (
            <>
              <Button
                variant="danger"
                onClick={() =>
                  handleAction(selectedTrainer.id, "rejected")
                }
              >
                Reject
              </Button>

              <Button
                variant="success"
                onClick={() =>
                  handleAction(selectedTrainer.id, "approved")
                }
              >
                Approve
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}