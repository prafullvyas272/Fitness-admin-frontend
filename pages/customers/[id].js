import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, Col, Modal, Form, Badge, Spinner } from "react-bootstrap";
import { fetchTrainers } from "../../redux/slices/trainerSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  deleteCustomer,
  updateCustomer,
  assignTrainer,
  fetchCustomerQuestionnaire,
} from "../../redux/slices/customerSlice";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  divider: "#1e1e1e", text: "#ffffff", muted: "#888888", input: "#111111",
  cardBorder: "1px solid #1e1e1e", goldFaint: "rgba(248,227,150,0.07)",
};

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  const { selectedCustomer: customer, loading, questionnaire, questionnaireLoading } = useSelector(
    (state) => state.customers
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [showAssign, setShowAssign] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [trainerSearch, setTrainerSearch] = useState("");

  const { trainers: reduxTrainers } = useSelector((state) => state.trainers);

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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    await dispatch(deleteCustomer(customer.id));
    router.push("/customers");
  };

  const handleAssignSave = async () => {
    await dispatch(assignTrainer({ trainerId: selectedTrainer, customerId: customer.id }));
    setShowAssign(false);
  };

  const filteredTrainers = reduxTrainers.filter((trainer) =>
    `${trainer.firstName} ${trainer.lastName}`.toLowerCase().includes(trainerSearch.toLowerCase())
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
    return new Date(dateStr).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  if (loading || !customer) {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: G.muted, fontSize: 15 }}>Loading customer...</span>
      </div>
    );
  }

  const tabs = ["overview", "billing", "questionaries"];

  const detailRow = (label, value) => (
    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${G.divider}` }}>
      <span style={{ color: G.muted, fontSize: 14 }}>{label}</span>
      <span style={{ color: G.text, fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        .modal-gold .modal-content { background: ${G.card}; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .modal-title { color: ${G.goldLight}; font-weight: 700; }
        .modal-gold .btn-close { filter: invert(1) brightness(0.6); }
        .modal-gold .modal-body { background: ${G.card} !important; }
        .modal-gold .form-control { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; }
        .modal-gold .form-control:focus { background: ${G.input} !important; box-shadow: none !important; }
        .modal-gold .form-control::placeholder { color: #555 !important; }
        .modal-gold .form-check-label { color: ${G.text}; }
      `}</style>

      {/* BACK */}
      <div className="mb-3">
        <button
          onClick={() => router.push("/customers")}
          style={{ background: "transparent", border: "1px solid rgba(248,227,150,0.25)", color: "#f8e396", padding: "6px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
        >
          ← Back
        </button>
      </div>
      <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 20 }}>Customer Profile</h3>

      {/* MAIN CARD */}
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 24 }}>
        <Row>

          {/* LEFT SIDE */}
          <Col md={4} style={{ textAlign: "center", borderRight: `1px solid ${G.divider}`, paddingRight: 24 }}>
            {(customer.userProfileDetails?.[0]?.avatarUrl || customer.avatar) ? (
              <img
                src={customer.userProfileDetails?.[0]?.avatarUrl || customer.avatar}
                alt="avatar"
                style={{ width: 150, height: 150, objectFit: "cover", borderRadius: "50%", border: `3px solid ${G.gold}`, marginBottom: 16 }}
              />
            ) : (
              <div style={{
                width: 150, height: 150, borderRadius: "50%",
                border: `3px solid ${G.gold}`,
                background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", flexShrink: 0,
                boxShadow: `0 0 0 4px rgba(248,227,150,0.08), 0 8px 32px rgba(0,0,0,0.5)`,
              }}>
                <span style={{ fontSize: 52, fontWeight: 800, color: G.gold, letterSpacing: -2, lineHeight: 1 }}>
                  {`${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`.toUpperCase() || "?"}
                </span>
              </div>
            )}

            <h5 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>
              {customer.firstName} {customer.lastName}
            </h5>

            <p style={{ color: G.muted, fontSize: 14, marginBottom: 16 }}>{customer.email}</p>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 20, border: `1px solid ${customer.isActive ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, background: customer.isActive ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: customer.isActive ? "#4ade80" : "#f87171" }}></span>
              <span style={{ color: customer.isActive ? "#4ade80" : "#f87171", fontWeight: 600, fontSize: 13 }}>
                {customer.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button
                onClick={handleDelete}
                style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "6px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                Delete
              </button>
              <button
                onClick={() => router.push(`/customers/create?id=${customer.id}`)}
                style={{ background: `${G.gold}`, border: "none", color: "#111", padding: "6px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
              >
                Edit Profile
              </button>
            </div>
          </Col>

          {/* RIGHT SIDE */}
          <Col md={8} style={{ paddingLeft: 24 }}>

            {/* CUSTOM TAB BAR */}
            <div style={{ display: "flex", borderBottom: `1px solid ${G.divider}`, marginBottom: 20 }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); if (tab === "billing") fetchBilling(); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeTab === tab ? `2px solid ${G.gold}` : "2px solid transparent",
                    color: activeTab === tab ? G.goldLight : G.muted,
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontWeight: activeTab === tab ? 700 : 400,
                    fontSize: 14,
                    textTransform: "capitalize",
                    marginBottom: -1,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div>
                <h5 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 16 }}>Profile Details</h5>
                {detailRow("Full Name", `${customer.firstName} ${customer.lastName}`)}
                {detailRow("Email", customer.email)}
                {detailRow("Phone", customer.phone)}
                {detailRow("Gender", customer.gender ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1).toLowerCase() : "N/A")}
                {detailRow("Assigned Trainer", (() => {
                  const t = customer.assignedTrainers?.[0]?.trainer;
                  if (!t) return "N/A";
                  return `${t.firstName || ""} ${t.lastName || ""}`.trim() || "N/A";
                })())}
              </div>
            )}

            {/* BILLING TAB */}
            {activeTab === "billing" && (
              <div>
                {billingLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: G.muted }}>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading billing info...
                  </div>
                ) : !billingData ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: G.muted }}>No billing data found.</div>
                ) : (
                  <>
                    {/* Current Subscription */}
                    <h6 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 12 }}>Current Subscription</h6>
                    {billingData.subscription ? (
                      <div style={{ border: `1px solid ${G.divider}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
                        {detailRow("Plan", billingData.subscription.plan?.name || "—")}
                        {detailRow("Price", `€${billingData.subscription.plan?.price ?? "—"}`)}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${G.divider}` }}>
                          <span style={{ color: G.muted, fontSize: 14 }}>Status</span>
                          <span>
                            {billingData.subscription.status === "ACTIVE" ? (
                              <Badge bg="success">Active</Badge>
                            ) : billingData.subscription.status === "CANCELLED" ? (
                              <Badge bg="danger">Cancelled</Badge>
                            ) : (
                              <Badge bg="secondary">{billingData.subscription.status || "None"}</Badge>
                            )}
                          </span>
                        </div>
                        {detailRow("Start Date", billingData.subscription.startDate ? new Date(billingData.subscription.startDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "—")}
                        {detailRow("End Date", billingData.subscription.endDate ? new Date(billingData.subscription.endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "—")}
                      </div>
                    ) : (
                      <div style={{ border: `1px solid ${G.divider}`, borderRadius: 10, padding: 16, marginBottom: 20, color: G.muted, fontSize: 14 }}>
                        No active subscription.
                      </div>
                    )}

                    {/* Trainer's Plan */}
                    {billingData.assignedTrainer?.plan && (
                      <>
                        <h6 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 12 }}>Trainer&apos;s Plan</h6>
                        <div style={{ border: `1px solid ${G.divider}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                          {detailRow("Plan Name", billingData.assignedTrainer.plan.name)}
                          {detailRow("Price", `€${billingData.assignedTrainer.plan.price}`)}
                          {billingData.assignedTrainer.plan.description && detailRow("Description", billingData.assignedTrainer.plan.description)}
                          {billingData.assignedTrainer.plan.features?.length > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${G.divider}` }}>
                              <span style={{ color: G.muted, fontSize: 14 }}>Features</span>
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {billingData.assignedTrainer.plan.features.map((f, i) => (
                                  <li key={i} style={{ color: G.muted, fontSize: 13 }}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {billingData.canActivate && (
                            <div style={{ marginTop: 16 }}>
                              <button
                                disabled={activating}
                                onClick={handleActivatePlan}
                                style={{ background: activating ? "#333" : `${G.gold}`, border: "none", color: activating ? G.muted : "#111", padding: "6px 20px", borderRadius: 8, fontWeight: 700, cursor: activating ? "not-allowed" : "pointer", fontSize: 13 }}
                              >
                                {activating ? (<><Spinner animation="border" size="sm" className="me-2" />Activating...</>) : "Activate Plan"}
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* QUESTIONARIES TAB */}
            {activeTab === "questionaries" && (
              <div>
                <h5 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 16 }}>PAR-Q Questionnaire</h5>

                {questionnaireLoading ? (
                  <div style={{ color: G.muted, textAlign: "center", padding: "40px 0" }}>Loading questionnaire...</div>
                ) : !questionnaire ? (
                  <div style={{ color: G.muted, textAlign: "center", padding: "40px 0" }}>No questionnaire submitted yet.</div>
                ) : (
                  <div>
                    {detailRow("Client Name", `${customer.firstName} ${customer.lastName}`)}
                    {detailRow("Date of Birth", formatDate(questionnaire.dateOfBirth))}

                    <div style={{ marginTop: 16 }}>
                      {questionMap.map((item) => (
                        <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid rgba(248,227,150,0.07)` }}>
                          <span style={{ color: G.text, fontSize: 13 }}>{item.label}</span>
                          <span style={{
                            padding: "2px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                            background: questionnaire[item.key] ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.15)",
                            color: questionnaire[item.key] ? "#f87171" : "#4ade80",
                            border: `1px solid ${questionnaire[item.key] ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)"}`,
                          }}>
                            {questionnaire[item.key] ? "Yes" : "No"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Client Declaration */}
                    <div style={{ marginTop: 20, border: `1px solid ${G.divider}`, borderRadius: 10, padding: 16 }}>
                      <h6 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 8 }}>Client Declaration</h6>
                      <p style={{ color: G.muted, fontSize: 13, marginBottom: 12 }}>
                        I confirm that the information provided is true and complete.
                      </p>
                      {detailRow("Client Signature", `${customer.firstName} ${customer.lastName}`)}
                      {detailRow("Date Signed", formatDate(questionnaire.createdAt))}
                      {detailRow("Trainer Name", (() => {
                        if (customer.assignedTrainers?.[0]?.trainer) {
                          return `${customer.assignedTrainers[0].trainer.firstName} ${customer.assignedTrainers[0].trainer.lastName}`;
                        }
                        if (customer.assignedTrainers?.[0]?.trainerId) {
                          const t = reduxTrainers.find(t => t.id === customer.assignedTrainers[0].trainerId);
                          return t ? `${t.firstName} ${t.lastName}` : "N/A";
                        }
                        return "Not Assigned";
                      })())}
                      {detailRow("Trainer Signature", (() => {
                        if (customer.assignedTrainers?.[0]?.trainer) {
                          return `${customer.assignedTrainers[0].trainer.firstName} ${customer.assignedTrainers[0].trainer.lastName}`;
                        }
                        if (customer.assignedTrainers?.[0]?.trainerId) {
                          const t = reduxTrainers.find(t => t.id === customer.assignedTrainers[0].trainerId);
                          return t ? `${t.firstName} ${t.lastName}` : "N/A";
                        }
                        return "Not Assigned";
                      })())}
                    </div>
                  </div>
                )}
              </div>
            )}

          </Col>
        </Row>
      </div>

      {/* ASSIGN MODAL */}
      <Modal show={showAssign} onHide={() => setShowAssign(false)} centered className="modal-gold">
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
          <div style={{ maxHeight: 250, overflowY: "auto" }}>
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
          <button
            onClick={() => setShowAssign(false)}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssignSave}
            disabled={!selectedTrainer}
            style={{ background: selectedTrainer ? `${G.gold}` : "#333", border: "none", color: selectedTrainer ? "#111" : G.muted, padding: "6px 20px", borderRadius: 8, fontWeight: 700, cursor: selectedTrainer ? "pointer" : "not-allowed" }}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
