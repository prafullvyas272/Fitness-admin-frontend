import { Row, Col, Form, InputGroup } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import ReactCountryFlag from "react-country-flag";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  createCustomer,
  updateCustomer,
} from "../../redux/slices/customerSlice";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  divider: "#1e1e1e", text: "#ffffff", muted: "#888888", input: "#111111",
  cardBorder: "1px solid #1e1e1e", goldFaint: "rgba(248,227,150,0.07)",
};

export default function CreateCustomer() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState("profile");

  const countryOptions = [
    { code: "+91", country: "IN" },
    { code: "+1", country: "US" },
    { code: "+44", country: "GB" },
    { code: "+971", country: "AE" },
    { code: "+61", country: "AU" },
  ];

  const countryMap = {
    "+971": "AE", "+91": "IN", "+61": "AU", "+44": "GB", "+1": "US",
  };

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+91",
    country: "IN",
    status: "Active",
    gender: "",
    avatarFile: null,
    avatarPreview: "",
  });

  const dispatch = useDispatch();
  const { selectedCustomer, loading } = useSelector((state) => state.customers);

  useEffect(() => {
    if (id) dispatch(fetchCustomerById(id));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedCustomer && id) {
      const knownCodes = ["+971", "+91", "+61", "+44", "+1"];
      const raw = selectedCustomer.phone || "";
      let countryCode = "+91";
      let phoneNumber = raw;
      for (const code of knownCodes) {
        if (raw.startsWith(code)) { countryCode = code; phoneNumber = raw.slice(code.length); break; }
      }
      setCustomer({
        firstName: selectedCustomer.firstName || "",
        lastName: selectedCustomer.lastName || "",
        email: selectedCustomer.email || "",
        phone: phoneNumber,
        countryCode,
        country: countryMap[countryCode] || "IN",
        status: selectedCustomer.isActive ? "Active" : "Inactive",
        gender: selectedCustomer.gender || "",
        avatarFile: null,
        avatarPreview: selectedCustomer.userProfileDetails?.[0]?.avatarUrl || "",
      });
    }
  }, [selectedCustomer]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.(com)$/i.test(email);
  const validatePhone = (phone) => /^[0-9]{7,12}$/.test(phone);

  const handleSubmit = async () => {
    try {
      if (!validateEmail(customer.email)) { alert("Email must be valid and end with .com"); return; }
      if (!validatePhone(customer.phone)) { alert("Phone must be 7–12 digits"); return; }

      const payload = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: `${customer.countryCode}${customer.phone}`,
        isActive: customer.status === "Active",
        gender: customer.gender,
      };

      if (!id) payload.password = "Customer@123";

      if (customer.avatarFile) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
        formData.append("avatar", customer.avatarFile);
        if (id) { await dispatch(updateCustomer({ id, formData })); }
        else { await dispatch(createCustomer(formData)); }
      } else {
        if (id) { await dispatch(updateCustomer({ id, payload })); }
        else { await dispatch(createCustomer(payload)); }
      }

      alert(id ? "Customer updated ✅" : "Customer created ✅");
      router.push("/customers");
    } catch (error) {
      alert(error.message);
    }
  };

  const hasUnsavedChanges = () =>
    customer.firstName || customer.lastName || customer.email || customer.phone || customer.avatarFile;

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        .dk-inp { background: ${G.input} !important; border: none !important; color: ${G.text} !important; }
        .dk-inp:focus { background: ${G.input} !important; color: ${G.text} !important; box-shadow: none !important; }
        .dk-inp::placeholder { color: #555 !important; }
        .dk-inp option { background: #0d0d0d; color: ${G.text}; }
        .dk-ig-text { background: #2a2a2a !important; border: none !important; color: ${G.gold} !important; }
        .dk-ig { background: #222 !important; border: 1px solid ${G.divider} !important; border-radius: 8px !important; overflow: hidden; }
        .dk-ig .form-control { background: ${G.input} !important; border: none !important; color: ${G.text} !important; }
        .dk-ig .form-control:focus { background: ${G.input} !important; box-shadow: none !important; }
        .dk-ig .form-control::placeholder { color: #555 !important; }
        .dk-ddm { background: #1e1e1e !important; border: 1px solid ${G.divider} !important; }
        .dk-ddm .dropdown-item { color: ${G.text} !important; font-size: 13px; }
        .dk-ddm .dropdown-item:hover { background: rgba(248,227,150,0.07) !important; color: ${G.goldLight} !important; }
        .dk-flag-toggle { background: #2a2a2a !important; border: none !important; color: ${G.text} !important; border-right: 1px solid ${G.divider} !important; }
        .dk-flag-toggle:hover, .dk-flag-toggle:focus { background: #333 !important; }
        .dk-label { color: ${G.muted}; font-weight: 600; font-size: 13px; margin-bottom: 6px; display: block; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button
          style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          onClick={() => {
            if (hasUnsavedChanges()) {
              if (!confirm("You have unsaved changes. Are you sure you want to go back?")) return;
            }
            router.push("/customers");
          }}
        >
          ← Back
        </button>

        <h3 style={{ color: G.goldLight, fontWeight: 700, margin: 0 }}>
          {id ? "Edit Customer" : "Create Customer"}
        </h3>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ background: `${G.gold}`, border: "none", color: "#111", padding: "8px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Saving..." : id ? "Update Customer" : "Create Customer"}
        </button>
      </div>

      {/* CARD */}
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 32 }}>

        {/* CUSTOM TABS */}
        <div style={{ display: "flex", borderBottom: `1px solid ${G.divider}`, marginBottom: 28 }}>
          {["profile", "billing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? `2px solid ${G.gold}` : "2px solid transparent",
                color: activeTab === tab ? G.goldLight : G.muted,
                padding: "10px 24px",
                cursor: "pointer",
                fontWeight: activeTab === tab ? 700 : 400,
                fontSize: 14,
                textTransform: "capitalize",
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <Row>
            {/* AVATAR */}
            <Col md={4} style={{ textAlign: "center" }}>
              <div
                className="avatar-circle-wrapper"
                onClick={() => document.getElementById("customerAvatarInput").click()}
                style={{ border: `3px solid ${G.gold}`, margin: "0 auto 12px" }}
              >
                <img
                  src={customer.avatarPreview || "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"}
                  alt="avatar"
                  className="avatar-img"
                />
                <div className="avatar-overlay"><span>Upload Photo</span></div>
                <input
                  type="file"
                  id="customerAvatarInput"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setCustomer({ ...customer, avatarFile: file, avatarPreview: URL.createObjectURL(file) });
                  }}
                />
              </div>
              <p style={{ color: G.muted, fontSize: 12, marginTop: 8 }}>
                Avatar size 150×150<br />PNG, JPG (Max 2MB)
              </p>
            </Col>

            {/* FORM */}
            <Col md={8}>
              <Row>
                <Col md={6} className="mb-3">
                  <label className="dk-label">First Name</label>
                  <InputGroup className="dk-ig">
                    <Form.Control name="firstName" value={customer.firstName} placeholder="First name" onChange={handleChange} />
                  </InputGroup>
                </Col>

                <Col md={6} className="mb-3">
                  <label className="dk-label">Last Name</label>
                  <InputGroup className="dk-ig">
                    <Form.Control name="lastName" value={customer.lastName} placeholder="Last name" onChange={handleChange} />
                  </InputGroup>
                </Col>

                <Col md={6} className="mb-3">
                  <label className="dk-label">Email</label>
                  <InputGroup className="dk-ig">
                    <Form.Control type="email" name="email" value={customer.email} placeholder="Email address" onChange={handleChange} />
                  </InputGroup>
                </Col>

                <Col md={6} className="mb-3">
                  <label className="dk-label">Phone</label>
                  <InputGroup className="dk-ig">
                    <Dropdown>
                      <Dropdown.Toggle className="dk-flag-toggle" style={{ minWidth: 100 }}>
                        <ReactCountryFlag countryCode={customer.country} svg style={{ width: 20, marginRight: 8 }} />
                        {customer.countryCode}
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="dk-ddm">
                        {countryOptions.map((c) => (
                          <Dropdown.Item key={c.code} onClick={() => setCustomer({ ...customer, countryCode: c.code, country: c.country })}>
                            <ReactCountryFlag countryCode={c.country} svg style={{ width: 20, marginRight: 10 }} />{c.code}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                    <Form.Control
                      name="phone"
                      value={customer.phone}
                      placeholder="Phone number"
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, "") })}
                    />
                  </InputGroup>
                </Col>

                <Col md={6} className="mb-3">
                  <label className="dk-label">Status</label>
                  <Form.Select name="status" value={customer.status} onChange={handleChange} className="dk-inp"
                    style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${G.divider}` }}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </Form.Select>
                </Col>

                <Col md={6} className="mb-3">
                  <label className="dk-label">Gender</label>
                  <Form.Select name="gender" value={customer.gender} onChange={handleChange} className="dk-inp"
                    style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${G.divider}` }}>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Form.Select>
                </Col>
              </Row>
            </Col>
          </Row>
        )}

        {/* BILLING TAB */}
        {activeTab === "billing" && (
          <div style={{ padding: "20px 0", color: G.muted }}>
            <h5 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 8 }}>Billing Information</h5>
            <p style={{ color: G.muted, fontSize: 14 }}>Billing configuration can be added here.</p>
          </div>
        )}

      </div>
    </div>
  );
}
