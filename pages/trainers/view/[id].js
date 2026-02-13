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

  const fetchTrainerProfile = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch trainer");
      }

      setTrainer(data.data);

    } catch (error) {
      console.error("Profile Fetch Error:", error.message);
      alert(error.message);
    }
  };

  fetchTrainerProfile();
}, [id]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      // Fetch all customers
      const customerRes = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/customers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const customerData = await customerRes.json();

      if (customerRes.ok) {
        setCustomers(customerData.data || []);
      }

      // Fetch all trainers
      const trainerRes = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/trainers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const trainerData = await trainerRes.json();

      if (trainerRes.ok) {
        setAllTrainers(trainerData.data || []);
      }

    } catch (error) {
      console.error("Fetch Error:", error.message);
    }
  };

  fetchData();
}, []);



  if (!trainer) {
    return <div className="p-4">Loading trainer data...</div>;
  }

const StatusBadge = ({ isActive }) => (
  <Badge bg={isActive ? "success" : "danger"}>
    {isActive ? "Active" : "Inactive"}
  </Badge>
);


const assignToThisTrainer = async (customerId) => {
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
          trainerId: trainer.id,
          customerId: customerId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    alert("Customer Assigned ✅");

    // refresh customers
    const updated = customers.map((cust) =>
      cust.id === customerId
        ? { ...cust, assignedTrainerId: trainer.id }
        : cust
    );

    setCustomers(updated);

  } catch (error) {
    alert(error.message);
  }
};
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

const handleDeleteTrainer = async () => {
  if (!confirm("Are you sure?")) return;

  try {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/trainers/${trainer.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    router.push("/trainers");

  } catch (err) {
    alert(err.message);
  }
};

const displayValue = (value) => {
  return value && value !== "" ? value : "N/A";
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
                  src={
    trainer.userProfileDetails?.[0]?.avatarUrl ||
    "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
  }
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

                <StatusBadge isActive={trainer.isActive} />
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
                <h5 className="fw-bold mb-2">Bio:</h5>
                <p className="text-muted mb-4">
                  {displayValue(trainer.userProfileDetails?.[0]?.bio)}
                </p>

                <h5 className="fw-bold mb-2">Profile Details:</h5>

                <Row className="mb-3">
                  <Col md={4}><strong>Full Name:</strong></Col>
                  <Col md={8}>
                    {trainer.firstName} {trainer.lastName}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Phone:</strong></Col>
                  <Col md={8}>{displayValue(trainer.phone)}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Host Gym:</strong></Col>
                  <Col md={8}>{displayValue(trainer.userProfileDetails?.[0]?.hostGymName)}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}><strong>Gym Address:</strong></Col>
                  <Col md={8}>{displayValue(trainer.userProfileDetails?.[0]?.hostGymAddress)}</Col>
                </Row>

                <Row>
                  <Col md={4}><strong>Address:</strong></Col>
                  <Col md={8}>{displayValue(trainer.userProfileDetails?.[0]?.address)}</Col>
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
                      <td className="fw-semibold">{customer.firstName} {customer.lastName}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <StatusBadge isActive={customer.isActive} />
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
  onClick={() => assignToThisTrainer(selectedCustomer.id)}
  disabled={!selectedCustomer}
>
  Assign to This Trainer
</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
