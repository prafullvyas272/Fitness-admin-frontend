import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
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

  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

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
            <Card className="billing-card shadow-sm border-0">
              <Card.Body>
                {plan.isPopular && (
                  <Badge bg="primary" className="mb-2">
                    Most Popular
                  </Badge>
                )}

                <h5 className="fw-bold">{plan.name}</h5>

                <h2 className="text-primary fw-bold my-3">
                  ${plan.price}
                </h2>

                <ul className="text-muted">
                  {plan.features?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <Button variant="primary" className="w-100 mt-3">
                  Select Plan
                </Button>

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
    </div>
  );
}