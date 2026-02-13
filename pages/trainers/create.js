import { useState } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useRouter } from "next/router";

export default function CreateTrainer() {
  const router = useRouter();

  const [trainer, setTrainer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hostGymName: "",
    hostGymAddress: "",
    address: "",
    bio: "",
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

    const formData = new FormData();

    formData.append("firstName", trainer.firstName);
    formData.append("lastName", trainer.lastName);
    formData.append("email", trainer.email);
    formData.append("phone", trainer.phone);
    formData.append("password", "Trainer@123");
    // formData.append("isActive", trainer.status === "Active" ? "true" : "false");
    formData.append("hostGymName", trainer.hostGymName);
    formData.append("hostGymAddress", trainer.hostGymAddress);
    formData.append("address", trainer.address);
    formData.append("bio", trainer.bio);

    // 🔥 THIS IS THE IMPORTANT PART
    if (trainer.avatarFile) {
      formData.append("avatar", trainer.avatarFile);
    }

    const response = await fetch(
      "https://fitness-app-seven-beryl.vercel.app/api/trainers",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ❌ DO NOT SET Content-Type
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create trainer");
    }

    alert("Trainer created successfully ✅");
    router.push("/trainers");

  } catch (error) {
    alert(error.message);
  }
};




  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">Create Trainer</h3>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-4">

          <Form onSubmit={handleSubmit}>

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
                    className="bg-light border-0 custom-input"
                    required
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* PHONE */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">Phone No:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-phone"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={trainer.phone}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
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
                    placeholder="Enter gym name"
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
                    placeholder="Enter gym address"
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
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-activity"></i>
                  </InputGroup.Text>
                  <Form.Select
                    name="status"
                    value={trainer.status}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>

            {/* BUTTON */}
            <Row>
              <Col md={{ span: 9, offset: 3 }}>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2 rounded-3"
                >
                  Create Trainer
                </Button>
              </Col>
            </Row>

          </Form>

        </Card.Body>
      </Card>
    </div>
  );
}
