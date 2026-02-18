import { Card, Row, Col, Form, Button, Nav } from "react-bootstrap";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CreateCustomer() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState("profile");

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+91", 
    status: "Active",
    avatarFile: null,
    avatarPreview: "",
  });

  /* ===============================
     FETCH CUSTOMER IF EDIT MODE
  =============================== */
  useEffect(() => {
    if (!id) return;

    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const res = await fetch(
          `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setCustomer({
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          phone: data.data.phone,
          status: data.data.isActive ? "Active" : "Inactive",
          avatarFile: null,
          avatarPreview:
            data.data.userProfileDetails?.[0]?.avatarUrl || "",
        });

      } catch (err) {
        console.error(err);
      }
    };

    fetchCustomer();
  }, [id]);

  /* ===============================
     HANDLE CHANGE
  =============================== */
  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  /* ===============================
     SUBMIT (CREATE OR UPDATE)
  =============================== */

  //validation for mail
  const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.(com)$/i;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{7,12}$/;
  return phoneRegex.test(phone);
};



  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        alert("Session expired");
        router.push("/login");
        return;
      }

      if (!validateEmail(customer.email)) {
  alert("Email must be valid and end with .com");
  return;
}

if (!validatePhone(customer.phone)) {
  alert("Phone number must contain only digits (7–12 numbers)");
  return;
}


      const formData = new FormData();

      formData.append("firstName", customer.firstName);
      formData.append("lastName", customer.lastName);
      formData.append("email", customer.email);
      fformData.append(
  "phone",
  `${customer.countryCode}${customer.phone}`
);


      if (!id) {
        // Only required when creating
        formData.append("password", "Customer@123");
      }

      if (customer.avatarFile) {
        formData.append("avatar", customer.avatarFile);
      }

      const url = id
        ? `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}`
        : "https://fitness-app-seven-beryl.vercel.app/api/customers";

      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      alert(id ? "Customer updated ✅" : "Customer created ✅");

      router.push("/customers");

    } catch (error) {
      alert(error.message);
    }
  };

  const hasUnsavedChanges = () => {
  return (
    customer.firstName ||
    customer.lastName ||
    customer.email ||
    customer.phone ||
    customer.avatarFile
  );
};


  return (
    <div className="create-customer-page p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

  <div className="d-flex align-items-center gap-3">
    
    {/* Back Button */}
   <Button
  variant="light"
  className="border"
  onClick={() => {
    if (hasUnsavedChanges()) {
      const confirmLeave = confirm(
        "You have unsaved changes. Are you sure you want to go back?"
      );
      if (!confirmLeave) return;
    }

    router.push("/customers");
  }}
>
  ← Back
</Button>



  </div>

  {/* Submit Button */}
  <Button variant="primary" onClick={handleSubmit}>
    {id ? "Update Customer" : "Create Customer"}
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

              {/* AVATAR */}
              <Col md={4}>
                <div className="avatar-wrapper text-center">

                  <div
                    className="avatar-container"
                    onClick={() =>
                      document.getElementById("avatarInput").click()
                    }
                  >
                    <img
                      src={
                        customer.avatarPreview ||
                        "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setCustomer({
                        ...customer,
                        avatarFile: file,
                        avatarPreview: URL.createObjectURL(file),
                      });
                    }}
                  />

                  <p className="text-muted small mt-3">
                    Avatar size 150x150 <br />
                    PNG, JPG (Max 2MB)
                  </p>
                </div>
              </Col>

              {/* FORM */}
              <Col md={8}>
                <Row>

                  <Col md={6} className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      name="firstName"
                      value={customer.firstName}
                      placeholder="First name"
                      onChange={handleChange}
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      name="lastName"
                      value={customer.lastName}
                      placeholder="Last name"
                      onChange={handleChange}
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={customer.email}
                      placeholder="Email address"
                      onChange={handleChange}
                    />
                  </Col>

<Col md={6} className="mb-3">
  <Form.Label>Phone</Form.Label>

  <div className="d-flex">

    {/* Country Code */}
    <Form.Select
      name="countryCode"
      value={customer.countryCode}
      onChange={handleChange}
      style={{ maxWidth: "120px", marginRight: "8px" }}
    >
      <option value="+91">🇮🇳 +91</option>
      <option value="+1">🇺🇸 +1</option>
      <option value="+44">🇬🇧 +44</option>
      <option value="+971">🇦🇪 +971</option>
      <option value="+61">🇦🇺 +61</option>
    </Form.Select>

    {/* Phone Number */}
    <Form.Control
      name="phone"
      value={customer.phone}
      placeholder="Enter phone number"
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, "");
        setCustomer({ ...customer, phone: value });
      }}
    />
  </div>
</Col>


                  <Col md={6} className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={customer.status}
                      onChange={handleChange}
                    >
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
              <p className="text-muted">
                Billing configuration can be added here.
              </p>
            </div>
          )}

        </Card.Body>
      </Card>
    </div>
  );
}
