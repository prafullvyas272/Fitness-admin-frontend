import { useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { useRouter } from "next/router";

export default function CreateCustomer() {
  const router = useRouter();

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    company: "",
    designation: "",
    website: "",
    vat: "",
    address: "",
    membership: "Basic",
    status: "Active",
  });

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const existing =
      JSON.parse(localStorage.getItem("gymCustomers")) || [];

    const newCustomer = {
      ...customer,
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [...existing, newCustomer];
    localStorage.setItem("gymCustomers", JSON.stringify(updated));

    router.push("/customers");
  };

  return (
    <div className="p-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">

          {/* HEADER */}
          <Row className="mb-4 align-items-center">
            <Col>
              <h3 className="fw-bold">Create New Customer</h3>
              <small className="text-muted">
                Fill in the information carefully
              </small>
            </Col>

            <Col className="text-end">
              <Button variant="primary" onClick={handleSubmit}>
                Save Customer
              </Button>
            </Col>
          </Row>

          <Row>

            {/* LEFT SIDE - PROFILE */}
            <Col md={4}>
              <Card className="border-0 shadow-sm p-3 text-center">
                <div className="mb-3">
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: "#f1f3f7",
                      margin: "0 auto",
                    }}
                  ></div>
                </div>
                <Button variant="light" size="sm">
                  Upload Avatar
                </Button>
                <p className="text-muted mt-2 small">
                  PNG, JPG (Max 2MB)
                </p>
              </Card>
            </Col>

            {/* RIGHT SIDE - FORM */}
            <Col md={8}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    placeholder="Enter full name"
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    placeholder="Phone number"
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    name="company"
                    placeholder="Company name"
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Designation</Form.Label>
                  <Form.Control
                    name="designation"
                    placeholder="Designation"
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Membership</Form.Label>
                  <Form.Select
                    name="membership"
                    onChange={handleChange}
                  >
                    <option>Basic</option>
                    <option>Premium</option>
                    <option>VIP</option>
                  </Form.Select>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    onChange={handleChange}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </Form.Select>
                </Col>

                <Col md={12} className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    placeholder="Enter address"
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Col>

          </Row>

        </Card.Body>
      </Card>
    </div>
  );
}
