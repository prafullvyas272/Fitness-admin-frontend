import { useState } from "react";
import { Modal, Form } from "react-bootstrap";

const G = {
  bg:         "#111111",
  card:       "#1a1a1a",
  cardBorder: "1px solid rgba(212,160,23,0.25)",
  gold:       "#d4a017",
  goldLight:  "#f5d76e",
  goldFaint:  "rgba(212,160,23,0.08)",
  text:       "#f1f1f1",
  muted:      "#888888",
  divider:    "rgba(212,160,23,0.15)",
  input:      "#222222",
};

const SECTIONS = [
  { icon: "fe-users", label: "Members" },
  { icon: "fe-briefcase", label: "Staff & Trainers" },
  { icon: "fe-alert-triangle", label: "Violations" },
];

export default function Terms() {
  const [content, setContent] = useState(
    `All gym members must comply with gym rules and regulations.

Trainers and staff must maintain professionalism at all times.

Management reserves the right to suspend memberships for policy violations.`
  );

  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(content);

  const paragraphs = content.split("\n\n");

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
        .modal-gold .modal-content { background: #1a1a1a; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .btn-close { filter: invert(1); }
        .modal-gold .modal-body { background: #1a1a1a !important; }
        .inp-gold { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px !important; }
        .inp-gold::placeholder { color: #555 !important; }
        .inp-gold:focus { border-color: ${G.gold} !important; box-shadow: 0 0 0 3px rgba(212,160,23,0.15) !important; outline: none !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h3 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 4 }}>Terms &amp; Conditions</h3>
          <small style={{ color: G.muted }}>Rules and guidelines for using this platform</small>
        </div>
        <button
          onClick={handleEdit}
          style={{
            background: `linear-gradient(135deg, ${G.gold}, #b8860b)`,
            border: "none", color: "#111", padding: "8px 20px",
            borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(212,160,23,0.3)",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <i className="fe fe-edit" style={{ fontSize: 14 }}></i>
          Edit Terms
        </button>
      </div>

      {/* CONTENT CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "28px 32px" }}>
        {/* Gold top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, transparent)`, borderRadius: 4, marginBottom: 28 }} />

        {paragraphs.map((para, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 16,
              padding: "16px 0",
              borderBottom: index < paragraphs.length - 1 ? `1px solid ${G.divider}` : "none",
            }}
          >
            {/* Icon badge */}
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: G.goldFaint, border: `1px solid ${G.divider}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i
                className={`fe ${SECTIONS[index % SECTIONS.length]?.icon || "fe-file-text"}`}
                style={{ color: G.gold, fontSize: 15 }}
              ></i>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: G.gold, letterSpacing: "0.08rem", textTransform: "uppercase" }}>
                {SECTIONS[index % SECTIONS.length]?.label || `Clause ${index + 1}`}
              </span>
              <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.8, margin: "4px 0 0" }}>{para}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${G.divider}`, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="fe fe-file-text" style={{ color: G.gold, fontSize: 14 }}></i>
          <small style={{ color: G.muted }}>Last updated: May 2025</small>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-gold">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: G.goldLight, fontWeight: 700 }}>Edit Terms &amp; Conditions</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p style={{ color: G.muted, fontSize: 12, marginBottom: 12 }}>Separate each clause with a blank line.</p>
          <Form.Control
            as="textarea"
            rows={10}
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
              background: `linear-gradient(135deg, ${G.gold}, #b8860b)`,
              border: "none", color: "#111", padding: "8px 20px",
              borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13,
              boxShadow: "0 4px 12px rgba(212,160,23,0.3)",
            }}
          >
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
