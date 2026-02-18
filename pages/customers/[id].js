import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, Col, Card, Nav, Button, Modal, Form } from "react-bootstrap";

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [showEdit, setShowEdit] = useState(false);
const [showAssign, setShowAssign] = useState(false);

const [editData, setEditData] = useState({});
const [trainers, setTrainers] = useState([]);
const [selectedTrainer, setSelectedTrainer] = useState("");
const [trainerSearch, setTrainerSearch] = useState("");


useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch Customer
        const customerRes = await fetch(
          `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const customerData = await customerRes.json();

        if (!customerRes.ok) {
          throw new Error(customerData.message);
        }

        setCustomer(customerData.data);

        // Preselect trainer if assigned
        if (
          customerData.data.assignedTrainers &&
          customerData.data.assignedTrainers.length > 0
        ) {
          setSelectedTrainer(
            customerData.data.assignedTrainers[0].trainerId
          );
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

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  if (!customer) return <div className="p-4">Loading...</div>;

  /* ===============================
     DELETE CUSTOMER
  =============================== */
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/customers/${customer.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      alert("Customer deleted ✅");
      router.push("/customers");

    } catch (error) {
      alert(error.message);
    }
  };

  /* ===============================
     EDIT SAVE
  =============================== */
  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/customers/${customer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: editData.firstName,
            lastName: editData.lastName,
            email: editData.email,
            phone: editData.phone,
            isActive: editData.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("Updated successfully ✅");
      setShowEdit(false);
      router.reload();

    } catch (error) {
      alert(error.message);
    }
  };

  /* ===============================
     ASSIGN TRAINER SAVE
  =============================== */
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
            customerId: customer.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("Trainer Assigned ✅");
      setShowAssign(false);
      router.reload();

    } catch (error) {
      alert(error.message);
    }
  };

  const filteredTrainers = trainers.filter((trainer) =>
    `${trainer.firstName} ${trainer.lastName}`
      .toLowerCase()
      .includes(trainerSearch.toLowerCase())
  );

  return (
    <div className="customer-detail-page p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Customers Profile</h3>
        {/* <Button variant="primary">Create Customer</Button> */}
      </div>

      <Card className="shadow-sm border-0 rounded-3">
  <Card.Body>
    <Row>

  {/* LEFT SIDE */}
  <Col md={4} className="text-center border-end">

    <img
      src={
        customer.avatar ||
        "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
      }
      alt="avatar"
      style={{
        width: 170,
        height: 170,
        objectFit: "cover",
        borderRadius: "50%",
        border: "4px solid #e9ecef",
      }}
      className="mb-3"
    />

    <h5 className="fw-bold">
      {customer.firstName} {customer.lastName}
    </h5>

    <p className="text-muted mb-2">
      {customer.email}
    </p>

    {/* SAME StatusPill STYLE */}
    <div
      className={`status-pill ${
        customer.isActive ? "status-active" : "status-inactive"
      }`}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: customer.isActive
            ? "#22c55e"
            : "#dc3545",
          marginRight: 6,
        }}
      ></span>

      <span className="fw-semibold">
        {customer.isActive ? "Active" : "Inactive"}
      </span>
    </div>

    <div className="d-flex justify-content-center gap-2 mt-4">
      <Button
        variant="outline-danger"
        size="sm"
        onClick={handleDelete}
        style={{ minWidth: "100px" }}
      >
        Delete
      </Button>

      <Button
        variant="primary"
        size="sm"
        onClick={() =>
          router.push(`/customers/create?id=${customer.id}`)
        }
        style={{ minWidth: "120px" }}
      >
        Edit Profile
      </Button>
    </div>

  </Col>


        {/* RIGHT CONTENT BLOCK */}
<Col md={8}>
  <div className="content-card-custom">
    <Nav
      variant="tabs"
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)}
      className="custom-tabs"
    >
      <Nav.Item>
        <Nav.Link eventKey="overview">Overview</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="billing">Billing</Nav.Link>
      </Nav.Item>
    </Nav>

    <div className="tab-content-area">

      {activeTab === "overview" && (
        <>
          <h5 className="mb-3">Profile Details</h5>

          <div className="detail-row">
            <div>Full Name</div>
            <div>{customer.firstName} {customer.lastName}</div>
          </div>

          <div className="detail-row">
            <div>Email</div>
            <div>{customer.email}</div>
          </div>

          <div className="detail-row">
            <div>Phone</div>
            <div>{customer.phone}</div>
          </div>

          <div className="detail-row">
            <div>Assigned Trainer</div>
            <div>
              {customer.assignedTrainers?.length > 0
                ? "Assigned"
                : "Not Assigned"}
            </div>
          </div>
        </>
      )}

      {activeTab === "billing" && (
        <>
          <div className="billing-alert">
            We need your attention! Add Payment Method.
          </div>

          <div className="billing-plan-box">
            <div>
              <h6>Your current plan</h6>
              <p>Gym Premium</p>
            </div>

            <div>
              <h4>₹1999 / Month</h4>
            </div>

            <Button variant="outline-primary" size="sm">
              Update Plan
            </Button>
          </div>
        </>
      )}

    </div>
  </div>
</Col>
          </Row>
  </Card.Body>
</Card>

      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Customer</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Control
        className="mb-3"
        placeholder="First Name"
        value={editData.firstName || ""}
        onChange={(e) =>
          setEditData({ ...editData, firstName: e.target.value })
        }
      />
      <Form.Control
        className="mb-3"
        placeholder="Last Name"
        value={editData.lastName || ""}
        onChange={(e) =>
          setEditData({ ...editData, lastName: e.target.value })
        }
      />
      <Form.Control
        className="mb-3"
        placeholder="Email"
        value={editData.email || ""}
        onChange={(e) =>
          setEditData({ ...editData, email: e.target.value })
        }
      />
      <Form.Control
        className="mb-3"
        placeholder="Phone"
        value={editData.phone || ""}
        onChange={(e) =>
          setEditData({ ...editData, phone: e.target.value })
        }
      />
      <Button onClick={handleEditSave}>Save Changes</Button>
    </Form>
  </Modal.Body>
</Modal>

 {/* ASSIGN MODAL */}
      <Modal show={showAssign} onHide={() => setShowAssign(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Trainer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            placeholder="Search trainer..."
            className="mb-3"
            value={trainerSearch}
            onChange={(e) => setTrainerSearch(e.target.value)}
          />

          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {filteredTrainers.map((trainer) => (
              <Form.Check
                key={trainer.id}
                type="radio"
                label={`${trainer.firstName} ${trainer.lastName}`}
                value={trainer.id}
                checked={selectedTrainer === trainer.id}
                onChange={() => setSelectedTrainer(trainer.id)}
                className="mb-2"
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssign(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignSave}
            disabled={!selectedTrainer}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}