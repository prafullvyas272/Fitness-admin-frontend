import { useState, useRef, useEffect, useCallback } from "react";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  goldFaint: "rgba(248,227,150,0.07)", text: "#ffffff", muted: "#888888",
  divider: "#1e1e1e", input: "#111111",
};

const TABS = ["trainers", "customers"];

function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const ToolBtn = ({ icon, cmd, val, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); val !== undefined ? exec(cmd, val) : exec(cmd); }}
      style={{
        background: "transparent", border: "none", color: G.muted,
        padding: "4px 8px", cursor: "pointer", fontSize: 13,
        borderRadius: 4, lineHeight: 1,
        transition: "color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = G.gold; e.currentTarget.style.background = G.goldFaint; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = G.muted; e.currentTarget.style.background = "transparent"; }}
    >
      {children || <i className={`fe ${icon}`} />}
    </button>
  );

  const Divider = () => <span style={{ width: 1, height: 18, background: G.divider, display: "inline-block", margin: "0 4px", verticalAlign: "middle" }} />;

  return (
    <div style={{ border: `1px solid ${G.divider}`, borderRadius: 10, overflow: "hidden", background: "#111" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2,
        padding: "8px 12px", borderBottom: `1px solid ${G.divider}`,
        background: "#0d0d0d",
      }}>
        <ToolBtn cmd="undo" title="Undo"><i className="fe fe-corner-up-left" /></ToolBtn>
        <ToolBtn cmd="redo" title="Redo"><i className="fe fe-corner-up-right" /></ToolBtn>
        <Divider />
        <ToolBtn cmd="formatBlock" val="h1" title="Heading 1"><span style={{ fontSize: 11, fontWeight: 700 }}>H1</span></ToolBtn>
        <ToolBtn cmd="formatBlock" val="h2" title="Heading 2"><span style={{ fontSize: 11, fontWeight: 700 }}>H2</span></ToolBtn>
        <ToolBtn cmd="formatBlock" val="h3" title="Heading 3"><span style={{ fontSize: 11, fontWeight: 700 }}>H3</span></ToolBtn>
        <Divider />
        <ToolBtn cmd="bold" title="Bold"><i className="fe fe-bold" /></ToolBtn>
        <ToolBtn cmd="italic" title="Italic"><i className="fe fe-italic" /></ToolBtn>
        <ToolBtn cmd="underline" title="Underline"><i className="fe fe-underline" /></ToolBtn>
        <Divider />
        <ToolBtn cmd="insertUnorderedList" title="Bullet list"><i className="fe fe-list" /></ToolBtn>
        <ToolBtn cmd="insertOrderedList" title="Numbered list"><i className="fe fe-hash" /></ToolBtn>
        <Divider />
        <ToolBtn cmd="justifyLeft" title="Align left"><i className="fe fe-align-left" /></ToolBtn>
        <ToolBtn cmd="justifyCenter" title="Align center"><i className="fe fe-align-center" /></ToolBtn>
        <ToolBtn cmd="justifyRight" title="Align right"><i className="fe fe-align-right" /></ToolBtn>
        <ToolBtn cmd="justifyFull" title="Justify"><i className="fe fe-menu" /></ToolBtn>
        <Divider />
        <button
          type="button"
          title="Insert link"
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
          style={{
            background: "transparent", border: "none", color: G.muted,
            padding: "4px 8px", cursor: "pointer", fontSize: 13, borderRadius: 4,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = G.gold; e.currentTarget.style.background = G.goldFaint; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = G.muted; e.currentTarget.style.background = "transparent"; }}
        >
          <i className="fe fe-link" />
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        style={{
          minHeight: 320, padding: "18px 20px", color: G.text, fontSize: 14,
          lineHeight: 1.8, outline: "none", background: "#111",
          fontFamily: "Montserrat, Arial, sans-serif",
        }}
        data-placeholder="Enter content here..."
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #444;
          pointer-events: none;
        }
        [contenteditable] h1 { color: ${G.gold}; font-size: 22px; font-weight: 700; margin: 12px 0 6px; }
        [contenteditable] h2 { color: ${G.gold}; font-size: 18px; font-weight: 700; margin: 10px 0 5px; }
        [contenteditable] h3 { color: ${G.gold}; font-size: 15px; font-weight: 700; margin: 8px 0 4px; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 24px; margin: 8px 0; }
        [contenteditable] li { margin: 4px 0; }
        [contenteditable] a { color: ${G.gold}; }
        [contenteditable] strong { color: #fff; }
      `}</style>
    </div>
  );
}

export default function PrivacyPolicy() {
  const [activeTab, setActiveTab] = useState("trainers");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [content, setContent] = useState({
    trainers: "",
    customers: "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: wire up API — e.g. POST /api/settings/privacy { role: activeTab, content: content[activeTab] }
      await new Promise((r) => setTimeout(r, 800)); // placeholder
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: "28px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>Privacy &amp; Policy</h3>
          <small style={{ color: G.muted }}>Set privacy policy for trainers and customers shown in the app</small>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: G.gold, border: "none", color: "#111", padding: "9px 24px",
            borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8, opacity: saving ? 0.7 : 1,
            boxShadow: "0 4px 12px rgba(248,227,150,0.25)",
          }}
        >
          {saving ? (
            <span style={{ width: 13, height: 13, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #111", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
          ) : saved ? (
            <i className="fe fe-check" />
          ) : (
            <i className="fe fe-save" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      </div>

      {/* CARD */}
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 28 }}>

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: `1px solid ${G.divider}`, marginBottom: 24 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "transparent", border: "none",
                borderBottom: activeTab === tab ? `2px solid ${G.gold}` : "2px solid transparent",
                color: activeTab === tab ? G.gold : G.muted,
                padding: "10px 24px", cursor: "pointer",
                fontWeight: activeTab === tab ? 700 : 400,
                fontSize: 14, textTransform: "capitalize", marginBottom: -1,
              }}
            >
              {tab === "trainers" ? "Trainers" : "Customers"}
            </button>
          ))}
        </div>

        {/* LABEL */}
        <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
          Privacy &amp; Policy for {activeTab}
        </p>

        {/* EDITOR */}
        <RichEditor
          key={activeTab}
          value={content[activeTab]}
          onChange={(val) => setContent((prev) => ({ ...prev, [activeTab]: val }))}
        />
      </div>
    </div>
  );
}
