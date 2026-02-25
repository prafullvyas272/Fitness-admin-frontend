import { useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";

export default function Terms() {
  const [content, setContent] = useState(
    `All gym members must comply with gym rules and regulations.

Trainers and staff must maintain professionalism at all times.

Management reserves the right to suspend memberships for policy violations.`
  );

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Terms & Conditions</h2>

        <Button
          variant="light"
          className="border"
          onClick={() => setShowModal(true)}
        >
          <i className="fe fe-edit me-2"></i>
          Edit
        </Button>
      </div>

      {/* CONTENT CARD */}
      <Card className="p-4 shadow-sm border-0 rounded-3">
        {content.split("\n\n").map((para, index) => (
          <p key={index} className="text-muted mb-3">
            {para}
          </p>
        ))}
      </Card>

      {/* EDIT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Terms & Conditions</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={() => setShowModal(false)}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}