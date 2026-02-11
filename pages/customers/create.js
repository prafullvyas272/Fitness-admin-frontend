import { useState } from "react";
import { Card, Row, Col, Form, Button, Nav } from "react-bootstrap";
import { useRouter } from "next/router";

export default function CreateCustomer() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    company: "",
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

    localStorage.setItem(
      "gymCustomers",
      JSON.stringify([...existing, newCustomer])
    );

    router.push("/customers");
  };

  return (
    <div className="create-customer-page p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Customers / Create</h3>
        <Button variant="primary" onClick={handleSubmit}>
          Create Customer
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>

          {/* TABS */}
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="durulax-tabs mb-4"
          >
            <Nav.Item>
              <Nav.Link eventKey="profile">Profile</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="billing">Billing</Nav.Link>
            </Nav.Item>
          </Nav>

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <Row>

              {/* LEFT AVATAR BLOCK */}
              <Col md={4}>
                <div className="profile-upload-box text-center">
                  <div className="avatar-preview"></div>
                  <Button variant="light" size="sm" className="mt-3">
                    Upload Photo
                  </Button>
                  <p className="text-muted small mt-2">
                    Avatar size 150x150 <br />
                    PNG, JPG (Max 2MB)
                  </p>
                </div>
              </Col>

              {/* RIGHT FORM */}
              <Col md={8}>
                <Row>

                  <Col md={6} className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <div className="input-icon">
                      <i className="fe fe-user"></i>
                      <Form.Control
                        name="name"
                        placeholder="Full name"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <div className="input-icon">
                      <i className="fe fe-mail"></i>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Email address"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <div className="input-icon">
                      <i className="fe fe-link"></i>
                      <Form.Control
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <div className="input-icon">
                      <i className="fe fe-phone"></i>
                      <Form.Control
                        name="phone"
                        placeholder="Phone"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label>Membership</Form.Label>
                    <Form.Select name="membership" onChange={handleChange}>
                      <option>Basic</option>
                      <option>Premium</option>
                      <option>VIP</option>
                    </Form.Select>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" onChange={handleChange}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </Form.Select>
                  </Col>

                </Row>
              </Col>

            </Row>
          )}

          {/* BILLING TAB */}
          {activeTab === "billing" && (
            <div className="billing-box">
              <h5 className="mb-3">Billing Information</h5>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Plan Type</Form.Label>
                  <Form.Select>
                    <option>Basic - ₹999</option>
                    <option>Premium - ₹1999</option>
                    <option>VIP - ₹2999</option>
                  </Form.Select>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </Form.Select>
                </Col>
              </Row>
            </div>
          )}

        </Card.Body>
      </Card>
    </div>
  );
}
