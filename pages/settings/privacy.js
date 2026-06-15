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

export default function PrivacyPolicy() {
  const [content, setContent] = useState(
    `We value your privacy. All customer and trainer information collected in this Gym Management System is securely stored and never shared with third parties.

Personal data including names, contact details, and membership information is used only for internal management purposes.`
  );

  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(content);

  const handleEdit = () => {
    setDraft(content);
    setShowModal(true);
  };

  const handleSave = () => {
    setContent(draft);
    setShowModal(false);
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
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h3 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 4 }}>Privacy Policy</h3>
          <small style={{ color: G.muted }}>How we handle and protect your data</small>
        </div>
        <button
          onClick={handleEdit}
          style={{
            background: `${G.gold}`,
            border: "none", color: "#111", padding: "8px 20px",
            borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(248,227,150,0.3)",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <i className="fe fe-edit" style={{ fontSize: 14 }}></i>
          Edit Policy
        </button>
      </div>

      {/* CONTENT CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "28px 32px" }}>
        {/* Gold top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, transparent)`, borderRadius: 4, marginBottom: 24 }} />

        {content.split("\n\n").map((para, index) => (
          <p
            key={index}
            style={{
              color: index === 0 ? G.text : G.muted,
              fontSize: 15,
              lineHeight: 1.8,
              marginBottom: 16,
              borderBottom: index < content.split("\n\n").length - 1 ? `1px solid ${G.divider}` : "none",
              paddingBottom: index < content.split("\n\n").length - 1 ? 16 : 0,
            }}
          >
            {para}
          </p>
        ))}

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${G.divider}`, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="fe fe-shield" style={{ color: G.gold, fontSize: 14 }}></i>
          <small style={{ color: G.muted }}>Last updated: May 2025</small>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-gold">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: G.goldLight, fontWeight: 700 }}>Edit Privacy Policy</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={8}
            className="inp-gold"
            style={{ resize: "vertical", fontSize: 14, lineHeight: 1.7 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
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
            style={{
              background: `${G.gold}`,
              border: "none", color: "#111", padding: "8px 20px",
              borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13,
              boxShadow: "0 4px 12px rgba(248,227,150,0.3)",
            }}
          >
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
