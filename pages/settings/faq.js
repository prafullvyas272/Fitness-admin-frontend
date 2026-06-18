import { useState, useRef, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  goldFaint: "rgba(248,227,150,0.07)", text: "#ffffff", muted: "#888888",
  divider: "#1e1e1e", input: "#111111",
};

const TABS = ["trainers", "customers"];

function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || "";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const ToolBtn = ({ cmd, val, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); val !== undefined ? exec(cmd, val) : exec(cmd); }}
      style={{ background: "transparent", border: "none", color: G.muted, padding: "4px 8px", cursor: "pointer", fontSize: 13, borderRadius: 4, lineHeight: 1 }}
      onMouseEnter={(e) => { e.currentTarget.style.color = G.gold; e.currentTarget.style.background = G.goldFaint; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = G.muted; e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );

  const Sep = () => <span style={{ width: 1, height: 18, background: G.divider, display: "inline-block", margin: "0 4px", verticalAlign: "middle" }} />;

  return (
    <div style={{ border: `1px solid ${G.divider}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, padding: "8px 12px", borderBottom: `1px solid ${G.divider}`, background: "#0d0d0d" }}>
        <ToolBtn cmd="undo" title="Undo"><i className="fe fe-corner-up-left" /></ToolBtn>
        <ToolBtn cmd="redo" title="Redo"><i className="fe fe-corner-up-right" /></ToolBtn>
        <Sep />
        <ToolBtn cmd="formatBlock" val="h1" title="H1"><span style={{ fontSize: 11, fontWeight: 700 }}>H1</span></ToolBtn>
        <ToolBtn cmd="formatBlock" val="h2" title="H2"><span style={{ fontSize: 11, fontWeight: 700 }}>H2</span></ToolBtn>
        <ToolBtn cmd="formatBlock" val="h3" title="H3"><span style={{ fontSize: 11, fontWeight: 700 }}>H3</span></ToolBtn>
        <Sep />
        <ToolBtn cmd="bold" title="Bold"><i className="fe fe-bold" /></ToolBtn>
        <ToolBtn cmd="italic" title="Italic"><i className="fe fe-italic" /></ToolBtn>
        <ToolBtn cmd="underline" title="Underline"><i className="fe fe-underline" /></ToolBtn>
        <Sep />
        <ToolBtn cmd="insertUnorderedList" title="Bullet list"><i className="fe fe-list" /></ToolBtn>
        <ToolBtn cmd="insertOrderedList" title="Numbered list"><i className="fe fe-hash" /></ToolBtn>
        <Sep />
        <ToolBtn cmd="justifyLeft" title="Left"><i className="fe fe-align-left" /></ToolBtn>
        <ToolBtn cmd="justifyCenter" title="Center"><i className="fe fe-align-center" /></ToolBtn>
        <ToolBtn cmd="justifyRight" title="Right"><i className="fe fe-align-right" /></ToolBtn>
        <ToolBtn cmd="justifyFull" title="Justify"><i className="fe fe-menu" /></ToolBtn>
        <Sep />
        <button
          type="button"
          title="Link"
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
          style={{ background: "transparent", border: "none", color: G.muted, padding: "4px 8px", cursor: "pointer", fontSize: 13, borderRadius: 4 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = G.gold; e.currentTarget.style.background = G.goldFaint; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = G.muted; e.currentTarget.style.background = "transparent"; }}
        >
          <i className="fe fe-link" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        style={{ minHeight: 180, padding: "14px 16px", color: G.text, fontSize: 14, lineHeight: 1.8, outline: "none", background: "#111", fontFamily: "Montserrat, Arial, sans-serif" }}
        data-placeholder="Enter answer here..."
      />
      <style>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #444; pointer-events: none; }
        [contenteditable] h1 { color: ${G.gold}; font-size: 20px; font-weight: 700; margin: 10px 0 5px; }
        [contenteditable] h2 { color: ${G.gold}; font-size: 16px; font-weight: 700; margin: 8px 0 4px; }
        [contenteditable] h3 { color: ${G.gold}; font-size: 14px; font-weight: 700; margin: 6px 0 3px; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 24px; margin: 6px 0; }
        [contenteditable] a { color: ${G.gold}; }
        [contenteditable] strong { color: #fff; }
      `}</style>
    </div>
  );
}

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("trainers");
  const [faqs, setFaqs] = useState({ trainers: [], customers: [] });
  const [openIndex, setOpenIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ question: "", answer: "" });

  const currentFaqs = faqs[activeTab];

  const handleSave = () => {
    const updated = { ...faqs };
    const list = [...currentFaqs];
    if (editIndex !== null) {
      list[editIndex] = formData;
    } else {
      list.push(formData);
    }
    updated[activeTab] = list;
    setFaqs(updated);
    setFormData({ question: "", answer: "" });
    setEditIndex(null);
    setShowModal(false);
    setOpenIndex(null);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData(currentFaqs[index]);
    setShowModal(true);
  };

  const handleDelete = (index) => {
    if (!confirm("Delete this FAQ?")) return;
    const updated = { ...faqs, [activeTab]: currentFaqs.filter((_, i) => i !== index) };
    setFaqs(updated);
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-gold .modal-content { background: #0d0d0d; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .btn-close { filter: invert(1); }
        .modal-gold .modal-body { background: #0d0d0d !important; }
        .inp-gold { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px !important; }
        .inp-gold::placeholder { color: #555 !important; }
        .inp-gold:focus { border-color: ${G.gold} !important; box-shadow: none !important; outline: none !important; }
        .faq-row { transition: background 0.15s; }
        .faq-row:hover { background: ${G.goldFaint} !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>Frequently Asked Questions</h3>
          <small style={{ color: G.muted }}>Manage FAQ content for trainers and customers</small>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: G.gold, border: "none", color: "#111", padding: "9px 20px",
            borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 12px rgba(248,227,150,0.25)",
          }}
        >
          <i className="fe fe-plus" style={{ fontSize: 14 }} />
          Add FAQ
        </button>
      </div>

      {/* CARD */}
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, overflow: "hidden" }}>

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: `1px solid ${G.divider}`, padding: "0 24px" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setOpenIndex(null); }}
              style={{
                background: "transparent", border: "none",
                borderBottom: activeTab === tab ? `2px solid ${G.gold}` : "2px solid transparent",
                color: activeTab === tab ? G.gold : G.muted,
                padding: "14px 20px", cursor: "pointer",
                fontWeight: activeTab === tab ? 700 : 400,
                fontSize: 14, textTransform: "capitalize", marginBottom: -1,
              }}
            >
              {tab === "trainers" ? "Trainers" : "Customers"}
            </button>
          ))}
        </div>

        {/* FAQ LIST */}
        {currentFaqs.length === 0 ? (
          <div style={{ padding: "60px 32px", textAlign: "center", color: G.muted }}>
            <i className="fe fe-help-circle" style={{ fontSize: 36, color: G.divider, display: "block", marginBottom: 12 }} />
            No FAQs yet for {activeTab}. Click &quot;Add FAQ&quot; to create one.
          </div>
        ) : (
          currentFaqs.map((faq, index) => (
            <div
              key={index}
              className="faq-row"
              style={{
                borderBottom: index < currentFaqs.length - 1 ? `1px solid ${G.divider}` : "none",
                background: openIndex === index ? G.goldFaint : "transparent",
              }}
            >
              {/* Question row */}
              <div
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", cursor: "pointer" }}
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
                <i className={`fe ${openIndex === index ? "fe-chevron-up" : "fe-chevron-down"}`} style={{ color: G.gold, fontSize: 14, flexShrink: 0, marginLeft: 12 }} />
              </div>

              {/* Answer panel */}
              {openIndex === index && (
                <div style={{ padding: "0 24px 20px 66px" }}>
                  <div
                    style={{ color: G.muted, fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => handleEdit(index)}
                      style={{ background: G.goldFaint, border: `1px solid ${G.divider}`, color: G.goldLight, padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <i className="fe fe-edit" style={{ fontSize: 12 }} />Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <i className="fe fe-trash" style={{ fontSize: 12 }} />Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-gold" size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: G.goldLight, fontWeight: 700 }}>
            {editIndex !== null ? "Edit FAQ" : "Add FAQ"} — {activeTab === "trainers" ? "Trainers" : "Customers"}
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
            <Form.Label style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07rem", marginBottom: 8, display: "block" }}>
              Answer
            </Form.Label>
            <RichEditor
              key={showModal ? (editIndex ?? "new") : "hidden"}
              value={formData.answer}
              onChange={(val) => setFormData((prev) => ({ ...prev, answer: val }))}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={() => setShowModal(false)}
            style={{ background: "#2a2a2a", border: `1px solid ${G.divider}`, color: G.text, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.question.trim()}
            style={{
              background: G.gold, border: "none", color: "#111", padding: "8px 20px",
              borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13,
              opacity: !formData.question.trim() ? 0.5 : 1,
              boxShadow: "0 4px 12px rgba(248,227,150,0.25)",
            }}
          >
            {editIndex !== null ? "Save Changes" : "Add FAQ"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
