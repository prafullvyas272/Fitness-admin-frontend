import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSpecialities,
  createSpeciality,
  deleteSpeciality,
} from "../redux/slices/specialitySlice";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  divider: "#1e1e1e", text: "#ffffff", muted: "#888888", input: "#111111",
  cardBorder: "1px solid #1e1e1e", goldFaint: "rgba(248,227,150,0.07)",
};

export default function Speciality() {
  const dispatch = useDispatch();
  const { skills, loading, error } = useSelector((state) => state.speciality);
  const [input, setInput] = useState("");

  useEffect(() => {
    dispatch(fetchSpecialities());
  }, [dispatch]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      dispatch(createSpeciality(input.trim()));
      setInput("");
    }
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: G.goldLight, fontWeight: 700, margin: 0 }}>Speciality</h3>
        <small style={{ color: G.muted }}>Manage trainer specialities here.</small>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* CARD */}
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 28 }}>

        {/* INPUT */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Type speciality and press Enter..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              background: G.input,
              border: `1px solid ${G.divider}`,
              borderRadius: 10,
              padding: "12px 48px 12px 16px",
              color: G.text,
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = G.gold}
            onBlur={(e) => e.target.style.borderColor = G.divider}
          />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 12, pointerEvents: "none" }}>
            ↵ Enter
          </span>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: G.muted, fontSize: 13, marginBottom: 16 }}>
            <Spinner animation="border" size="sm" style={{ borderColor: G.gold, borderRightColor: "transparent", width: 16, height: 16 }} />
            Loading...
          </div>
        )}

        {/* CHIPS */}
        {skills.length === 0 && !loading ? (
          <p style={{ color: G.muted, fontSize: 14, textAlign: "center", padding: "20px 0", margin: 0 }}>
            No specialities added yet. Type above and press Enter to add one.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {skills.map((skill) => (
              <div
                key={skill.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(248,227,150,0.07)",
                  border: `1px solid ${G.divider}`,
                  borderRadius: 30,
                  padding: "7px 14px",
                  fontSize: 14,
                  color: G.text,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = G.gold}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = G.divider}
              >
                {skill.name}
                <span
                  onClick={() => dispatch(deleteSpeciality(skill.id))}
                  style={{
                    cursor: "pointer",
                    color: G.muted,
                    fontSize: 16,
                    lineHeight: 1,
                    fontWeight: 700,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#f87171"}
                  onMouseLeave={(e) => e.target.style.color = G.muted}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
