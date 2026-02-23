import { Card, Row, Col, Form, Button, Nav } from "react-bootstrap";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  createCustomer,
  updateCustomer,
} from "../../redux/slices/customerSlice";

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

  const dispatch = useDispatch();

const { selectedCustomer, loading } = useSelector(
  (state) => state.customers
);
  /* ===============================
     FETCH CUSTOMER IF EDIT MODE
  =============================== */
  useEffect(() => {
  if (id) {
    dispatch(fetchCustomerById(id));
  }
}, [id]);
  
  useEffect(() => {
  if (selectedCustomer && id) {
    setCustomer({
      firstName: selectedCustomer.firstName || "",
      lastName: selectedCustomer.lastName || "",
      email: selectedCustomer.email || "",
      phone: selectedCustomer.phone || "",
      countryCode: "+91",
      status: selectedCustomer.isActive ? "Active" : "Inactive",
      avatarFile: null,
      avatarPreview:
        selectedCustomer.userProfileDetails?.[0]?.avatarUrl || "",
    });
  }
}, [selectedCustomer]);

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
    if (!validateEmail(customer.email)) {
      alert("Email must be valid and end with .com");
      return;
    }

    if (!validatePhone(customer.phone)) {
      alert("Phone must be 7–12 digits");
      return;
    }

    const payload = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: `${customer.countryCode}${customer.phone}`,
      isActive: customer.status === "Active", // REAL BOOLEAN
    };

    if (!id) {
      payload.password = "Customer@123";
    }

    if (customer.avatarFile) {
      // If avatar exists → use FormData
      const formData = new FormData();

      Object.keys(payload).forEach((key) => {
        formData.append(key, payload[key]);
      });

      formData.append("avatar", customer.avatarFile);

      if (id) {
        await dispatch(updateCustomer({ id, formData }));
      } else {
        await dispatch(createCustomer(formData));
      }

    } else {
      // No avatar → send JSON
      if (id) {
        await dispatch(updateCustomer({ id, payload }));
      } else {
        await dispatch(createCustomer(payload));
      }
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
