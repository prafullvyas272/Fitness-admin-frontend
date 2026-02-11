import { useState } from "react";
import { Card, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { useRouter } from "next/router";

export default function CreateTrainer() {
  const router = useRouter();

  const [trainer, setTrainer] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setTrainer({
      ...trainer,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existing =
      JSON.parse(localStorage.getItem("gymTrainers")) || [];

    const newTrainer = {
      id: Date.now(),
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

          <Form onSubmit={handleSubmit}>

            {/* NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Name:
              </Col>

              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-user"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter trainer name"
                    value={trainer.name}
                    onChange={handleChange}
                    className="bg-light border-0"
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
                    placeholder="Enter email"
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
              <Col md={3} className="fw-semibold">
                Mobile:
              </Col>

              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-phone"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="Enter mobile number"
                    value={trainer.phone}
                    onChange={handleChange}
                    className="bg-light border-0"
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
                    className="bg-light border-0"
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
                  className="px-4 py-2 rounded-3"
                  variant="primary"
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
