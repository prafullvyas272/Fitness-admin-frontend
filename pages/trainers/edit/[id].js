import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useRouter } from "next/router";

export default function EditTrainer() {
  const router = useRouter();
  const { id } = router.query;

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
    avatar: "",
  });

  /* ================= LOAD TRAINER DATA ================= */
useEffect(() => {
  if (!id) return;

  const fetchTrainer = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch trainer");
      }

      const profile = data.data;
const details = profile.userProfileDetails?.[0] || {};

setTrainer({
  firstName: profile.firstName || "",
  lastName: profile.lastName || "",
  email: profile.email || "",
  phone: profile.phone || "",
  hostGymName: details.hostGymName || "",
  hostGymAddress: details.hostGymAddress || "",
  address: details.address || "",
  bio: details.bio || "",
  status: profile.isActive ? "Active" : "Inactive",
  avatar: details.avatarUrl || "",
});


    } catch (error) {
      alert(error.message);
    }
  };

  fetchTrainer();
}, [id]);




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

  try {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: trainer.firstName,
          lastName: trainer.lastName,
          email: trainer.email,
          phone: trainer.phone,
          isActive: trainer.status === "Active",
          hostGymName: trainer.hostGymName,
          hostGymAddress: trainer.hostGymAddress,
          address: trainer.address,
          bio: trainer.bio,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Update failed");
    }

    alert("Trainer updated successfully ✅");
    router.push(`/trainers/view/${id}`);

  } catch (error) {
    alert(error.message);
  }
};




  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">Edit Trainer</h3>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>

            {/* AVATAR */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Avatar:
              </Col>

              <Col md={9}>
                <div className="avatar-circle-wrapper">
                  <div className="avatar-circle">
                    <img
                      src={
                        trainer.avatar ||
                        "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
                      }
                      alt="avatar"
                      className="avatar-img"
                    />

                    <div className="avatar-overlay">
                      <label className="avatar-upload-text">
                        Change Photo
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleImageUpload}
                          hidden
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* FIRST NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                First Name:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-user"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="firstName"
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
              <Col md={3} className="fw-semibold">
                Last Name:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-user"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="lastName"
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
              <Col md={3} className="fw-semibold">
                Email:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-mail"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
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
              <Col md={3} className="fw-semibold">
                Phone No:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-phone"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={trainer.phone}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* HOST GYM NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Host Gym Name:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-home"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="hostGymName"
                    value={trainer.hostGymName}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* HOST GYM ADDRESS */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Host Gym Address:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-map-pin"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="hostGymAddress"
                    value={trainer.hostGymAddress}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* ADDRESS */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">
                Address:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0 textarea-icon">
                    <i className="fe fe-map"></i>
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={trainer.address}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* BIO */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">
                Bio:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0 textarea-icon">
                    <i className="fe fe-edit"></i>
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={trainer.bio}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* STATUS */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Status:
              </Col>
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
                  Update Trainer
                </Button>
              </Col>
            </Row>

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
