import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTrainer } from "../../redux/slices/trainerSlice";
import {
  Card,
  Form,
  Button,
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
  country: "IN",   // 🔥 IMPORTANT
  hostGymName: "",
  hostGymAddress: "",
  address: "",
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
    formData.append("address", trainer.address);
    formData.append("bio", trainer.bio);
    formData.append("gender", trainer.gender);

    if (trainer.avatarFile) {
      formData.append("avatar", trainer.avatarFile);
    }

    /* ================= REDUX DISPATCH ================= */

    const resultAction = await dispatch(createTrainer(formData));

    if (createTrainer.fulfilled.match(resultAction)) {
      alert("Trainer created successfully ✅");
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




  return (
    <div className="p-4">
<div className="d-flex justify-content-between align-items-center mb-4">

  {/* LEFT SIDE BACK BUTTON */}
  <Button
    variant="outline-secondary"
    className="px-3 rounded-3"
    onClick={() => {
      const isFormFilled =
        trainer.firstName.trim() !== "" ||
        trainer.lastName.trim() !== "" ||
        trainer.email.trim() !== "" ||
        trainer.phone.trim() !== "" ||
        trainer.hostGymName.trim() !== "" ||
        trainer.hostGymAddress.trim() !== "" ||
        trainer.address.trim() !== "" ||
        trainer.bio.trim() !== "" ||
        trainer.avatarFile;

      if (isFormFilled) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Do you want to go back?"
        );
        if (!confirmLeave) return;
      }

      router.push("/trainers");
    }}
  >
    ← Back
  </Button>

  {/* RIGHT SIDE CREATE BUTTON */}
  <Button
    type="submit"
    variant="primary"
    className="px-4 py-2 rounded-3"
    disabled={loading}
    form="createTrainerForm"
  >
    {loading ? "Creating..." : "Create Trainer"}
  </Button>

</div>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-4">

          <Form id="createTrainerForm" onSubmit={handleSubmit}>

            {/* AVATAR */}
{/* AVATAR */}
<Row className="mb-4 align-items-center">
  <Col md={3} className="fw-semibold">Avatar:</Col>

  <Col md={9}>
    <div
      className="avatar-circle-wrapper"
      onClick={() => document.getElementById("createAvatarInput").click()}
    >
      <img
        src={
          trainer.avatarPreview ||
          "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
        }
        alt="avatar"
        className="avatar-img"
      />

      <div className="avatar-overlay">
        <span>Change Photo</span>
      </div>

      <input
        type="file"
        id="createAvatarInput"
        accept="image/png, image/jpeg"
        onChange={handleImageUpload}
        hidden
      />
    </div>
  </Col>
</Row>


            {/* FIRST NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">First Name:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-user"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={trainer.firstName}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                    required
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* LAST NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">Last Name:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-user"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={trainer.lastName}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                    required
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* EMAIL */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">Email:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-mail"></i>
                  </InputGroup.Text>
                 <Form.Control
  type="email"
  name="email"
  placeholder="Enter email"
  value={trainer.email}
  onChange={handleChange}
  pattern="^[^\s@]+@[^\s@]+\.com$"
  title="Email must end with .com"
  className="bg-light border-0 custom-input"
  required
/>

                </InputGroup>
              </Col>
            </Row>

            {/* PHONE */}
           {/* PHONE */}
<Row className="mb-4 align-items-center">
  <Col md={3} className="fw-semibold">Phone No:</Col>
  <Col md={9}>
    <InputGroup>

      {/* 🔥 NEW FLAG DROPDOWN */}
      <Dropdown>
        <Dropdown.Toggle
          variant="light"
          style={{ minWidth: "120px" }}
          className="d-flex align-items-center justify-content-center"
        >
          <ReactCountryFlag
            countryCode={trainer.country}
            svg
            style={{ width: "20px", marginRight: "8px" }}
          />
          {trainer.countryCode}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {countryOptions.map((c) => (
            <Dropdown.Item
              key={c.code}
              onClick={() =>
                setTrainer({
                  ...trainer,
                  countryCode: c.code,
                  country: c.country,
                })
              }
            >
              <ReactCountryFlag
                countryCode={c.country}
                svg
                style={{ width: "20px", marginRight: "10px" }}
              />
              {c.code}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {/* Phone Number Input */}
      <Form.Control
        type="tel"
        name="phone"
        placeholder="Enter phone number"
        value={trainer.phone}
        onChange={(e) => {
          const onlyNumbers = e.target.value.replace(/\D/g, "");
          setTrainer({ ...trainer, phone: onlyNumbers });
        }}
        className="custom-input"
        required
      />

    </InputGroup>
  </Col>
</Row>




            {/* HOST GYM NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">Host Gym Name:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-home"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="hostGymName"
                    placeholder="Enter Host gym name"
                    value={trainer.hostGymName}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* HOST GYM ADDRESS */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">Host Gym Address:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-map-pin"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="hostGymAddress"
                    placeholder="Enter Host gym address"
                    value={trainer.hostGymAddress}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* ADDRESS */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">Address:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0 textarea-icon">
                    <i className="fe fe-map"></i>
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    placeholder="Enter address"
                    value={trainer.address}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* GENDER */}
<Row className="mb-4 align-items-center">
  <Col md={3} className="fw-semibold">Gender:</Col>
  <Col md={9}>
    <Form.Select
      name="gender"
      value={trainer.gender}
      onChange={handleChange}
      className="bg-light border-0 custom-input"
      required
    >
      <option value="">Select Gender</option>
      <option value="MALE">Male</option>
      <option value="FEMALE">Female</option>
      <option value="OTHER">Other</option>
    </Form.Select>
  </Col>
</Row>

            {/* BIO */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">Bio:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0 textarea-icon">
                    <i className="fe fe-edit"></i>
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    placeholder="Enter short bio"
                    value={trainer.bio}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* STATUS */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">Status:</Col>
              <Col md={9}>
                <InputGroup>
              
                  <Dropdown>
<Dropdown.Toggle
  variant="light"
  className="bg-light border-0 custom-input status-toggle-left"
>
  <div className="d-flex align-items-center gap-2">

    {/* Arrow FIRST */}
    <i className="fe fe-chevron-down small text-muted"></i>

    {/* Status Dot */}
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor:
          trainer.status === "Active" ? "#22c55e" : "#dc3545",
      }}
    ></span>

    {/* Status Text */}
    <span className="fw-semibold">
      {trainer.status}
    </span>

  </div>
</Dropdown.Toggle>






  <Dropdown.Menu className="shadow border-0 rounded-3">

    <Dropdown.Item
      onClick={() =>
        setTrainer({ ...trainer, status: "Active" })
      }
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#22c55e",
          display: "inline-block",
          marginRight: 8,
        }}
      ></span>
      Active
    </Dropdown.Item>

    <Dropdown.Item
      onClick={() =>
        setTrainer({ ...trainer, status: "Inactive" })
      }
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#dc3545",
          display: "inline-block",
          marginRight: 8,
        }}
      ></span>
      Inactive
    </Dropdown.Item>

  </Dropdown.Menu>
</Dropdown>


                </InputGroup>
              </Col>
            </Row>

            {/* BUTTON */}
            

          </Form>

        </Card.Body>
      </Card>
    </div>
  );
}
