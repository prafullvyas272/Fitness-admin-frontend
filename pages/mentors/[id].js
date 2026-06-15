import { useState, useEffect } from "react";
import { useRouter } from "next/router";

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

const REGIONS = ["North America", "South America", "Europe", "Asia Pacific", "Middle East", "Africa"];
const STATUS_OPTIONS = ["Active", "In Review", "Suspended"];

const EMPTY_FORM = {
  name: "", role: "", contact: "", experience: "", region: "North America",
  specializations: [], assignedPts: 0, ptSaturation: 0, ptSaturationMax: 30, status: "Active",
};

const STATUS_COLORS = {
  Active:      { dot: "#4ade80", bg: "rgba(34,197,94,0.12)",  text: "#4ade80" },
  "In Review": { dot: "#fbbf24", bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  Suspended:   { dot: "#f87171", bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
};

export default function MentorProfile() {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === "new";

  const [form, setForm]       = useState(EMPTY_FORM);
  const [newSpec, setNewSpec] = useState("");
  const [saving, setSaving]   = useState(false);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    if (!id) return;
    if (isNew) { setLoaded(true); return; }

    const saved = localStorage.getItem("mentors_data");
    if (saved) {
      try {
        const mentors = JSON.parse(saved);
        const mentor  = mentors.find((m) => String(m.id) === String(id));
        if (mentor) {
          setForm({
            name:            mentor.name || "",
            role:            mentor.role || "",
            contact:         mentor.contact || "",
            experience:      mentor.experience || "",
            region:          mentor.region || "North America",
            specializations: mentor.specializations?.length
              ? mentor.specializations
              : mentor.specialization ? [mentor.specialization] : [],
            assignedPts:      mentor.assignedPts ?? 0,
            ptSaturation:     mentor.ptSaturation ?? 0,
            ptSaturationMax:  mentor.ptSaturationMax ?? 30,
            status:           mentor.status || "Active",
          });
        }
      } catch (_) {}
    }
    setLoaded(true);
  }, [id, isNew]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const removeSpec = (spec) =>
    setField("specializations", form.specializations.filter((s) => s !== spec));

  const addSpec = () => {
    const v = newSpec.trim();
    if (!v || form.specializations.includes(v)) return;
    setField("specializations", [...form.specializations, v]);
    setNewSpec("");
  };

  const handleSave = () => {
    if (!form.name.trim()) { alert("Name is required"); return; }
    setSaving(true);

    const saved   = localStorage.getItem("mentors_data");
    let mentors   = saved ? JSON.parse(saved) : [];
    const primary = form.specializations[0] || "General";
    const extra   = Math.max(0, form.specializations.length - 1);

    if (isNew) {
      const newMentor = {
        ...form,
        id:             Date.now(),
        specialization: primary,
        extraSpec:      extra,
        unit:           "Personnel",
      };
      mentors = [...mentors, newMentor];
    } else {
      mentors = mentors.map((m) =>
        String(m.id) === String(id)
          ? { ...m, ...form, specialization: primary, extraSpec: extra }
          : m
      );
    }

    localStorage.setItem("mentors_data", JSON.stringify(mentors));
    setTimeout(() => router.push("/mentors"), 200);
  };

  const mentorName  = isNew ? "New Mentor" : form.name || "Mentor Profile";
  const satPct      = form.ptSaturationMax > 0 ? Math.min(100, (form.ptSaturation / form.ptSaturationMax) * 100) : 0;
  const statusColor = STATUS_COLORS[form.status] || STATUS_COLORS.Active;

  if (!loaded) {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner-border" style={{ color: G.gold }} />
      </div>
    );
  }

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: "28px" }}>
      <style>{`
        .inp-profile { background: #111111 !important; border: 1px solid #1e1e1e !important; color: #cccccc !important; border-radius: 7px !important; width: 100%; padding: 10px 13px; font-size: 12.5px; outline: none; }
        .inp-profile::placeholder { color: #2a2a2a !important; }
        .inp-profile:focus { border-color: rgba(248,227,150,0.25) !important; }
        .inp-profile option { background: #111111; color: #cccccc; }
        .sec-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: ${G.text}; margin-bottom: 20px; }
        .sec-icon { width: 30px; height: 30px; border-radius: 8px; background: rgba(248,227,150,0.07); border: 1px solid rgba(248,227,150,0.15); display: flex; align-items: center; justify-content: center; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field-label { color: #555555; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; display: block; }
        .spec-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 5px; font-size: 9px; font-weight: 800; letter-spacing: 1px; background: rgba(248,227,150,0.12); border: 1px solid rgba(248,227,150,0.25); color: ${G.goldLight}; }
        .spec-remove { cursor: pointer; color: ${G.muted}; font-size: 13px; line-height: 1; background: none; border: none; padding: 0; display: flex; align-items: center; }
        .spec-remove:hover { color: #ff6b6b; }
      `}</style>

      {/* HEADER ROW */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <button
          onClick={() => router.push("/mentors")}
          style={{ width: 36, height: 36, borderRadius: 8, background: G.card, border: G.cardBorder, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <i className="fe fe-arrow-left" style={{ color: G.goldLight, fontSize: 15 }} />
        </button>
        <div>
          <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>Mentor Profile Management</h3>
          <small style={{ color: G.muted }}>Manage mentor information, assignments, expertise, and performance from a centralized profile.</small>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, overflow: "hidden" }}>

          {/* Avatar */}
          <div style={{ padding: "32px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: `1px solid ${G.divider}` }}>
            <div style={{
              width: 110, height: 110, borderRadius: "50%",
              border: `3px solid ${G.gold}`,
              boxShadow: `0 0 0 4px rgba(248,227,150,0.1), 0 8px 24px rgba(0,0,0,0.4)`,
              background: "rgba(248,227,150,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 38, fontWeight: 800, color: G.goldLight,
              marginBottom: 16,
            }}>
              {form.name ? form.name.charAt(0).toUpperCase() : <i className="fe fe-user" style={{ fontSize: 36, color: G.gold }} />}
            </div>

            <h5 style={{ color: G.text, fontWeight: 700, margin: "0 0 8px", textAlign: "center", fontSize: 17 }}>
              {form.name || "New Mentor"}
            </h5>

            {form.role && (
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: G.goldFaint, border: `1px solid ${G.divider}`, color: G.goldLight, textAlign: "center", lineHeight: 1.4 }}>
                {form.role}
              </span>
            )}
          </div>

          {/* Experience & Region */}
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${G.divider}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <i className="fe fe-clock" style={{ color: G.muted, fontSize: 11 }} />
                <span style={{ color: G.muted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07rem" }}>Experience</span>
              </div>
              <p style={{ color: G.goldLight, fontWeight: 700, margin: 0, fontSize: 16 }}>
                {form.experience ? `${form.experience} Years` : "—"}
              </p>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <i className="fe fe-globe" style={{ color: G.muted, fontSize: 11 }} />
                <span style={{ color: G.muted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07rem" }}>Region</span>
              </div>
              <p style={{ color: G.text, fontWeight: 700, margin: 0, fontSize: 13 }}>
                {form.region || "—"}
              </p>
            </div>
          </div>

          {/* Operational Metrics */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <i className="fe fe-activity" style={{ color: G.gold, fontSize: 13 }} />
              <span style={{ color: G.goldLight, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07rem" }}>Operational Metrics</span>
            </div>

            {/* PT Saturation */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: G.muted, fontSize: 12, fontWeight: 600 }}>PT Saturation</span>
                <span style={{ color: G.text, fontSize: 12, fontWeight: 700 }}>
                  {form.ptSaturation} / {form.ptSaturationMax}
                </span>
              </div>
              <div style={{ height: 5, background: "rgba(248,227,150,0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${satPct}%`, background: `linear-gradient(90deg, ${G.gold}, ${G.goldLight})`, borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>

            {/* Assigned PTs */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "rgba(248,227,150,0.04)", borderRadius: 8, border: `1px solid ${G.divider}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fe fe-users" style={{ color: G.gold, fontSize: 13 }} />
                <span style={{ color: G.muted, fontSize: 12, fontWeight: 600 }}>Assigned PTs</span>
              </div>
              <span style={{ color: G.text, fontWeight: 800, fontSize: 20 }}>{form.assignedPts}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* CORE INFORMATION */}
          <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, padding: "24px 28px" }}>
            <div className="sec-title">
              <div className="sec-icon">
                <i className="fe fe-monitor" style={{ color: G.gold, fontSize: 13 }} />
              </div>
              Core Information
            </div>

            <div className="form-grid">
              <div>
                <label className="field-label">Full Name</label>
                <input className="inp-profile" placeholder="Enter full name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Title</label>
                <input className="inp-profile" placeholder="e.g. Senior Trainer Success Manager" value={form.role} onChange={(e) => setField("role", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Experience (Years)</label>
                <input className="inp-profile" type="number" min="0" placeholder="e.g. 12" value={form.experience} onChange={(e) => setField("experience", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Region</label>
                <select className="inp-profile" value={form.region} onChange={(e) => setField("region", e.target.value)}>
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Contact Number</label>
                <input className="inp-profile" placeholder="+1 (555) 000-0000" value={form.contact} onChange={(e) => setField("contact", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Assigned PTs</label>
                <input className="inp-profile" type="number" min="0" value={form.assignedPts} onChange={(e) => setField("assignedPts", Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* EXPERTISE & SPECIALIZATION */}
          <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, padding: "24px 28px" }}>
            <div className="sec-title">
              <div className="sec-icon">
                <i className="fe fe-award" style={{ color: G.gold, fontSize: 13 }} />
              </div>
              Expertise &amp; Specialization
            </div>

            <label className="field-label" style={{ marginBottom: 10 }}>Active Specializations</label>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {form.specializations.map((spec) => (
                <span key={spec} className="spec-tag">
                  {spec}
                  <button className="spec-remove" onClick={() => removeSpec(spec)}>×</button>
                </span>
              ))}
              {form.specializations.length === 0 && (
                <span style={{ color: G.muted, fontSize: 12 }}>No specializations added yet.</span>
              )}
            </div>

            {/* Add input */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <i className="fe fe-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 13 }} />
                <input
                  className="inp-profile"
                  placeholder="Search or add new specialization..."
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSpec()}
                  style={{ paddingLeft: 36 }}
                />
              </div>
              <button
                onClick={addSpec}
                style={{ padding: "9px 22px", borderRadius: 8, background: G.gold, border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Add
              </button>
            </div>
          </div>

          {/* OPERATIONAL STATUS */}
          <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, padding: "24px 28px" }}>
            <div className="sec-title">
              <div className="sec-icon">
                <i className="fe fe-bar-chart-2" style={{ color: G.gold, fontSize: 13 }} />
              </div>
              Operational Status
            </div>

            <label className="field-label" style={{ marginBottom: 8 }}>Current Status</label>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              {/* Status select with colored dot */}
              <div style={{ position: "relative", minWidth: 200 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: statusColor.dot, boxShadow: `0 0 6px ${statusColor.dot}` }} />
                <select
                  className="inp-profile"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                  style={{ paddingLeft: 30, color: statusColor.text, fontWeight: 600 }}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Save / Cancel */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: "9px 28px", borderRadius: 8, background: G.gold, border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}
                >
                  {saving ? <><span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} /> Saving…</> : "Save"}
                </button>
                <button
                  onClick={() => router.push("/mentors")}
                  style={{ padding: "9px 22px", borderRadius: 8, background: "#2a2a2a", border: `1px solid ${G.divider}`, color: G.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
