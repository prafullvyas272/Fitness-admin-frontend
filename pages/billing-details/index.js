import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../redux/slices/billingSlice";
import { Row, Col, Modal, Form } from "react-bootstrap";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  divider: "#1e1e1e", text: "#ffffff", muted: "#888888", input: "#111111",
  cardBorder: "1px solid #1e1e1e", goldFaint: "rgba(248,227,150,0.07)",
};

export default function BillingDetails() {
  const dispatch = useDispatch();
  const { plans } = useSelector((state) => state.billing);
  const [assignLoading, setAssignLoading] = useState(false);
  const [fetchingTrainers, setFetchingTrainers] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);

  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

  const [assignModal, setAssignModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [formData, setFormData] = useState({
    name: "", price: "", features: "", isPopular: false,
  });

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const handleSave = async () => {
    setSavingPlan(true);
    try {
      if (editId) {
        await dispatch(updatePlan({ id: editId, planData: formData }));
      } else {
        await dispatch(createPlan(formData));
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPlan(false);
    }
  };

  const handleEdit = (plan) => {
    setFormData(plan);
    setEditId(plan.id);
    setShow(true);
  };

  const handleDeletePlan = async (id) => {
    setDeletingPlan(true);
    try {
      await dispatch(deletePlan(id));
      dispatch(fetchPlans());
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingPlan(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", features: "", isPopular: false });
    setEditId(null);
    setShow(false);
  };

  const openAssignModal = async (planId) => {
    setSelectedPlanId(planId);
    setFetchingTrainers(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "https://fitness-app-seven-beryl.vercel.app/api/trainers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedTrainers = res.data.data;
      const unassignedTrainers = fetchedTrainers.filter((trainer) => !trainer.plan);
      setTrainers(unassignedTrainers);
      setSelectedTrainers([]);
      setAssignModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingTrainers(false);
    }
  };

  const handleTrainerSelect = (trainerId) => {
    setSelectedTrainers((prev) =>
      prev.includes(trainerId) ? prev.filter((id) => id !== trainerId) : [...prev, trainerId]
    );
  };

  const handleAssign = async () => {
    try {
      setAssignLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      await axios.put(
        "https://fitness-app-seven-beryl.vercel.app/api/admin-assign-plan",
        { trainerIds: selectedTrainers, planId: selectedPlanId },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setAssignModal(false);
      setSelectedTrainers([]);
      dispatch(fetchPlans());
    } catch (err) {
      console.log(err);
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        .modal-gold .modal-content { background: ${G.card}; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .modal-title { color: ${G.goldLight}; font-weight: 700; }
        .modal-gold .btn-close { filter: invert(1) brightness(0.6); }
        .modal-gold .form-control, .modal-gold .form-select { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; }
        .modal-gold .form-control:focus, .modal-gold .form-select:focus { background: ${G.input} !important; box-shadow: none !important; border-color: ${G.gold} !important; }
        .modal-gold .form-control::placeholder { color: #555 !important; }
        .modal-gold .form-label { color: ${G.muted}; font-size: 13px; font-weight: 600; }
        .modal-gold .form-check-label { color: ${G.text}; font-size: 14px; }
        .modal-gold .form-check-input { background-color: #333; border-color: ${G.divider}; }
        .modal-gold .form-check-input:checked { background-color: ${G.gold}; border-color: ${G.gold}; }
        .modal-gold .modal-body { background: ${G.card} !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* FULL-SCREEN LOADER */}
      {(fetchingTrainers || assignLoading || savingPlan || deletingPlan) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, border: `5px solid rgba(248,227,150,0.2)`, borderTop: `5px solid ${G.gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: G.goldLight }}>
            {fetchingTrainers ? "Loading trainers..." : savingPlan ? "Saving plan..." : deletingPlan ? "Deleting plan..." : "Assigning plan..."}
          </p>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h3 style={{ color: G.goldLight, fontWeight: 700, margin: 0 }}>Membership Plans</h3>
          <small style={{ color: G.muted }}>Manage all membership plans</small>
        </div>
        <button
          onClick={() => setShow(true)}
          style={{ background: `${G.gold}`, border: "none", color: "#111", padding: "8px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
        >
          + Create Plan
        </button>
      </div>

      {/* PLANS GRID */}
      <Row>
        {plans?.map((plan) => (
          <Col md={4} key={plan.id} className="mb-4">
            <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", height: "100%", position: "relative", overflow: "hidden" }}>

              {/* MOST POPULAR BADGE */}
              {plan.isPopular && (
                <div style={{ position: "absolute", top: 16, right: 16, background: `${G.gold}`, color: "#111", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5 }}>
                  Most Popular
                </div>
              )}

              {/* PLAN NAME */}
              <h5 style={{ color: G.text, fontWeight: 700, marginBottom: 8 }}>{plan.name}</h5>

              {/* PRICE */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: G.goldLight, fontSize: 32, fontWeight: 800 }}>€{plan.price}</span>
                <span style={{ color: G.muted, fontSize: 13 }}> / month</span>
              </div>

              {/* FEATURES */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", flex: 1 }}>
                {plan.features?.map((item, i) => (
                  <li key={i} style={{ color: G.muted, fontSize: 13, padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: G.gold, fontSize: 16, lineHeight: 1 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* PRIMARY ACTIONS */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => openAssignModal(plan.id)}
                  style={{ flex: 1, background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "8px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  Assign Trainers
                </button>
                <button
                  style={{ flex: 1, background: `${G.gold}`, border: "none", color: "#111", padding: "8px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                >
                  Select Plan
                </button>
              </div>

              {/* SECONDARY ACTIONS */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => handleEdit(plan)}
                  style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.muted, padding: "5px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "5px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                >
                  Delete
                </button>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* CREATE / EDIT PLAN MODAL */}
      <Modal show={show} onHide={resetForm} centered className="modal-gold">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Plan" : "Create Plan"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Plan Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Pro Plan"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="e.g. 49"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Features (comma separated)</Form.Label>
              <Form.Control
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value.split(",") })}
                placeholder="e.g. Unlimited access, 1-on-1 sessions"
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Mark as Most Popular"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={resetForm}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savingPlan}
            style={{ background: `${G.gold}`, border: "none", color: "#111", padding: "6px 20px", borderRadius: 8, fontWeight: 700, cursor: savingPlan ? "not-allowed" : "pointer", opacity: savingPlan ? 0.7 : 1 }}
          >
            {savingPlan ? "Saving..." : "Save Plan"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ASSIGN TRAINERS MODAL */}
      <Modal show={assignModal} onHide={() => setAssignModal(false)} centered className="modal-gold">
        <Modal.Header closeButton>
          <Modal.Title>Assign Trainers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {trainers.length === 0 ? (
            <p style={{ color: G.muted, textAlign: "center", margin: 0 }}>No unassigned trainers available.</p>
          ) : (
            trainers.map((trainer) => (
              <Form.Check
                key={trainer.id}
                type="checkbox"
                label={`${trainer.firstName} ${trainer.lastName}`}
                checked={selectedTrainers.includes(trainer.id)}
                onChange={() => handleTrainerSelect(trainer.id)}
                className="mb-2"
              />
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => setAssignModal(false)}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={assignLoading}
            style={{ background: selectedTrainers.length > 0 ? `${G.gold}` : "#333", border: "none", color: selectedTrainers.length > 0 ? "#111" : G.muted, padding: "6px 20px", borderRadius: 8, fontWeight: 700, cursor: selectedTrainers.length > 0 ? "pointer" : "not-allowed" }}
          >
            {assignLoading ? "Assigning..." : "Assign"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
