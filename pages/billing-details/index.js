import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
  assignPlanToTrainers,
} from "../../redux/slices/billingSlice";

import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge,
} from "react-bootstrap";

export default function BillingDetails() {
  const dispatch = useDispatch();
  const { plans } = useSelector((state) => state.billing);
  const [assignLoading, setAssignLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

  const [assignModal, setAssignModal] = useState(false);
const [selectedPlanId, setSelectedPlanId] = useState(null);
const [selectedTrainers, setSelectedTrainers] = useState([]);
const [trainers, setTrainers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    features: "",
    isPopular: false,
  });

  /* ================================
     FETCH PLANS ON LOAD
  ================================= */
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  /* ================================
     SAVE (CREATE / UPDATE)
  ================================= */
  const handleSave = () => {
    if (editId) {
      dispatch(updatePlan({ id: editId, planData: formData }));
    } else {
      dispatch(createPlan(formData));
    }

    resetForm();
  };

  /* ================================
     EDIT
  ================================= */
  const handleEdit = (plan) => {
    setFormData(plan);
    setEditId(plan.id);
    setShow(true);
  };

  /* ================================
     DELETE
  ================================= */
  const handleDeletePlan = (id) => {
    dispatch(deletePlan(id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      features: "",
      isPopular: false,
    });
    setEditId(null);
    setShow(false);
  };


const openAssignModal = async (planId) => {
  setSelectedPlanId(planId);

  const token = localStorage.getItem("adminToken");
  const res = await axios.get(
    "https://fitness-app-seven-beryl.vercel.app/api/trainers",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const fetchedTrainers = res.data.data;
  setTrainers(fetchedTrainers);

  // Pre-select trainers already assigned to this plan
  const alreadyAssigned = fetchedTrainers
    .filter((trainer) => trainer.plan?.id === planId)
    .map((trainer) => trainer.id);

  setSelectedTrainers(alreadyAssigned);
  setAssignModal(true);
};


const handleTrainerSelect = (trainerId) => {
  setSelectedTrainers((prev) =>
    prev.includes(trainerId)
      ? prev.filter((id) => id !== trainerId)
      : [...prev, trainerId]
  );
};

const handleAssign = async () => {
  try {
    setAssignLoading(true);

    await dispatch(
      assignPlanToTrainers({
        planId: selectedPlanId,
        trainerIds: selectedTrainers,
      })
    );

    setAssignModal(false);
    setSelectedTrainers([]);

  } catch (err) {
    console.log(err);
  } finally {
    setAssignLoading(false);
  }
};

  return (
    <div className="p-4">
      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-1">Membership Plans</h3>
          <small className="text-muted">
            Manage all membership plans
          </small>
        </Col>

        <Col className="text-end d-flex justify-content-end align-items-center gap-2">
          <Button
            variant="primary"
            className="px-4"
            onClick={() => setShow(true)}
          >
            + Create Plan
          </Button>
        </Col>
      </Row>

      {/* PLANS GRID */}
      <Row>
        {plans?.map((plan) => (
          <Col md={4} key={plan.id} className="mb-4">
            <Card className="billing-card shadow-sm border-0 h-100">
              <Card.Body className="d-flex flex-column">
                {plan.isPopular && (
  <div className="popular-badge">
    Most Popular
  </div>
)}

                <h5 className="fw-bold">{plan.name}</h5>

                <h2 className="text-primary fw-bold my-3">
                  ${plan.price}
                </h2>

                <ul className="text-muted plan-features">
                  {plan.features?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

               <div className="d-flex gap-2 mt-auto">
  <Button
    variant="outline-dark"
    className="w-50"
    onClick={() => openAssignModal(plan.id)}
  >
    Assign Trainers
  </Button>

  <Button variant="primary" className="w-50">
    Select Plan
  </Button>
</div>

                <div className="d-flex justify-content-between mt-3">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() =>
                      handleDeletePlan(plan.id)
                    }
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MODAL */}
      <Modal show={show} onHide={resetForm} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Plan" : "Create Plan"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Plan Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Features (comma separated)</Form.Label>
              <Form.Control
                type="text"
                value={formData.features}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    features: e.target.value.split(","),
                  })
                }
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Mark as Most Popular"
              checked={formData.isPopular}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isPopular: e.target.checked,
                })
              }
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={resetForm}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Plan
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={assignModal} onHide={() => setAssignModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Assign Trainers</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {trainers.map((trainer) => (
      <Form.Check
        key={trainer.id}
        type="checkbox"
        label={`${trainer.firstName} ${trainer.lastName}`}
        checked={selectedTrainers.includes(trainer.id)}
        onChange={() => handleTrainerSelect(trainer.id)}
      />
    ))}
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setAssignModal(false)}>
      Cancel
    </Button>
   <Button
  variant="primary"
  onClick={handleAssign}
  disabled={assignLoading}
>
  {assignLoading ? "Assigning..." : "Assign"}
</Button>
  </Modal.Footer>
</Modal>
    </div>
  );
}