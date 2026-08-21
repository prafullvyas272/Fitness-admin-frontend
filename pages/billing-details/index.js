import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPlans,
  fetchSubscriptionStats,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../redux/slices/billingSlice";
import { Row, Col, Modal, Offcanvas, Form } from "react-bootstrap";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  divider: "#1e1e1e", text: "#ffffff", muted: "#888888", input: "#111111",
  cardBorder: "1px solid #1e1e1e", goldFaint: "rgba(248,227,150,0.07)",
};

const CYCLES = ["Weekly", "Monthly", "Quarterly", "Yearly"];
const CURRENCIES = [
  { code: "EUR", label: "EUR - Euro", symbol: "€" },
  { code: "USD", label: "USD - US Dollar", symbol: "$" },
  { code: "GBP", label: "GBP - British Pound", symbol: "£" },
  { code: "INR", label: "INR - Indian Rupee", symbol: "₹" },
];

export default function BillingDetails() {
  const dispatch = useDispatch();
  const { plans, stats, statsLoading } = useSelector((state) => state.billing);
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
  const [billingView, setBillingView] = useState("Monthly");

  // New state for assigning plans to trainer
  const [assignPlansModal, setAssignPlansModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedPlans, setSelectedPlans] = useState([]);

  const [formData, setFormData] = useState({
    name: "", description: "", cycle: "Monthly", price: "", currency: "EUR",
    features: "", isPopular: false,
  });

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchSubscriptionStats());
  }, [dispatch]);

  const handleSave = async () => {
    if (!formData.name.trim()) { alert("Plan name is required"); return; }
    if (!formData.price) { alert("Price is required"); return; }
    setSavingPlan(true);
    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price) || 0,
        features: formData.features
          ? formData.features.split("\n").map((f) => f.trim()).filter(Boolean)
          : [],
        duration: formData.cycle.toUpperCase(),
        isPopular: formData.isPopular,
      };
      if (editId) {
        await dispatch(updatePlan({ id: editId, planData: payload }));
      } else {
        await dispatch(createPlan(payload));
      }
      dispatch(fetchPlans());
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPlan(false);
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      cycle: plan.duration
        ? plan.duration.charAt(0).toUpperCase() + plan.duration.slice(1).toLowerCase()
        : (plan.cycle || "Monthly"),
      price: plan.price || "",
      currency: plan.currency || "EUR",
      features: Array.isArray(plan.features) ? plan.features.join("\n") : (plan.features || ""),
      isPopular: plan.isPopular || false,
    });
    setEditId(plan.id);
    setShow(true);
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan? This action cannot be undone.")) return;
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
    setFormData({ name: "", description: "", cycle: "Monthly", price: "", currency: "EUR", features: "", isPopular: false });
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

      // Get the selected plan details
      const selectedPlan = plans.find((p) => p.id === planId);

      // Find trainers that already have this plan assigned
      const trainersWithPlan = fetchedTrainers
        .filter((trainer) => trainer.assignedPlans?.some((p) => p.id === planId))
        .map((trainer) => trainer.id);

      setTrainers(fetchedTrainers);
      setSelectedTrainers(trainersWithPlan);
      setAssignModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingTrainers(false);
    }
  };

  const openAssignPlansModal = async (trainer) => {
    setSelectedTrainer(trainer);
    setFetchingTrainers(true);
    try {
      // Initialize selected plans based on trainer's current plans
      let assignedPlanIds = [];

      // Check if trainer has multiple plans assigned (array)
      if (trainer.assignedPlans && Array.isArray(trainer.assignedPlans)) {
        assignedPlanIds = trainer.assignedPlans.map((p) => p.id || p);
      }

      // Fallback: Check single plan field for backward compatibility
      if (assignedPlanIds.length === 0 && trainer.plan?.id) {
        assignedPlanIds = [trainer.plan.id];
      }

      setSelectedPlans(assignedPlanIds);
      setAssignPlansModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingTrainers(false);
    }
  };

  const togglePlanSelection = (planId) => {
    setSelectedPlans((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  const handleAssignPlans = async () => {
    if (!selectedTrainer) return;
    try {
      setAssignLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "https://fitness-app-seven-beryl.vercel.app/api/trainer-plans/assign-multiple",
        { trainerId: selectedTrainer.id, planIds: selectedPlans },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Plans assigned successfully!");
      setAssignPlansModal(false);
      setSelectedTrainer(null);
      setSelectedPlans([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign plans");
      console.error(err);
    } finally {
      setAssignLoading(false);
    }
  };

  const STATS = [
    { label: "Active Subscriptions", value: "1,240" },
    { label: "Total Plans", value: String(plans?.length || 0) },
    { label: "Monthly Revenue", value: "€45,000" },
    { label: "Expiring Plans", value: "84" },
    { label: "Renewals Due", value: "156" },
    { label: "Cancelled", value: "12" },
  ];

  const visiblePlans = plans?.filter((p) => {
    const planDuration = (p.duration || p.cycle || "").toUpperCase();
    return planDuration === billingView.toUpperCase();
  });

  const handleTrainerSelect = (trainerId) => {
    setSelectedTrainers((prev) =>
      prev.includes(trainerId) ? prev.filter((id) => id !== trainerId) : [...prev, trainerId]
    );
  };

  const handleAssign = async () => {
    try {
      setAssignLoading(true);
      const adminToken = localStorage.getItem("adminToken");

      // Get trainers that are NOT already assigned to this plan
      const newlySelectedTrainers = selectedTrainers.filter((trainerId) => {
        const trainer = trainers.find((t) => t.id === trainerId);
        return !trainer?.assignedPlans?.some((p) => p.id === selectedPlanId); // Only include if NOT already assigned
      });

      // If no new trainers to assign, just close modal
      if (newlySelectedTrainers.length === 0) {
        alert("These trainers already have this plan assigned.");
        setAssignModal(false);
        setSelectedTrainers([]);
        return;
      }

      // Call POST API for each trainer (API expects trainerId + planIds array)
      for (let trainerId of newlySelectedTrainers) {
        await axios.post(
          "https://fitness-app-seven-beryl.vercel.app/api/trainer-plans/assign-multiple",
          { trainerId, planIds: [selectedPlanId] },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      }

      alert(`Plan assigned to ${newlySelectedTrainers.length} trainer(s)!`);
      setAssignModal(false);
      setSelectedTrainers([]);
      dispatch(fetchPlans());
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign plan");
      console.error(err);
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

        .offcanvas-gold { background: ${G.card} !important; border-left: 1px solid ${G.divider}; width: 420px !important; }
        .offcanvas-gold .offcanvas-header { border-bottom: 1px solid ${G.divider}; padding: 20px 24px; }
        .offcanvas-gold .offcanvas-title { color: ${G.text}; font-weight: 700; font-size: 18px; }
        .offcanvas-gold .btn-close { filter: invert(1) brightness(0.6); }
        .offcanvas-gold .offcanvas-body { padding: 24px; display: flex; flex-direction: column; }
        .plan-field-label { color: rgba(248,227,150,0.6); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; display: block; }
        .plan-input, .plan-textarea, .plan-select {
          width: 100%; background: ${G.input} !important; border: 1px solid ${G.divider} !important;
          color: ${G.text} !important; border-radius: 8px; padding: 11px 14px; font-size: 14px;
          outline: none; transition: border-color 0.2s; font-family: inherit;
        }
        .plan-input:focus, .plan-textarea:focus, .plan-select:focus { border-color: rgba(248,227,150,0.4) !important; }
        .plan-input::placeholder, .plan-textarea::placeholder { color: #4a4a4a; }
        .plan-textarea { resize: vertical; min-height: 100px; }
        .plan-select option { background: #111111; }
        .cycle-btn {
          flex: 1; padding: 10px 0; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; text-align: center; transition: all 0.15s;
          background: transparent; border: 1px solid ${G.divider}; color: ${G.text};
        }
        .cycle-btn.active { background: ${G.gold}; border-color: ${G.gold}; color: #111; font-weight: 700; }
        .price-prefix-wrap { position: relative; }
        .price-prefix-wrap span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${G.muted}; font-size: 14px; pointer-events: none; }
        .price-prefix-wrap input { padding-left: 30px !important; }
        .plan-publish-btn {
          flex: 1; background: ${G.gold}; border: none; color: #111; padding: 13px 0;
          border-radius: 8px; font-weight: 700; font-size: 13px; letter-spacing: 1px;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .plan-publish-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .plan-reset-btn {
          background: transparent; border: 1px solid ${G.divider}; color: ${G.muted}; padding: 13px 22px;
          border-radius: 8px; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; cursor: pointer;
        }

        .plan-stat-card { background: ${G.card}; border: ${G.cardBorder}; border-radius: 12px; padding: 18px 22px; }
        .plan-stat-label { color: rgba(248,227,150,0.6); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08rem; margin: 0 0 8px; }
        .plan-stat-value { color: ${G.text}; font-weight: 800; font-size: 26px; margin: 0; }

        .cycle-toggle-group { display: inline-flex; background: #111111; border: 1px solid ${G.divider}; border-radius: 10px; padding: 4px; gap: 2px; }
        .cycle-toggle-btn { padding: 8px 22px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; background: transparent; border: none; color: ${G.muted}; transition: all 0.15s; }
        .cycle-toggle-btn.active { background: ${G.gold}; color: #111; font-weight: 700; }

        .plan-card { background: ${G.card}; border: 1px solid ${G.divider}; border-radius: 14px; padding: 26px; display: flex; flex-direction: column; height: 100%; position: relative; }
        .plan-card.featured { border: 1px solid ${G.gold}; }
        .plan-card-icon-btn { width: 28px; height: 28px; border-radius: 6px; background: transparent; border: 1px solid ${G.divider}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .plan-check { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(248,227,150,0.4); color: ${G.gold}; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
        .assign-trainer-btn { width: 100%; padding: 11px 0; border-radius: 8px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; cursor: pointer; text-align: center; }
        .assign-trainer-btn.outline { background: transparent; border: 1px solid ${G.divider}; color: ${G.text}; }
        .assign-trainer-btn.filled { background: ${G.gold}; border: none; color: #111; }
        .form-check-label { color: ${G.text} !important; font-size: 15px; }
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h3 style={{ color: G.text, fontWeight: 700, margin: 0 }}>Membership Plans</h3>
          <small style={{ color: G.muted }}>Manage all membership plans</small>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={async () => {
              setFetchingTrainers(true);
              try {
                const token = localStorage.getItem("adminToken");
                const res = await axios.get(
                  "https://fitness-app-seven-beryl.vercel.app/api/trainers",
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setTrainers(res.data.data || []);
              } catch (err) {
                alert("Failed to load trainers");
                console.error(err);
              } finally {
                setFetchingTrainers(false);
              }
              setAssignPlansModal(true);
              setSelectedTrainer(null);
              setSelectedPlans([]);
            }}
            style={{ background: `rgba(248,227,150,0.15)`, border: `1px solid ${G.divider}`, color: G.goldLight, padding: "8px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >
            📋 Assign Plans
          </button>
          <button
            onClick={() => setShow(true)}
            style={{ background: `${G.gold}`, border: "none", color: "#111", padding: "8px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >
            + Create Plan
          </button>
        </div>
      </div>

      {/* 3 STAT BOXES */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="plan-stat-card" style={{ borderLeft: `4px solid ${G.gold}` }}>
            <p className="plan-stat-label">Active Subscriptions</p>
            <h3 className="plan-stat-value" style={{ color: statsLoading ? G.muted : G.text }}>
              {statsLoading ? "—" : (stats?.activeSubscriptions || 0).toLocaleString()}
            </h3>
          </div>
        </Col>
        <Col md={4}>
          <div className="plan-stat-card" style={{ borderLeft: `4px solid ${G.gold}` }}>
            <p className="plan-stat-label">Total Plans</p>
            <h3 className="plan-stat-value" style={{ color: statsLoading ? G.muted : G.text }}>
              {statsLoading ? "—" : (stats?.totalPlans || 0)}
            </h3>
          </div>
        </Col>
        <Col md={4}>
          <div className="plan-stat-card" style={{ borderLeft: `4px solid ${G.gold}` }}>
            <p className="plan-stat-label">Expiring Plans (30 Days)</p>
            <h3 className="plan-stat-value" style={{ color: statsLoading ? G.muted : G.text }}>
              {statsLoading ? "—" : (stats?.expiringPlans || 0)}
            </h3>
          </div>
        </Col>
      </Row>

      {/* CYCLE TOGGLE */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <div className="cycle-toggle-group">
          {CYCLES.map((c) => (
            <button
              key={c}
              className={`cycle-toggle-btn ${billingView === c ? "active" : ""}`}
              onClick={() => setBillingView(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* PLANS GRID */}
      <Row>
        {visiblePlans?.map((plan) => (
          <Col md={4} key={plan.id} className="mb-4">
            <div className={`plan-card ${plan.isPopular ? "featured" : ""}`}>

              {/* TOP ROW: NAME + EDIT/DELETE */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h5 style={{ color: plan.isPopular ? G.goldLight : G.text, fontWeight: 700, margin: 0 }}>{plan.name}</h5>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="plan-card-icon-btn" onClick={() => handleEdit(plan)}>
                    <i className="fe fe-edit-2" style={{ color: G.goldLight, fontSize: 12 }} />
                  </button>
                  <button className="plan-card-icon-btn" onClick={() => handleDeletePlan(plan.id)}>
                    <i className="fe fe-trash-2" style={{ color: "#f87171", fontSize: 12 }} />
                  </button>
                </div>
              </div>

              {/* PRICE */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 18 }}>
                <span style={{ color: plan.isPopular ? G.goldLight : G.text, fontSize: 20, fontWeight: 700 }}>€</span>
                <span style={{ color: plan.isPopular ? G.goldLight : G.text, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{plan.price}</span>
                <span style={{ color: G.muted, fontSize: 13, fontStyle: "italic" }}>/mo</span>
              </div>

              {/* FEATURES */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px 0", flex: 1 }}>
                {plan.features?.map((item, i) => (
                  <li key={i} style={{ color: G.text, fontSize: 13, padding: "5px 0", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span className="plan-check" style={{ marginTop: 2 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* ASSIGN TRAINER */}
              <button
                onClick={() => openAssignModal(plan.id)}
                className={`assign-trainer-btn ${plan.isPopular ? "filled" : "outline"}`}
              >
                ASSIGN TRAINER
              </button>
            </div>
          </Col>
        ))}
      </Row>

      {/* CREATE / EDIT PLAN PANEL */}
      <Offcanvas show={show} onHide={resetForm} placement="end" className="offcanvas-gold">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{editId ? "Edit Plan" : "Create Plan"}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>

          {/* PLAN NAME */}
          <div style={{ marginBottom: 20 }}>
            <label className="plan-field-label">Plan Name</label>
            <input
              className="plan-input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Apex Performance v4"
            />
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: 20 }}>
            <label className="plan-field-label">Description</label>
            <textarea
              className="plan-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail the methodology, expected outcomes, and curriculum..."
            />
          </div>

          {/* FEATURES */}
          <div style={{ marginBottom: 20 }}>
            <label className="plan-field-label">Features <span style={{ color: G.muted, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(one per line)</span></label>
            <textarea
              className="plan-textarea"
              rows={4}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder={"Unlimited sessions\nPersonal diet plan\n24/7 support"}
            />
          </div>

          {/* DURATION CYCLE */}
          <div style={{ marginBottom: 20 }}>
            <label className="plan-field-label">Duration Cycle</label>
            <div style={{ display: "flex", gap: 8 }}>
              {CYCLES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`cycle-btn ${formData.cycle === c ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, cycle: c })}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* BASE PRICE + CURRENCY */}
          <Row className="mb-1">
            <Col xs={6}>
              <label className="plan-field-label">Base Price</label>
              <div className="price-prefix-wrap">
                <span>{CURRENCIES.find((c) => c.code === formData.currency)?.symbol || "€"}</span>
                <input
                  className="plan-input"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </Col>
            <Col xs={6}>
              <label className="plan-field-label">Currency</label>
              <div className="plan-select" style={{ display: "flex", alignItems: "center", cursor: "default", userSelect: "none" }}>
                EUR - Euro
              </div>
            </Col>
          </Row>

          {/* FOOTER ACTIONS */}
          <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 24 }}>
            <button className="plan-publish-btn" onClick={handleSave} disabled={savingPlan}>
              <i className="fe fe-upload" style={{ fontSize: 14 }} />
              {savingPlan ? "PUBLISHING..." : "PUBLISH"}
            </button>
            <button className="plan-reset-btn" onClick={resetForm}>
              RESET
            </button>
          </div>

        </Offcanvas.Body>
      </Offcanvas>

      {/* ASSIGN TRAINERS MODAL */}
      <Modal show={assignModal} onHide={() => setAssignModal(false)} centered className="modal-gold" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Assign &quot;{plans?.find((p) => p.id === selectedPlanId)?.name || "Plan"}&quot; to Trainers
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {trainers.length === 0 ? (
            <p style={{ color: G.muted, textAlign: "center", margin: 0 }}>No trainers available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {trainers.map((trainer) => {
                const isSelected = selectedTrainers.includes(trainer.id);
                const isAlreadyAssigned = trainer.plan?.id === selectedPlanId;
                return (
                  <div
                    key={trainer.id}
                    onClick={() => handleTrainerSelect(trainer.id)}
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      border: isSelected ? `2px solid ${G.gold}` : `1px solid ${G.divider}`,
                      background: isSelected ? "rgba(248,227,150,0.08)" : G.input,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      position: "relative",
                    }}
                  >
                    {isAlreadyAssigned && (
                      <span
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 10,
                          background: G.gold,
                          color: "#000",
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                        }}
                      >
                        ✓ ASSIGNED
                      </span>
                    )}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        border: isSelected ? `2px solid ${G.gold}` : `1px solid ${G.divider}`,
                        background: isSelected ? G.gold : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <i className="fe fe-check" style={{ color: "#000", fontSize: 13, fontWeight: 700 }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: G.text, fontWeight: 600, fontSize: 14 }}>
                        {trainer.firstName} {trainer.lastName}
                      </p>
                      <p style={{ margin: "4px 0 0", color: G.muted, fontSize: 12 }}>
                        {trainer.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => setAssignModal(false)}
            style={{
              background: "transparent",
              border: `1px solid ${G.divider}`,
              color: G.text,
              padding: "8px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={assignLoading}
            style={{
              background: selectedTrainers.length > 0 ? G.gold : "#333",
              border: "none",
              color: selectedTrainers.length > 0 ? "#111" : G.muted,
              padding: "8px 20px",
              borderRadius: 8,
              fontWeight: 700,
              cursor: selectedTrainers.length > 0 && !assignLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {assignLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                Assigning...
              </>
            ) : (
              "Assign Trainers"
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ASSIGN PLANS TO TRAINER MODAL */}
      <Modal show={assignPlansModal} onHide={() => setAssignPlansModal(false)} centered className="modal-gold" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedTrainer ? `Assign Plans to ${selectedTrainer.firstName} ${selectedTrainer.lastName}` : "Select Trainer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {!selectedTrainer ? (
            <div>
              <p style={{ color: G.muted, marginBottom: 16 }}>Select a trainer to assign multiple plans:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {trainers.length === 0 ? (
                  <p style={{ color: G.muted, textAlign: "center" }}>Loading trainers...</p>
                ) : (
                  trainers.map((trainer) => (
                    <div
                      key={trainer.id}
                      onClick={() => openAssignPlansModal(trainer)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: `1px solid ${G.divider}`,
                        background: G.input,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,227,150,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = G.input)}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "rgba(248,227,150,0.07)",
                          border: `1px solid ${G.divider}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: G.goldLight,
                          flexShrink: 0,
                        }}
                      >
                        {`${trainer.firstName?.charAt(0)}${trainer.lastName?.charAt(0)}`.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, color: G.text, fontWeight: 600, fontSize: 14 }}>{trainer.firstName} {trainer.lastName}</p>
                        <p style={{ margin: "4px 0 0", color: G.muted, fontSize: 11 }}>{trainer.email || "No email"}</p>
                      </div>
                      <i className="fe fe-chevron-right" style={{ marginLeft: "auto", color: G.muted }} />
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedTrainer(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: G.goldLight,
                  padding: "4px 0",
                  cursor: "pointer",
                  fontSize: 12,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <i className="fe fe-chevron-left" /> Back to Trainers
              </button>
              <p style={{ color: G.muted, marginBottom: 20 }}>Select which plans to assign (checkmark = selected):</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {plans?.map((plan) => {
                  const isSelected = selectedPlans.includes(plan.id);
                  const wasInitiallyAssigned = selectedTrainer.plan?.id === plan.id ||
                    (selectedTrainer.plans && selectedTrainer.plans.some((p) => p.id === plan.id));
                  return (
                    <div
                      key={plan.id}
                      onClick={() => togglePlanSelection(plan.id)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: isSelected ? `2px solid ${G.gold}` : `1px solid ${G.divider}`,
                        background: isSelected ? "rgba(248,227,150,0.08)" : G.input,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        position: "relative",
                      }}
                    >
                      {wasInitiallyAssigned && (
                        <span style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: G.gold,
                          color: "#000",
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontSize: 9,
                          fontWeight: 700,
                        }}>
                          ASSIGNED
                        </span>
                      )}
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          border: isSelected ? `2px solid ${G.gold}` : `1px solid ${G.divider}`,
                          background: isSelected ? G.gold : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <i className="fe fe-check" style={{ color: "#000", fontSize: 12, fontWeight: 700 }} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, color: G.text, fontWeight: 600, fontSize: 13 }}>{plan.name}</p>
                        <p style={{ margin: "4px 0 0", color: G.muted, fontSize: 11 }}>€{plan.price} / {plan.duration?.toLowerCase() || "monthly"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => {
              setAssignPlansModal(false);
              setSelectedTrainer(null);
              setSelectedPlans([]);
            }}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssignPlans}
            disabled={assignLoading || !selectedTrainer}
            style={{
              background: selectedTrainer ? G.gold : "#333",
              border: "none",
              color: selectedTrainer ? "#111" : G.muted,
              padding: "6px 20px",
              borderRadius: 8,
              fontWeight: 700,
              cursor: selectedTrainer && !assignLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {assignLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                Assigning...
              </>
            ) : (
              "Assign Plans"
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
