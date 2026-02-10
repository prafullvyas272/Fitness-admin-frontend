import { useState, useEffect } from "react";
import { Card, Form, Button } from "react-bootstrap";
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

    // Get existing trainers
    const existing =
      JSON.parse(localStorage.getItem("gymTrainers")) || [];

    const newTrainer = {
      id: Date.now(),
      ...trainer,
    };

    // Save updated list
    localStorage.setItem(
      "gymTrainers",
      JSON.stringify([...existing, newTrainer])
    );

    // Redirect back to trainers page
    router.push("/trainers");
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Create Trainer</h2>

      <Card className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={trainer.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={trainer.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={trainer.phone}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={trainer.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Inactive</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" variant="primary">
            Create Trainer
          </Button>
        </Form>
      </Card>
    </div>
  );
}
