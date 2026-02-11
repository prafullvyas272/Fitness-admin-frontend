import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, Col, Card, Nav, Button } from "react-bootstrap";

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;

    const storedCustomers =
      JSON.parse(localStorage.getItem("gymCustomers")) || [];

    const found = storedCustomers.find((c) => c.id == id);
    setCustomer(found);
  }, [id]);

  if (!customer) return <div className="p-4">Loading...</div>;

  return (
    <div className="customer-detail-page p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Customers / View</h3>
        <Button variant="primary">Create Customer</Button>
      </div>

      <Row>

        {/* LEFT PROFILE BLOCK */}
        <Col md={4}>
          <div className="profile-card-custom">

            <div className="profile-avatar"></div>

            <h5>{customer.name}</h5>
            <p className="text-muted">{customer.email}</p>

            <div className="profile-stats">
              <div>
                <h6>Membership</h6>
                <span>{customer.membership}</span>
              </div>

              <div>
                <h6>Status</h6>
                <span className={
                  customer.status === "Active"
                    ? "text-success"
                    : "text-secondary"
                }>
                  {customer.status}
                </span>
              </div>
            </div>

            <div className="profile-info">
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Trainer:</strong> {customer.assignedTrainer || "-"}</p>
            </div>

            <div className="profile-buttons">
              <Button variant="outline-danger" size="sm">Delete</Button>
              <Button variant="primary" size="sm">Edit Profile</Button>
            </div>

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
            </Nav>

            <div className="tab-content-area">

              {activeTab === "overview" && (
                <>
                  <h5 className="mb-3">Profile Details</h5>

                  <div className="detail-row">
                    <div>Full Name</div>
                    <div>{customer.name}</div>
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
                    <div>Membership</div>
                    <div>{customer.membership}</div>
                  </div>

                  <div className="detail-row">
                    <div>Assigned Trainer</div>
                    <div>{customer.assignedTrainer || "-"}</div>
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

            </div>

          </div>
        </Col>

      </Row>
    </div>
  );
}
