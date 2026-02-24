import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addPlan,
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
  const plans = useSelector((state) => state.billing.plans);

  const [show, setShow] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    features: "",
    popular: false,
  });

  const handleSave = () => {
    if (editIndex !== null) {
      dispatch(updatePlan({ index: editIndex, updatedPlan: formData }));
    } else {
      dispatch(addPlan(formData));
    }

    resetForm();
  };

  const handleEdit = (index) => {
    setFormData(plans[index]);
    setEditIndex(index);
    setShow(true);
  };

  const handleDeletePlan = (index) => {
    dispatch(deletePlan(index));
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", features: "", popular: false });
    setEditIndex(null);
    setShow(false);
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-1">Membership Plans</h3>
          <small className="text-muted">Manage all membership plans</small>
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
        {plans.map((plan, index) => (
          <Col md={4} key={index} className="mb-4">
            <Card className="billing-card shadow-sm border-0">
              <Card.Body>
                {plan.popular && (
                  <Badge bg="primary" className="mb-2">
                    Most Popular
                  </Badge>
                )}

                <h5 className="fw-bold">{plan.name}</h5>

                <h2 className="text-primary fw-bold my-3">
  ${plan.price}
</h2>

                <ul className="text-muted">
                  {plan.features.split(",").map((item, i) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
                </ul>

                <Button variant="primary" className="w-100 mt-3">
                  Select Plan
                </Button>

                <div className="d-flex justify-content-between mt-3">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDeletePlan(index)}
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
            {editIndex !== null ? "Edit Plan" : "Create Plan"}
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
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Features (comma separated)</Form.Label>
              <Form.Control
                type="text"
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Mark as Most Popular"
              checked={formData.popular}
              onChange={(e) =>
                setFormData({ ...formData, popular: e.target.checked })
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