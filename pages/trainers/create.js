import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTrainer } from "../../redux/slices/trainerSlice";
import {
  Form,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useRouter } from "next/router";
import ReactCountryFlag from "react-country-flag";
import Dropdown from "react-bootstrap/Dropdown";


export default function CreateTrainer() {
  const router = useRouter();

const dispatch = useDispatch();
const { loading } = useSelector((state) => state.trainers);

const [trainer, setTrainer] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "+91",
  country: "IN",
  hostGymName: "",
  hostGymAddress: "",
  bio: "",
  gender: "",
  status: "Active",
  avatarFile: null,
  avatarPreview: "",
});



  const handleChange = (e) => {
    setTrainer({
      ...trainer,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setTrainer({
    ...trainer,
    avatarFile: file,
    avatarPreview: URL.createObjectURL(file),
  });
};



  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      alert("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    /* ================= VALIDATIONS ================= */

    if (trainer.phone.length < 10) {
      alert("Phone number must be 10 digits");
      return;
    }

    if (!trainer.email.endsWith(".com")) {
      alert("Email must end with .com");
      return;
    }

    if (trainer.avatarFile) {
      const allowedTypes = ["image/png", "image/jpeg"];
      if (!allowedTypes.includes(trainer.avatarFile.type)) {
        alert("Avatar must be PNG or JPG");
        return;
      }

      if (trainer.avatarFile.size > 2 * 1024 * 1024) {
        alert("Avatar must be less than 2MB");
        return;
      }
    }

    /* ================= FORM DATA ================= */

    const formData = new FormData();
    const fullPhone = trainer.countryCode + trainer.phone;

    formData.append("firstName", trainer.firstName);
    formData.append("lastName", trainer.lastName);
    formData.append("email", trainer.email);
    formData.append("phone", fullPhone);
    formData.append("password", "Trainer@123");
    formData.append("hostGymName", trainer.hostGymName);
    formData.append("hostGymAddress", trainer.hostGymAddress);
    formData.append("bio", trainer.bio);
    formData.append("gender", trainer.gender);

    if (trainer.avatarFile) {
      formData.append("avatar", trainer.avatarFile);
    }

    /* ================= REDUX DISPATCH ================= */

    const resultAction = await dispatch(createTrainer(formData));

    if (createTrainer.fulfilled.match(resultAction)) {
      alert("Trainer created successfully");
      router.push("/trainers");
    } else {
      alert(resultAction.payload || "Failed to create trainer");
    }

  } catch (error) {
    alert(error.message);
  }
};


const countryOptions = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US" },
  { code: "+44", country: "GB" },
  { code: "+61", country: "AU" },
  { code: "+971", country: "AE" },
  { code: "+49", country: "DE" },
  { code: "+51", country: "PE" },
];


  const G = {
    bg:         "#0a0a0a",
    card:       "#0d0d0d",
    cardBorder: "1px solid #1e1e1e",
    gold:       "#f8e396",
    goldLight:  "#f8e396",
    goldFaint:  "rgba(248,227,150,0.07)",
    text:       "#ffffff",
    muted:      "#888888",
    divider:    "#1e1e1e",
    input:      "#111111",
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        .dk-inp { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: #cccccc !important; border-radius: 7px !important; }
        .dk-inp:focus { background: ${G.input} !important; color: #cccccc !important; box-shadow: none !important; border-color: rgba(248,227,150,0.25) !important; }
        .dk-inp::placeholder { color: #2a2a2a !important; }
        .dk-inp option { background: ${G.card}; color: #cccccc; }
        .dk-ig-text { background: #111111 !important; border: none !important; color: ${G.gold} !important; border-right: 1px solid ${G.divider} !important; }
        .dk-ig { background: ${G.input} !important; border: 1px solid ${G.divider} !important; border-radius: 7px !important; }
        .dk-ig .form-control, .dk-ig textarea { background: ${G.input} !important; border: none !important; color: #cccccc !important; }
        .dk-ig .form-control:focus, .dk-ig textarea:focus { background: ${G.input} !important; box-shadow: none !important; border-color: rgba(248,227,150,0.25) !important; }
        .dk-ig .form-control::placeholder, .dk-ig textarea::placeholder { color: #2a2a2a !important; }
        .dk-ddm { background: ${G.card} !important; border: 1px solid ${G.divider} !important; }
        .dk-ddm .dropdown-item { color: ${G.text} !important; font-size: 13px; }
        .dk-ddm .dropdown-item:hover { background: ${G.goldFaint} !important; color: ${G.goldLight} !important; }
        .dk-flag-toggle { background: #111111 !important; border: none !important; color: ${G.text} !important; border-right: 1px solid ${G.divider} !important; }
        .dk-flag-toggle:hover, .dk-flag-toggle:focus { background: #1e1e1e !important; }
        .dk-flag-toggle::after { border-top-color: ${G.muted} !important; }
        .dk-status-toggle { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 7px !important; width: 100%; display: flex !important; align-items: center !important; }
        .dk-status-toggle:hover { background: #1e1e1e !important; }
        .dk-status-toggle::after { border-top-color: ${G.muted} !important; }
        .dk-label { color: ${G.muted}; font-weight: 600; font-size: 14px; }
        .dk-row-divider { border-bottom: 1px solid ${G.divider}; padding-bottom: 20px; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* FULL-SCREEN LOADER */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, border: `5px solid rgba(248,227,150,0.15)`, borderTop: `5px solid ${G.gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: G.goldLight }}>Creating trainer...</p>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button
          style={{ background: "transparent", border: "1px solid rgba(248,227,150,0.25)", color: "#f8e396", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          onClick={() => {
            const isFormFilled = trainer.firstName.trim() || trainer.lastName.trim() || trainer.email.trim() || trainer.phone.trim() || trainer.hostGymName.trim() || trainer.hostGymAddress.trim() || trainer.bio.trim() || trainer.avatarFile;
            if (isFormFilled && !window.confirm("You have unsaved changes. Do you want to go back?")) return;
            router.push("/trainers");
          }}
        >← Back</button>

        <h3 style={{ color: G.text, fontWeight: 700, margin: 0 }}>Create Trainer</h3>

        <button
          type="submit"
          form="createTrainerForm"
          disabled={loading}
          style={{ background: G.gold, border: "none", color: "#000", padding: "8px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating..." : "Create Trainer"}
        </button>
      </div>

      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, padding: 32 }}>
        <Form id="createTrainerForm" onSubmit={handleSubmit}>

          {/* AVATAR */}
          <Row className="mb-4 align-items-center dk-row-divider">
            <Col md={3}><span className="dk-label">Avatar</span></Col>
            <Col md={9}>
              <div className="avatar-circle-wrapper" onClick={() => document.getElementById("createAvatarInput").click()}
                style={{ border: `3px solid ${G.gold}` }}>
                <img src={trainer.avatarPreview || "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"} alt="avatar" className="avatar-img" />
                <div className="avatar-overlay"><span>Change Photo</span></div>
                <input type="file" id="createAvatarInput" accept="image/png, image/jpeg" onChange={handleImageUpload} hidden />
              </div>
            </Col>
          </Row>

          {/* FIRST NAME */}
          <Row className="mb-4 align-items-center">
            <Col md={3}><span className="dk-label">First Name</span></Col>
            <Col md={9}>
              <InputGroup className="dk-ig">
                <InputGroup.Text className="dk-ig-text"><i className="fe fe-user"></i></InputGroup.Text>
                <Form.Control type="text" name="firstName" placeholder="Enter first name" value={trainer.firstName} onChange={handleChange} required />
              </InputGroup>
            </Col>
          </Row>

          {/* LAST NAME */}
          <Row className="mb-4 align-items-center">
            <Col md={3}><span className="dk-label">Last Name</span></Col>
            <Col md={9}>
              <InputGroup className="dk-ig">
                <InputGroup.Text className="dk-ig-text"><i className="fe fe-user"></i></InputGroup.Text>
                <Form.Control type="text" name="lastName" placeholder="Enter last name" value={trainer.lastName} onChange={handleChange} required />
              </InputGroup>
            </Col>
          </Row>

          {/* EMAIL */}
          <Row className="mb-4 align-items-center">
            <Col md={3}><span className="dk-label">Email</span></Col>
            <Col md={9}>
              <InputGroup className="dk-ig">
                <InputGroup.Text className="dk-ig-text"><i className="fe fe-mail"></i></InputGroup.Text>
                <Form.Control type="email" name="email" placeholder="Enter email" value={trainer.email} onChange={handleChange} pattern="^[^\s@]+@[^\s@]+\.com$" title="Email must end with .com" required />
              </InputGroup>
            </Col>
          </Row>

          {/* PHONE */}
          <Row className="mb-4 align-items-center">
            <Col md={3}><span className="dk-label">Phone No</span></Col>
            <Col md={9}>
              <InputGroup className="dk-ig">
                <Dropdown>
                  <Dropdown.Toggle className="dk-flag-toggle" style={{ minWidth: 110 }}>
                    <ReactCountryFlag countryCode={trainer.country} svg style={{ width: 20, marginRight: 8 }} />
                    {trainer.countryCode}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dk-ddm">
                    {countryOptions.map((c) => (
                      <Dropdown.Item key={c.code} onClick={() => setTrainer({ ...trainer, countryCode: c.code, country: c.country })}>
                        <ReactCountryFlag countryCode={c.country} svg style={{ width: 20, marginRight: 10 }} />{c.code}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <Form.Control type="tel" name="phone" placeholder="Enter phone number" value={trainer.phone} onChange={(e) => setTrainer({ ...trainer, phone: e.target.value.replace(/\D/g, "") })} required />
              </InputGroup>
            </Col>
          </Row>

          {/* HOST GYM NAME */}
          <Row className="mb-4 align-items-center">
            <Col md={3}><span className="dk-label">Host Gym Name</span></Col>
            <Col md={9}>
              <InputGroup className="dk-ig">
                <InputGroup.Text className="dk-ig-text"><i className="fe fe-home"></i></InputGroup.Text>
                <Form.Control type="text" name="hostGymName" placeholder="Enter host gym name" value={trainer.hostGymName} onChange={handleChange} />
              </InputGroup>
            </Col>
          </Row>

          {/* HOST GYM ADDRESS */}
          <Row className="mb-4 align-items-center">
            <Col md={3}><span className="dk-label">Host Gym Address</span></Col>
            <Col md={9}>
              <InputGroup className="dk-ig">
                <InputGroup.Text className="dk-ig-text"><i className="fe fe-map-pin"></i></InputGroup.Text>
                <Form.Control type="text" name="hostGymAddress" placeholder="Enter host gym address" value={trainer.hostGymAddress} onChange={handleChange} />
              </InputGroup>
            </Col>
          </Row>

          {/* GENDER */}
          <Row className="mb-4 align-items-center">
            <Col md={3}><span className="dk-label">Gender</span></Col>
            <Col md={9}>
              <InputGroup className="dk-ig">
                <InputGroup.Text className="dk-ig-text"><i className="fe fe-users"></i></InputGroup.Text>
                <Form.Select name="gender" value={trainer.gender} onChange={handleChange} className="dk-inp" style={{ padding: "10px 14px", border: "none" }} required>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>

          {/* BIO */}
          <Row className="mb-4 align-items-start">
            <Col md={3}><span className="dk-label">Bio</span></Col>
            <Col md={9}>
              <InputGroup className="dk-ig">
                <InputGroup.Text className="dk-ig-text textarea-icon"><i className="fe fe-edit"></i></InputGroup.Text>
                <Form.Control as="textarea" rows={3} name="bio" placeholder="Enter short bio" value={trainer.bio} onChange={handleChange} />
              </InputGroup>
            </Col>
          </Row>

          {/* STATUS */}
          <Row className="mb-4 align-items-center">
            <Col md={3}><span className="dk-label">Status</span></Col>
            <Col md={9}>
              <Dropdown>
                <Dropdown.Toggle className="dk-status-toggle">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: trainer.status === "Active" ? "#4ade80" : "#ff6b6b", marginRight: 8, display: "inline-block" }}></span>
                  <span style={{ fontWeight: 600 }}>{trainer.status}</span>
                  <i className="fe fe-chevron-down" style={{ marginLeft: "auto", fontSize: 12, color: G.muted }}></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dk-ddm">
                  <Dropdown.Item onClick={() => setTrainer({ ...trainer, status: "Active" })}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block", marginRight: 8 }}></span>Active
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setTrainer({ ...trainer, status: "Inactive" })}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff6b6b", display: "inline-block", marginRight: 8 }}></span>Inactive
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

        </Form>
      </div>
    </div>
  );
}
