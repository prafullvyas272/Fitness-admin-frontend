import { useState } from "react";
import { Modal, Form } from "react-bootstrap";

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

  const [openIndex, setOpenIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });

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
    setFaqs(faqs.filter((_, i) => i !== index));
    if (openIndex === index) setOpenIndex(null);
  };

  const openAdd = () => {
    setEditIndex(null);
    setFormData({ question: "", answer: "" });
    setShowModal(true);
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: "28px" }}>
      <style>{`
        .modal-gold .modal-content { background: #0d0d0d; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .btn-close { filter: invert(1); }
        .modal-gold .modal-body { background: #0d0d0d !important; }
        .inp-gold { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px !important; }
        .inp-gold::placeholder { color: #555 !important; }
        .inp-gold:focus { border-color: ${G.gold} !important; box-shadow: 0 0 0 3px rgba(248,227,150,0.15) !important; outline: none !important; }
        .faq-item { transition: background 0.2s ease; }
        .faq-item:hover { background: ${G.goldFaint} !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>Frequently Asked Questions</h3>
          <small style={{ color: G.muted }}>Manage help content for users</small>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: `${G.gold}`,
            border: "none", color: "#111", padding: "8px 20px",
            borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(248,227,150,0.3)",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <i className="fe fe-plus" style={{ fontSize: 14 }}></i>
          Add FAQ
        </button>
      </div>

      {/* FAQ CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, overflow: "hidden" }}>
        {/* Gold top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, transparent)` }} />

        {faqs.length === 0 ? (
          <div style={{ padding: "60px 32px", textAlign: "center", color: G.muted }}>
            <i className="fe fe-help-circle" style={{ fontSize: 40, color: G.divider, display: "block", marginBottom: 12 }}></i>
            No FAQs yet. Click &quot;Add FAQ&quot; to create one.
          </div>
        ) : (
          faqs.map((faq, index) => (
            <div
              key={index}
              className="faq-item"
              style={{
                borderBottom: index < faqs.length - 1 ? `1px solid ${G.divider}` : "none",
                background: openIndex === index ? G.goldFaint : "transparent",
              }}
            >
              {/* Question row */}
              <div
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "18px 24px", cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: openIndex === index ? G.gold : G.goldFaint,
                    border: `1px solid ${G.divider}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    color: openIndex === index ? "#111" : G.gold,
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{faq.question}</span>
                </div>
                <i
                  className={`fe ${openIndex === index ? "fe-chevron-up" : "fe-chevron-down"}`}
                  style={{ color: G.gold, fontSize: 14, flexShrink: 0, marginLeft: 12 }}
                ></i>
              </div>

              {/* Answer panel */}
              {openIndex === index && (
                <div style={{ padding: "0 24px 20px 66px" }}>
                  <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.8, margin: 0, marginBottom: 16 }}>
                    {faq.answer}
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => handleEdit(index)}
                      style={{
                        background: G.goldFaint, border: `1px solid ${G.divider}`,
                        color: G.goldLight, padding: "5px 14px", borderRadius: 6,
                        cursor: "pointer", fontSize: 12, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      <i className="fe fe-edit" style={{ fontSize: 12 }}></i>Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      style={{
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                        color: "#f87171", padding: "5px 14px", borderRadius: 6,
                        cursor: "pointer", fontSize: 12, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      <i className="fe fe-trash" style={{ fontSize: 12 }}></i>Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-gold">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: G.goldLight, fontWeight: 700 }}>
            {editIndex !== null ? "Edit FAQ" : "Add FAQ"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07rem" }}>
              Question
            </Form.Label>
            <Form.Control
              className="inp-gold"
              placeholder="Enter the question..."
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              style={{ fontSize: 14 }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07rem" }}>
              Answer
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              className="inp-gold"
              placeholder="Enter the answer..."
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              style={{ resize: "vertical", fontSize: 14, lineHeight: 1.7 }}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={() => setShowModal(false)}
            style={{
              background: "#2a2a2a", border: `1px solid ${G.divider}`, color: G.text,
              padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.question.trim() || !formData.answer.trim()}
            style={{
              background: `${G.gold}`,
              border: "none", color: "#111", padding: "8px 20px",
              borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13,
              boxShadow: "0 4px 12px rgba(248,227,150,0.3)",
              opacity: (!formData.question.trim() || !formData.answer.trim()) ? 0.5 : 1,
            }}
          >
            {editIndex !== null ? "Save Changes" : "Add FAQ"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
