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

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setCustomer(data.data);

    } catch (err) {
      console.error(err);
    }
  };

  fetchCustomer();
}, [id]);

  if (!customer) return <div className="p-4">Loading...</div>;

  const handleAssign = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const trainerId = prompt("Enter Trainer ID");

      if (!trainerId) return;

      const res = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/assign-customer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trainerId,
            customerId: customer.id,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Trainer Assigned ✅");

      router.reload(); // refresh data
    } catch (err) {
      alert(err.message);
    }
  };

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
            <div className="profile-avatar text-center mb-3">
 <img
  src={
    customer?.userProfileDetails?.[0]?.avatarUrl ||
    "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
  }
  alt="avatar"
  className="customer-avatar-img"
/>
</div>

<h5 className="fw-bold mb-1">
  {customer.firstName} {customer.lastName}
</h5>

<p className="text-muted mb-3">
  {customer.email}
</p>
            <div className="profile-stats">
              <div>
                <h6>Membership</h6>
                <span>{customer.membership}</span>
              </div>

              <div>
                <h6>Status</h6>
                <span
                  className={
                    customer.status === "Active"
                      ? "text-success"
                      : "text-secondary"
                  }
                >
                  {customer.status}
                </span>
              </div>
            </div>

            <div className="profile-info">
              <p>
                <strong>Phone:</strong> {customer.phone}
              </p>
              <p>
                <strong>Trainer:</strong>{" "}
                {customer.assignedTrainers?.length > 0
                  ? "Assigned"
                  : "Not Assigned"}
              </p>

              <Button size="sm" className="mt-2" onClick={() => handleAssign()}>
                Assign Trainer
              </Button>
            </div>

            <div className="profile-buttons">
              <Button variant="outline-danger" size="sm">
                Delete
              </Button>
              <Button variant="primary" size="sm">
                Edit Profile
              </Button>
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
