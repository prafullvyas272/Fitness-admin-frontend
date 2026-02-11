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
    avatar: "",
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setTrainer({ ...trainer, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existing =
      JSON.parse(localStorage.getItem("gymTrainers")) || [];

    const newTrainer = {
      id: Date.now(),
      name: `${trainer.firstName} ${trainer.lastName}`,
      ...trainer,
    };

    localStorage.setItem(
      "gymTrainers",
      JSON.stringify([...existing, newTrainer])
    );

    router.push("/trainers");
  };

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">Create Trainer</h3>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-4">

          {/* SECTION HEADER */}
          <div className="mb-4">
            <h5 className="fw-semibold mb-1">
              Personal Information
            </h5>
            <small className="text-muted">
              Following information is publicly displayed, be careful!
            </small>
          </div>

          <Form onSubmit={handleSubmit}>

            {/* AVATAR */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">
                Avatar:
              </Col>

              <Col md={9}>
                <div className="d-flex align-items-center gap-4">
                  <div>
                    <img
                      src={
                        trainer.avatar ||
                        "https://via.placeholder.com/120"
                      }
                      alt="avatar"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </div>

                  <div>
                    <Form.Control
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleImageUpload}
                    />

                    <div className="text-muted small mt-2">
                      <div># Upload your profile</div>
                      <div># Avatar size 150x150</div>
                      <div># Max upload size 2mb</div>
                      <div># Allowed file types: png, jpg, jpeg</div>
                    </div>
                  </div>
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
                    placeholder="First Name"
                    value={trainer.firstName}
                    onChange={handleChange}
                    className="bg-light border-0"
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
                    placeholder="Last Name"
                    value={trainer.lastName}
                    onChange={handleChange}
                    className="bg-light border-0"
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
                    placeholder="Email"
                    value={trainer.email}
                    onChange={handleChange}
                    className="bg-light border-0"
                    required
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* PHONE */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">Phone:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-phone"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={trainer.phone}
                    onChange={handleChange}
                    className="bg-light border-0"
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
                    placeholder="Host Gym Name"
                    value={trainer.hostGymName}
                    onChange={handleChange}
                    className="bg-light border-0"
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
                    placeholder="Host Gym Address"
                    value={trainer.hostGymAddress}
                    onChange={handleChange}
                    className="bg-light border-0"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* ADDRESS */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">Address:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-map"></i>
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    placeholder="Address"
                    value={trainer.address}
                    onChange={handleChange}
                    className="bg-light border-0"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* BIO */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">Bio:</Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-edit"></i>
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    placeholder="Short Bio"
                    value={trainer.bio}
                    onChange={handleChange}
                    className="bg-light border-0"
                  />
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
