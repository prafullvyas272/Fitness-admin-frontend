import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrainerById,
  updateTrainerAsync,
  setSelectedTrainer
} from "../../../redux/slices/trainerSlice";

import {
  Form,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useRouter } from "next/router";
import ReactCountryFlag from "react-country-flag";
import Dropdown from "react-bootstrap/Dropdown";


export default function EditTrainer() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { trainers, selectedTrainer, loading } = useSelector(
    (state) => state.trainers
  );

  const { id } = router.query;

  const [trainer, setTrainer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    country: "IN",
    phone: "",
    hostGymName: "",
    hostGymAddress: "",
    bio: "",
    gender: "",
    status: "Active",
    avatar: "",
  });

  const [originalTrainer, setOriginalTrainer] = useState(null);

  /* ================= LOAD TRAINER DATA ================= */
  useEffect(() => {
    if (!id) return;

    const existingTrainer = trainers.find((t) => t.id === id);

    if (
      existingTrainer &&
      existingTrainer.userProfileDetails &&
      existingTrainer.userProfileDetails.length > 0
    ) {
      dispatch(setSelectedTrainer(existingTrainer));
    } else {
      dispatch(fetchTrainerById(id));
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedTrainer) {
      const details = selectedTrainer.userProfileDetails?.[0] || {};

      const fullPhone = selectedTrainer.phone || "";
      const knownCodes = ["+971", "+49", "+91", "+61", "+44", "+51", "+1"];
      let extractedCode = "+91";
      let extractedNumber = fullPhone;
      for (const code of knownCodes) {
        if (fullPhone.startsWith(code)) {
          extractedCode = code;
          extractedNumber = fullPhone.slice(code.length);
          break;
        }
      }

      const countryMap = {
        "+91": "IN",
        "+1": "US",
        "+44": "GB",
        "+61": "AU",
        "+971": "AE",
        "+49": "DE",
        "+51": "PE",
      };

      const formattedTrainer = {
        firstName: selectedTrainer.firstName || "",
        lastName: selectedTrainer.lastName || "",
        email: selectedTrainer.email || "",
        countryCode: extractedCode,
        country: countryMap[extractedCode] || "IN",
        phone: extractedNumber,
        hostGymName: details.hostGymName || "",
        hostGymAddress: details.hostGymAddress || "",
        bio: details.bio || "N/A",
        gender: selectedTrainer.gender || "",
        status: selectedTrainer.isActive ? "Active" : "Inactive",
        avatar: details.avatarUrl || "",
      };

      setTrainer(formattedTrainer);
      setOriginalTrainer(formattedTrainer);
    }
  }, [selectedTrainer]);

  const handleChange = (e) => {
    setTrainer({
      ...trainer,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTrainer({ ...trainer, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  /* ================= UPDATE TRAINER ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      email: trainer.email,
      phone: trainer.countryCode + trainer.phone,
      isActive: trainer.status === "Active",
      hostGymName: trainer.hostGymName,
      hostGymAddress: trainer.hostGymAddress,
      bio: trainer.bio,
      gender: trainer.gender,
    };

    const resultAction = await dispatch(
      updateTrainerAsync({ id, formData })
    );

    if (updateTrainerAsync.fulfilled.match(resultAction)) {
      alert("Trainer updated successfully");
      router.replace(`/trainers/view/${id}`);
    } else {
      alert(resultAction.payload || "Update failed");
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

  if (!selectedTrainer && loading) {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: G.muted, fontSize: 15 }}>Loading trainer...</span>
      </div>
    );
  }

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
        .dk-flag-toggle { background: #111111 !important; border: none !important; color: ${G.text} !important; border-right: 1px solid ${G.divider} !important; display: flex !important; align-items: center !important; gap: 6px; }
        .dk-flag-toggle:hover, .dk-flag-toggle:focus { background: #1e1e1e !important; }
        .dk-flag-toggle::after { display: none !important; }
        .dk-gender-toggle { background: ${G.input} !important; border: none !important; color: ${G.text} !important; flex: 1; display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 10px 14px !important; }
        .dk-gender-toggle:hover { background: #1e1e1e !important; }
        .dk-gender-toggle::after { display: none !important; }
        .dk-status-toggle { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 7px !important; width: 100%; display: flex !important; align-items: center !important; }
        .dk-status-toggle:hover { background: #1e1e1e !important; }
        .dk-status-toggle::after { display: none !important; }
        .dk-label { color: ${G.muted}; font-weight: 600; font-size: 14px; }
        .dk-row-divider { border-bottom: 1px solid ${G.divider}; padding-bottom: 20px; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* FULL-SCREEN LOADER */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, border: `5px solid rgba(248,227,150,0.15)`, borderTop: `5px solid ${G.gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: G.goldLight }}>Updating trainer...</p>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button
          style={{ background: "transparent", border: "1px solid rgba(248,227,150,0.25)", color: "#f8e396", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          onClick={() => {
            if (
              originalTrainer &&
              JSON.stringify(trainer) !== JSON.stringify(originalTrainer)
            ) {
              if (!window.confirm("You have unsaved changes. Do you want to go back?")) return;
            }
            router.push("/trainers");
          }}
        >← Back</button>

        <h3 style={{ color: G.text, fontWeight: 700, margin: 0 }}>Edit Trainer</h3>

        <button
          type="submit"
          form="editTrainerForm"
          disabled={loading}
          style={{ background: G.gold, border: "none", color: "#000", padding: "8px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Updating..." : "Update Trainer"}
        </button>
      </div>

      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, padding: 32 }}>
        <Form id="editTrainerForm" onSubmit={handleSubmit}>

          {/* AVATAR */}
          <Row className="mb-4 align-items-center dk-row-divider">
            <Col md={3}><span className="dk-label">Avatar</span></Col>
            <Col md={9}>
              <div className="avatar-circle-wrapper" onClick={() => document.getElementById("editAvatarInput").click()}
                style={{ border: `3px solid ${G.gold}`, background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {trainer.avatar ? (
                  <img src={trainer.avatar} alt="avatar" className="avatar-img" />
                ) : (
                  <span style={{ fontSize: 48, fontWeight: 800, color: G.gold, letterSpacing: -2, lineHeight: 1, pointerEvents: "none" }}>
                    {`${trainer.firstName?.[0] || ""}${trainer.lastName?.[0] || ""}`.toUpperCase() || "?"}
                  </span>
                )}
                <div className="avatar-overlay"><span>Change Photo</span></div>
                <input type="file" id="editAvatarInput" accept="image/png, image/jpeg" onChange={handleImageUpload} hidden />
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
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={trainer.email}
                  onChange={handleChange}
                  pattern="^[^\s@]+@[^\s@]+\.(com|in|org|net)$"
                  title="Email must end with .com, .in, .org or .net"
                  required
                />
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
                    <ReactCountryFlag countryCode={trainer.country} svg style={{ width: 20 }} />
                    {trainer.countryCode}
                    <i className="fe fe-chevron-down" style={{ fontSize: 11, color: G.muted, marginLeft: "auto" }}></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dk-ddm">
                    {countryOptions.map((c) => (
                      <Dropdown.Item key={c.code} onClick={() => setTrainer({ ...trainer, countryCode: c.code, country: c.country })}>
                        <ReactCountryFlag countryCode={c.country} svg style={{ width: 20, marginRight: 10 }} />{c.code}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={trainer.phone}
                  onChange={(e) => setTrainer({ ...trainer, phone: e.target.value.replace(/\D/g, "") })}
                  required
                />
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
                <Dropdown style={{ flex: 1 }}>
                  <Dropdown.Toggle className="dk-gender-toggle" style={{ color: trainer.gender ? G.text : G.muted }}>
                    {trainer.gender === "MALE" ? "Male" : trainer.gender === "FEMALE" ? "Female" : trainer.gender === "OTHER" ? "Other" : "Select Gender"}
                    <i className="fe fe-chevron-down" style={{ fontSize: 11, color: G.muted }}></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dk-ddm" style={{ width: "100%" }}>
                    <Dropdown.Item onClick={() => setTrainer({ ...trainer, gender: "MALE" })}>Male</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTrainer({ ...trainer, gender: "FEMALE" })}>Female</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTrainer({ ...trainer, gender: "OTHER" })}>Other</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
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
