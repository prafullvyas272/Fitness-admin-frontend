import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, Col, Card, Nav, Button, Modal, Form, Badge, Spinner } from "react-bootstrap";
import { fetchTrainers } from "../../redux/slices/trainerSlice";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  deleteCustomer,
  updateCustomer,
  assignTrainer,
  fetchCustomerQuestionnaire,
} from "../../redux/slices/customerSlice";

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;

  const dispatch = useDispatch();

const { selectedCustomer: customer, loading, questionnaire, questionnaireLoading } = useSelector(
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

// Billing state
const [billingData, setBillingData] = useState(null);
const [billingLoading, setBillingLoading] = useState(false);
const [activating, setActivating] = useState(false);

const fetchBilling = async () => {
  if (!id) return;
  setBillingLoading(true);
  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/admin/customers/${id}/subscription`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (res.ok) setBillingData(data.data || null);
  } catch (err) {
    console.error("Failed to fetch billing:", err);
  } finally {
    setBillingLoading(false);
  }
};

const handleActivatePlan = async () => {
  const planId = billingData?.assignedTrainer?.plan?.id;
  if (!planId) return;
  if (!confirm("Activate this plan for the customer?")) return;
  setActivating(true);
  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/admin/customers/${id}/activate-plan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      }
    );
    const data = await res.json();
    if (res.ok) {
      alert("Plan activated successfully ✅");
      fetchBilling();
    } else {
      alert(data.message || "Activation failed");
    }
  } catch (err) {
    alert("Activation failed: " + err.message);
  } finally {
    setActivating(false);
  }
};

useEffect(() => {
  if (id) {
    dispatch(fetchCustomerById(id));
    dispatch(fetchCustomerQuestionnaire(id));
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

const questionMap = [
    { key: "heartCondition", label: "Heart condition or doctor restriction?" },
    { key: "chestPainDuringActivity", label: "Chest pain during activity?" },
    { key: "chestPainLastMonth", label: "Chest pain in last month (rest)?" },
    { key: "dizzinessOrLossOfConsciousness", label: "Dizziness or loss of consciousness?" },
    { key: "boneOrJointProblem", label: "Bone or joint problem?" },
    { key: "bloodPressureMedication", label: "BP or heart medication?" },
    { key: "otherReasonNotToExercise", label: "Any other reason to avoid exercise?" },
    { key: "pregnancyOrRecentBirth", label: "Pregnant or given birth in last 6 months?" },
    { key: "chronicMedicalCondition", label: "Any medical condition (diabetes, asthma etc)?" },
  ];

   const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };


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
      onSelect={(k) => {
        setActiveTab(k);
        if (k === "billing") fetchBilling();
      }}
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
          {billingLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading billing info...
            </div>
          ) : !billingData ? (
            <div className="text-center text-muted py-5">No billing data found.</div>
          ) : (
            <>
              {/* Current Subscription */}
              <h6 className="fw-bold mb-3">Current Subscription</h6>
              {billingData.subscription ? (
                <div className="p-3 border rounded mb-4">
                  <div className="detail-row">
                    <div>Plan</div>
                    <div className="fw-semibold">{billingData.subscription.plan?.name || "—"}</div>
                  </div>
                  <div className="detail-row">
                    <div>Price</div>
                    <div>€{billingData.subscription.plan?.price ?? "—"}</div>
                  </div>
                  <div className="detail-row">
                    <div>Status</div>
                    <div>
                      {billingData.subscription.status === "ACTIVE" ? (
                        <Badge bg="success">Active</Badge>
                      ) : billingData.subscription.status === "CANCELLED" ? (
                        <Badge bg="danger">Cancelled</Badge>
                      ) : (
                        <Badge bg="secondary">{billingData.subscription.status || "None"}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div>Start Date</div>
                    <div>
                      {billingData.subscription.startDate
                        ? new Date(billingData.subscription.startDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                        : "—"}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div>End Date</div>
                    <div>
                      {billingData.subscription.endDate
                        ? new Date(billingData.subscription.endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                        : "—"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted mb-4 p-3 border rounded bg-light">
                  No active subscription.
                </div>
              )}

              {/* Trainer's Plan */}
              {billingData.assignedTrainer?.plan && (
                <>
                  <h6 className="fw-bold mb-3">Trainer&apos;s Plan</h6>
                  <div className="p-3 border rounded mb-3">
                    <div className="detail-row">
                      <div>Plan Name</div>
                      <div className="fw-semibold">{billingData.assignedTrainer.plan.name}</div>
                    </div>
                    <div className="detail-row">
                      <div>Price</div>
                      <div>€{billingData.assignedTrainer.plan.price}</div>
                    </div>
                    {billingData.assignedTrainer.plan.description && (
                      <div className="detail-row">
                        <div>Description</div>
                        <div>{billingData.assignedTrainer.plan.description}</div>
                      </div>
                    )}
                    {billingData.assignedTrainer.plan.features?.length > 0 && (
                      <div className="detail-row align-items-start">
                        <div>Features</div>
                        <ul className="mb-0 ps-3">
                          {billingData.assignedTrainer.plan.features.map((f, i) => (
                            <li key={i} className="small text-muted">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {billingData.canActivate && (
                      <div className="mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={activating}
                          onClick={handleActivatePlan}
                        >
                          {activating ? (
                            <><Spinner animation="border" size="sm" className="me-2" />Activating...</>
                          ) : (
                            "Activate Plan"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
       {activeTab === "questionaries" && (
                    <>
                      <h5 className="mb-4">PAR-Q Questionnaire</h5>

                      {questionnaireLoading ? (
                        <div className="text-muted py-4 text-center">Loading questionnaire...</div>

                      ) : !questionnaire ? (
                        <div className="text-muted py-4 text-center">
                          No questionnaire submitted yet.
                        </div>

                      ) : (
                        <div className="questionnaire-box">

                          {/* Client info row */}
                          <div className="detail-row mb-3">
                            <div className="text-muted">Client Name</div>
                            <div>{customer.firstName} {customer.lastName}</div>
                          </div>
                          <div className="detail-row mb-4">
                            <div className="text-muted">Date of Birth</div>
                            <div>{formatDate(questionnaire.dateOfBirth)}</div>
                          </div>

                          {/* Dynamic questions */}
                          {questionMap.map((item) => (
                            <div key={item.key} className="question-row">
                              <div className="question-text">{item.label}</div>
                              <div className={`answer-badge ${questionnaire[item.key] ? "answer-yes" : "answer-no"}`}>
                                {questionnaire[item.key] ? "Yes" : "No"}
                              </div>
                            </div>
                          ))}

                          {/* Client Declaration */}
                          <div className="mt-4 p-3 border rounded bg-light">
                            <h6>Client Declaration</h6>
                            <p className="text-muted mb-1">
                              I confirm that the information provided is true and complete.
                            </p>

                            <div className="detail-row mt-2">
                              <div>Client Signature</div>
                              <div>{customer.firstName} {customer.lastName}</div>
                            </div>

                            <div className="detail-row">
                              <div>Date Signed</div>
                              <div>{formatDate(questionnaire.createdAt)}</div>
                            </div>

                            <div className="detail-row">
                              <div>Trainer Name</div>
                              <div>
                                {customer.assignedTrainers?.[0]?.trainer
                                  ? `${customer.assignedTrainers[0].trainer.firstName} ${customer.assignedTrainers[0].trainer.lastName}`
                                  : customer.assignedTrainers?.[0]?.trainerId
                                  ? reduxTrainers.find(t => t.id === customer.assignedTrainers[0].trainerId)
                                    ? `${reduxTrainers.find(t => t.id === customer.assignedTrainers[0].trainerId).firstName} ${reduxTrainers.find(t => t.id === customer.assignedTrainers[0].trainerId).lastName}`
                                    : "N/A"
                                  : "Not Assigned"}
                              </div>
                            </div>

                            <div className="detail-row">
                              <div>Trainer Signature</div>
                              <div>
                                {customer.assignedTrainers?.[0]?.trainer
                                  ? `${customer.assignedTrainers[0].trainer.firstName} ${customer.assignedTrainers[0].trainer.lastName}`
                                  : customer.assignedTrainers?.[0]?.trainerId
                                  ? reduxTrainers.find(t => t.id === customer.assignedTrainers[0].trainerId)
                                    ? `${reduxTrainers.find(t => t.id === customer.assignedTrainers[0].trainerId).firstName} ${reduxTrainers.find(t => t.id === customer.assignedTrainers[0].trainerId).lastName}`
                                    : "N/A"
                                  : "Not Assigned"}
                              </div>
                            </div>
                          </div>

                        </div>
                      )}
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