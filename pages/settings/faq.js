import { useState } from "react";
import { Card, Accordion, Button, Modal, Form } from "react-bootstrap";

export default function FAQ() {
  const [faqs, setFaqs] = useState([
    {
      question: "How can I assign a trainer to a member?",
      answer: "Go to Customers page → Click 3 dots → Select Assign Trainer.",
    },
    {
      question: "How do I deactivate a trainer?",
      answer: "Go to Trainers page → Edit trainer → Change status to Inactive.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });

  const handleSave = () => {
    if (editIndex !== null) {
      const updated = [...faqs];
      updated[editIndex] = formData;
      setFaqs(updated);
    } else {
      setFaqs([...faqs, formData]);
    }

    setFormData({ question: "", answer: "" });
    setEditIndex(null);
    setShowModal(false);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData(faqs[index]);
    setShowModal(true);
  };

  const handleDelete = (index) => {
    const updated = faqs.filter((_, i) => i !== index);
    setFaqs(updated);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Frequently Asked Questions</h2>

        <Button onClick={() => setShowModal(true)}>
          + Add FAQ
        </Button>
      </div>

      <Card className="p-4">
        <Accordion>
          {faqs.map((faq, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>
                {faq.question}
              </Accordion.Header>
              <Accordion.Body>
                <p>{faq.answer}</p>

                <div className="mt-3 d-flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex !== null ? "Edit FAQ" : "Add FAQ"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Question</Form.Label>
            <Form.Control
              value={formData.question}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  question: e.target.value,
                })
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Answer</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.answer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  answer: e.target.value,
                })
              }
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}