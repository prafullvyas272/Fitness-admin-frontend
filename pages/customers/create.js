import { useState } from "react";
import { Card, Row, Col, Form, Button, Nav } from "react-bootstrap";
import { useRouter } from "next/router";

export default function CreateCustomer() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  const [customer, setCustomer] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "Active",
  avatarFile: null,
});



  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      alert("Session expired");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", customer.firstName);
    formData.append("lastName", customer.lastName);
    formData.append("email", customer.email);
    formData.append("phone", customer.phone);

    // Only send avatar if selected
    if (customer.avatarFile) {
      formData.append("avatar", customer.avatarFile);
    }

    const response = await fetch(
      "https://fitness-app-seven-beryl.vercel.app/api/customers",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Customer creation failed");
    }

    alert("Customer created successfully ✅");
    router.push("/customers");

  } catch (error) {
    alert(error.message);
  }
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
  <div className="avatar-wrapper text-center">

    <div
      className="avatar-container"
      onClick={() => document.getElementById("avatarInput").click()}
    >
      <img
  src={
    customer.avatarUrl
      ? customer.avatarUrl
      : customer.avatar
      ? `https://fitness-app-seven-beryl.vercel.app/${customer.avatar}`
      : "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
  }
  alt="avatar"
  style={{
    width: 150,
    height: 150,
    objectFit: "cover",
    borderRadius: "50%",
  }}
/>

      <div className="avatar-overlay">
        <span>Upload Photo</span>
      </div>
    </div>

    <input
      type="file"
      id="avatarInput"
      accept="image/*"
      hidden
      onChange={(e) =>
        setCustomer({
          ...customer,
          avatarFile: e.target.files[0],
        })
      }
    />

    <p className="text-muted small mt-3">
      Avatar size 150x150 <br />
      PNG, JPG (Max 2MB)
    </p>
  </div>
</Col>

              {/* RIGHT FORM */}
              <Col md={8}>
                <Row>

                  <Col md={6} className="mb-3">
  <Form.Label>First Name</Form.Label>
  <div className="input-icon">
    <i className="fe fe-user"></i>
    <Form.Control
      name="firstName"
      placeholder="First name"
      onChange={handleChange}
    />
  </div>
</Col>

<Col md={6} className="mb-3">
  <Form.Label>Last Name</Form.Label>
  <div className="input-icon">
    <i className="fe fe-user"></i>
    <Form.Control
      name="lastName"
      placeholder="Last name"
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

                  {/* <Col md={6} className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <div className="input-icon">
                      <i className="fe fe-link"></i>
                      <Form.Control
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                      />
                    </div>
                  </Col> */}

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

                  {/* <Col md={6} className="mb-3">
                    <Form.Label>Membership</Form.Label>
                    <Form.Select name="membership" onChange={handleChange}>
                      <option>Basic</option>
                      <option>Premium</option>
                      <option>VIP</option>
                    </Form.Select>
                  </Col> */}

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
