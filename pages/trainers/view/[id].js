import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
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
    if (!id) return;

    const trainers =
      JSON.parse(localStorage.getItem("gymTrainers")) || [];

    const customersData =
      JSON.parse(localStorage.getItem("gymCustomers")) || [];

    setAllTrainers(trainers);
    setCustomers(customersData);

    const foundTrainer = trainers.find(
      (t) => String(t.id) === String(id)
    );

    setTrainer(foundTrainer || null);
  }, [id]);

  if (!trainer) {
    return <div className="p-4">Loading trainer data...</div>;
  }

  const StatusBadge = ({ status }) => (
    <Badge bg={status === "Active" ? "success" : "danger"}>
      {status}
    </Badge>
  );

  /* ================= ASSIGN ================= */
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
    const found = allTrainers.find(
      (t) => String(t.id) === String(trainerId)
    );
    return found
      ? `${found.firstName} ${found.lastName}`
      : "Not Assigned";
  };

  /* ================= EDIT & DELETE ================= */

const handleEditTrainer = () => {
  router.push(`/trainers/edit/${trainer.id}`);
};

const handleDeleteTrainer = () => {
  if (!confirm("Are you sure you want to delete this trainer?")) return;

  const updatedTrainers = allTrainers.filter(
    (t) => String(t.id) !== String(trainer.id)
  );

  localStorage.setItem("gymTrainers", JSON.stringify(updatedTrainers));

  router.push("/trainers"); // go back to trainer list
};

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">Trainer Profile</h3>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>

          {/* TABS */}
 {/* ================= NAV TABS ================= */}
<ul className="nav nav-tabs custom-tabs mb-4">

  <li className="nav-item">
    <button
      className={`nav-link ${activeTab === "profile" ? "active fw-semibold" : ""}`}
      onClick={() => setActiveTab("profile")}
    >
      Overview
    </button>
  </li>

  <li className="nav-item">
    <button
      className={`nav-link ${activeTab === "customers" ? "active fw-semibold" : ""}`}
      onClick={() => setActiveTab("customers")}
    >
      Customers ({customers.length})
    </button>
  </li>

</ul>


          {/* ================= PROFILE ================= */}
          {activeTab === "profile" && (
            <Row>

              {/* LEFT SIDE IMAGE */}
              <Col md={4} className="text-center border-end">
                <img
                  src="https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
                  alt="avatar"
                  style={{
                    width: 170,
                    height: 170,
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  className="mb-3"
                />

                <h5 className="fw-bold">
                  {trainer.firstName} {trainer.lastName}
                </h5>

                <p className="text-muted mb-2">
                  {trainer.email}
                </p>

                <StatusBadge status={trainer.status} />
                <div className="d-flex justify-content-center gap-2 mt-4">
  <Button
    variant="outline-danger"
    size="sm"
    onClick={handleDeleteTrainer}
    style={{ minWidth: "100px" }}
  >
    Delete
  </Button>

  <Button
    variant="primary"
    size="sm"
    onClick={handleEditTrainer}
    style={{ minWidth: "120px" }}
  >
    Edit Profile
  </Button>
</div>

              </Col>

              {/* RIGHT SIDE DETAILS */}
              <Col md={8} className="ps-4">

                {/* BIO ON TOP */}
                <h5 className="fw-bold mb-2">Profile About:</h5>
                <p className="text-muted mb-4">
                  {trainer.bio || "No bio available"}
                </p>

                <h6 className="fw-bold mb-3">Profile Details:</h6>

                <Row className="mb-3">
                  <Col md={4}><strong>Full Name:</strong></Col>
                  <Col md={8}>
                    {trainer.firstName} {trainer.lastName}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Phone:</strong></Col>
                  <Col md={8}>{trainer.phone || "-"}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Host Gym:</strong></Col>
                  <Col md={8}>{trainer.hostGym || "-"}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Gym Address:</strong></Col>
                  <Col md={8}>{trainer.gymAddress || "-"}</Col>
                </Row>

                <Row>
                  <Col md={4}><strong>Address:</strong></Col>
                  <Col md={8}>{trainer.address || "-"}</Col>
                </Row>

              </Col>
            </Row>
          )}

          {/* ================= CUSTOMER LIST ================= */}
          {activeTab === "customers" && (
            <>
              <h5 className="fw-bold mb-3">Customer List</h5>

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
                      <td className="fw-semibold">{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <StatusBadge status={customer.status} />
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {getTrainerName(customer.assignedTrainerId)}
                        </span>
                      </td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openAssignModal(customer)}
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

      {/* ================= MODAL ================= */}
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
