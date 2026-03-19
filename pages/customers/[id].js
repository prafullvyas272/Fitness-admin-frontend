import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, Col, Card, Nav, Button, Modal, Form } from "react-bootstrap";
import { fetchTrainers } from "../../redux/slices/trainerSlice";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  deleteCustomer,
  updateCustomer,
  assignTrainer
} from "../../redux/slices/customerSlice";

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;

  const dispatch = useDispatch();

const { selectedCustomer: customer, loading } = useSelector(
  (state) => state.customers
);

  const [activeTab, setActiveTab] = useState("overview");

  const [showEdit, setShowEdit] = useState(false);
const [showAssign, setShowAssign] = useState(false);

const [editData, setEditData] = useState({});
// const [trainers, setTrainers] = useState([]);
const [selectedTrainer, setSelectedTrainer] = useState("");
const [trainerSearch, setTrainerSearch] = useState("");

const { trainers: reduxTrainers } = useSelector(
  (state) => state.trainers
);

useEffect(() => {
  if (id) {
    dispatch(fetchCustomerById(id));
  }
}, [id, dispatch]);

useEffect(() => {
  dispatch(fetchTrainers());
}, [dispatch]);

  

  useEffect(() => {
  if (customer) {
    setEditData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      isActive: customer.isActive,
    });
  }
}, [customer]);

  /* ===============================
     DELETE CUSTOMER
  =============================== */
  const handleDelete = async () => {
  if (!confirm("Are you sure?")) return;

  await dispatch(deleteCustomer(customer.id));
  router.push("/customers");
};

  /* ===============================
     EDIT SAVE
  =============================== */
  const handleEditSave = async () => {
  const formData = new FormData();

  formData.append("firstName", editData.firstName);
  formData.append("lastName", editData.lastName);
  formData.append("email", editData.email);
  formData.append("phone", editData.phone);
  formData.append("isActive", editData.isActive);

  await dispatch(
    updateCustomer({
      id: customer.id,
      formData,
    })
  );

  setShowEdit(false);
};

  /* ===============================
     ASSIGN TRAINER SAVE
  =============================== */
  const handleAssignSave = async () => {
  await dispatch(
    assignTrainer({
      trainerId: selectedTrainer,
      customerId: customer.id,
    })
  );

  setShowAssign(false);
};

  const filteredTrainers = reduxTrainers.filter((trainer) =>
  `${trainer.firstName} ${trainer.lastName}`
    .toLowerCase()
    .includes(trainerSearch.toLowerCase())
);

if (loading || !customer) {
  return <div className="p-4">Loading customer...</div>;
}

  return (
    <div className="customer-detail-page p-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">

  {/* Back Button */}
  <Button
    variant="light"
    className="border"
    onClick={() => router.push("/customers")}
  >
    ← Back
  </Button>

  {/* Title */}
  <div>
    <h3 className="fw-bold mb-0">Customer Profile</h3>
    <small className="text-muted">View customer details</small>
  </div>

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
      <Nav.Item>
  <Nav.Link eventKey="questionaries">Questionaries</Nav.Link>
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
  <div>Gender</div>
  <div>
    {customer.gender
      ? customer.gender.charAt(0).toUpperCase() +
        customer.gender.slice(1).toLowerCase()
      : "N/A"}
  </div>
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
      {activeTab === "questionaries" && (
  <>
    <h5 className="mb-4">PAR-Q Questionnaire</h5>

    <div className="questionnaire-box">

      {/* Question Row */}
      {[
        { q: "Heart condition or doctor restriction?", a: "No" },
        { q: "Chest pain during activity?", a: "No" },
        { q: "Chest pain in last month (rest)?", a: "No" },
        { q: "Dizziness or loss of consciousness?", a: "No" },
        { q: "Bone or joint problem?", a: "Yes" },
        { q: "BP or heart medication?", a: "No" },
        { q: "Any other reason to avoid exercise?", a: "No" },
        { q: "Pregnant or given birth in last 6 months?", a: "No" },
        { q: "Any medical condition (diabetes, asthma etc)?", a: "Yes" },
      ].map((item, index) => (
        <div key={index} className="question-row">
          <div className="question-text">{item.q}</div>

          <div
            className={`answer-badge ${
              item.a === "Yes" ? "answer-yes" : "answer-no"
            }`}
          >
            {item.a}
          </div>
        </div>
      ))}

      {/* Declaration */}
      <div className="mt-4 p-3 border rounded bg-light">
        <h6>Client Declaration</h6>
        <p className="text-muted mb-1">
          I confirm that the information provided is true and complete.
        </p>

        <div className="detail-row mt-2">
          <div>Client Signature</div>
          <div>John Doe</div>
        </div>

        <div className="detail-row">
          <div>Date</div>
          <div>12 March 2026</div>
        </div>

        <div className="detail-row">
          <div>Trainer Name</div>
          <div>Rahul Sharma</div>
        </div>
      </div>

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