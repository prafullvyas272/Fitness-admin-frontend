import { useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";

export default function PrivacyPolicy() {
  const [content, setContent] = useState(
    `We value your privacy. All customer and trainer information collected in this Gym Management System is securely stored and never shared with third parties.

Personal data including names, contact details, and membership information is used only for internal management purposes.`
  );

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Privacy Policy</h2>
        <Button onClick={() => setShowModal(true)}>
          Edit
        </Button>
      </div>

      <Card className="p-4">
        {content.split("\n\n").map((para, index) => (
          <p key={index}>{para}</p>
        ))}
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Privacy Policy</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={8}
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
          <Button onClick={() => setShowModal(false)}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}