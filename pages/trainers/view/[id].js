import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Dropdown,
  Form,
  Modal,
} from "react-bootstrap";

export default function TrainerProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [trainer, setTrainer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const trainers =
      JSON.parse(localStorage.getItem("gymTrainers")) || [];

    const customersData =
      JSON.parse(localStorage.getItem("gymCustomers")) || [];

    setAllTrainers(trainers);
    setCustomers(customersData);

    const found = trainers.find((t) => t.id === Number(id));
    setTrainer(found);
  }, [id]);

  if (!trainer) return null;

  /* ================= STATUS BADGE ================= */
  const StatusBadge = ({ status }) => (
    <Badge bg={status === "Active" ? "success" : "danger"}>
      {status}
    </Badge>
  );

  /* ================= ASSIGN TRAINER ================= */
  const openAssignModal = (customer) => {
    setSelectedCustomer(customer);
    setSelectedTrainerId(customer.assignedTrainerId || "");
    setShowModal(true);
  };

  const handleAssignTrainer = () => {
    const updatedCustomers = customers.map((cust) => {
      if (cust.id === selectedCustomer.id) {
        return {
          ...cust,
          assignedTrainerId: selectedTrainerId,
        };
      }
      return cust;
    });

    setCustomers(updatedCustomers);
    localStorage.setItem(
      "gymCustomers",
      JSON.stringify(updatedCustomers)
    );

    setShowModal(false);
  };

  const getTrainerName = (trainerId) => {
    const found = allTrainers.find((t) => t.id === trainerId);
    return found
      ? `${found.firstName} ${found.lastName}`
      : "Not Assigned";
  };

  return (
    <div className="p-4">

      <h3 className="fw-bold mb-4">Trainer Profile</h3>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>

          {/* ================= TABS ================= */}
          <div className="d-flex border-bottom mb-4">
            <div
              onClick={() => setActiveTab("profile")}
              className={`me-4 pb-2 fw-semibold ${
                activeTab === "profile"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
              }`}
              style={{ cursor: "pointer" }}
            >
              Profile
            </div>

            <div
              onClick={() => setActiveTab("customers")}
              className={`pb-2 fw-semibold ${
                activeTab === "customers"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
              }`}
              style={{ cursor: "pointer" }}
            >
              Customer List
            </div>
          </div>

          {/* ================= PROFILE TAB ================= */}
          {activeTab === "profile" && (
            <Row>
              <Col md={4} className="text-center">
                <img
                  src={
                    trainer.avatar ||
                    "https://via.placeholder.com/150"
                  }
                  alt="avatar"
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  className="mb-3"
                />

                <h5 className="fw-bold">
                  {trainer.firstName} {trainer.lastName}
                </h5>

                <p className="text-muted">{trainer.email}</p>

                <StatusBadge status={trainer.status} />
              </Col>

              <Col md={8}>
                <Row className="mb-3">
                  <Col md={4}><strong>Phone:</strong></Col>
                  <Col md={8}>{trainer.phone}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Host Gym:</strong></Col>
                  <Col md={8}>{trainer.hostGymName}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Gym Address:</strong></Col>
                  <Col md={8}>{trainer.hostGymAddress}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Address:</strong></Col>
                  <Col md={8}>{trainer.address}</Col>
                </Row>

                <Row>
                  <Col md={4}><strong>Bio:</strong></Col>
                  <Col md={8}>{trainer.bio}</Col>
                </Row>
              </Col>
            </Row>
          )}

          {/* ================= CUSTOMER TAB ================= */}
          {activeTab === "customers" && (
            <>
              <h5 className="fw-bold mb-3">
                Customer List
              </h5>

              <Table responsive hover className="align-middle">
                <thead className="bg-light">
                  <tr className="text-muted text-uppercase small">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Assigned Trainer</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="fw-semibold">
                        {customer.name}
                      </td>

                      <td className="text-muted">
                        {customer.email}
                      </td>

                      <td>{customer.phone}</td>

                      <td>
                        <StatusBadge status={customer.status} />
                      </td>

                      <td>
                        <span className="badge bg-primary">
                          {getTrainerName(
                            customer.assignedTrainerId
                          )}
                        </span>
                      </td>

                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            openAssignModal(customer)
                          }
                        >
                          Assign Trainer
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

      {/* ================= ASSIGN MODAL ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Trainer</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Select
            value={selectedTrainerId}
            onChange={(e) =>
              setSelectedTrainerId(Number(e.target.value))
            }
          >
            <option value="">Select Trainer</option>
            {allTrainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
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
