import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { InputGroup, Form } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import ReactCountryFlag from "react-country-flag";
import { useDispatch, useSelector } from "react-redux";
import { createMentor, updateMentor, fetchMentorById, fetchUnassignedTrainers, assignTrainers, unassignTrainer } from "../../redux/slices/mentorSlice";
import { fetchSpecialities } from "../../redux/slices/specialitySlice";

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
const STATUS_API = { Active: "ACTIVE", "In Review": "IN_REVIEW", Suspended: "SUSPENDED" };
const STATUS_DISPLAY = { ACTIVE: "Active", IN_REVIEW: "In Review", SUSPENDED: "Suspended" };

const STATUS_COLORS = {
  Active:      { dot: "#4ade80", bg: "rgba(34,197,94,0.12)",  text: "#4ade80" },
  "In Review": { dot: "#fbbf24", bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  Suspended:   { dot: "#f87171", bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
};

const COUNTRY_OPTIONS = [
  { code: "+91",  country: "IN" },
  { code: "+1",   country: "US" },
  { code: "+44",  country: "GB" },
  { code: "+971", country: "AE" },
  { code: "+61",  country: "AU" },
];
const KNOWN_CODES = ["+971", "+91", "+61", "+44", "+1"];

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", password: "",
  phone: "", countryCode: "+44", country: "GB",
  title: "", experience: "", region: "North America",
  maxPTs: 30, status: "Active",
  specialities: [],   // [{id, name}]
  photoFile: null, photoPreview: "",
  ptSaturation: 0, ptSaturationMax: 30, assignedPts: 0,
};

export default function MentorProfile() {
  const router   = useRouter();
  const dispatch = useDispatch();
  const { id }   = router.query;
  const isNew    = id === "new";

  const { selected, saving, loading } = useSelector((s) => s.mentors);
  const { skills: specialities }      = useSelector((s) => s.speciality);

  const [form, setForm]             = useState(EMPTY_FORM);
  const [specSearch, setSpecSearch] = useState("");
  const [showSugg, setShowSugg]     = useState(false);
  const [loaded, setLoaded]         = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [activeTab, setActiveTab]   = useState("overview");

  // fetch specialities for dropdown
  useEffect(() => { dispatch(fetchSpecialities()); }, [dispatch]);

  // fetch mentor data when editing
  useEffect(() => {
    if (!id) return;
    if (isNew) { setLoaded(true); return; }
    dispatch(fetchMentorById(id));
  }, [id, isNew, dispatch]);

  // populate form from API response
  // Response shape: { id, firstName, lastName, email, phone, isActive,
  //   mentorProfile: { title, experience, region, maxPTs, status, avatarUrl },
  //   specialities: [{ specialityId, speciality: { id, name } }],
  //   assignedPTs }
  useEffect(() => {
    if (!selected || isNew) return;

    const raw = selected.phone || "";
    let countryCode = "+44";
    let phone = raw;
    for (const code of KNOWN_CODES) {
      if (raw.startsWith(code)) { countryCode = code; phone = raw.slice(code.length); break; }
    }
    const countryObj = COUNTRY_OPTIONS.find((c) => c.code === countryCode) || { country: "GB" };
    const profile    = selected.mentorProfile || {};

    setForm({
      firstName:       selected.firstName  || "",
      lastName:        selected.lastName   || "",
      email:           selected.email      || "",
      password:        "",
      phone,
      countryCode,
      country:         countryObj.country,
      title:           profile.title       || "",
      experience:      profile.experience  != null ? String(profile.experience) : "",
      region:          profile.region      || "North America",
      maxPTs:          profile.maxPTs      ?? 30,
      status:          STATUS_DISPLAY[profile.status] || "Active",
      specialities:    (selected.specialities || []).map((s) => ({
                         id:   s.specialityId || s.speciality?.id,
                         name: s.speciality?.name || "",
                       })),
      photoFile:       null,
      photoPreview:    profile.avatarUrl   || "",
      ptSaturation:    selected.assignedPTs ?? 0,
      ptSaturationMax: profile.maxPTs      ?? 30,
      assignedPts:     selected.assignedPTs ?? 0,
    });
    setLoaded(true);
  }, [selected, isNew]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const removeSpec = (id) =>
    set("specialities", form.specialities.filter((s) => s.id !== id));

  const addSpec = (spec) => {
    if (form.specialities.find((s) => s.id === spec._id)) return;
    set("specialities", [...form.specialities, { id: spec._id, name: spec.name }]);
    setSpecSearch("");
    setShowSugg(false);
  };

  const suggestions = specialities.filter(
    (s) =>
      s.name.toLowerCase().includes(specSearch.toLowerCase()) &&
      !form.specialities.find((sel) => sel.id === s._id)
  );

  const handleSave = async () => {
    if (!form.firstName.trim()) { alert("First name is required"); return; }
    if (!form.lastName.trim())  { alert("Last name is required");  return; }
    if (isNew && !form.email.trim())    { alert("Email is required");    return; }
    if (isNew && !form.password.trim()) { alert("Password is required"); return; }


    const fd = new FormData();
    if (isNew) {
      // For new mentor, send all required fields
      fd.append("firstName",  form.firstName);
      fd.append("lastName",   form.lastName);
      fd.append("email",      form.email);
      fd.append("password",   form.password);
    } else {
      // For update, only send fields that might have changed
      if (form.firstName) fd.append("firstName",  form.firstName);
      if (form.lastName)  fd.append("lastName",   form.lastName);
      if (form.password.trim()) fd.append("password", form.password);
    }

    if (form.phone)      fd.append("phone",      `${form.countryCode}${form.phone}`);
    if (form.title)      fd.append("title",      form.title);
    if (form.experience) fd.append("experience", form.experience);
    fd.append("region",  form.region);
    fd.append("maxPTs",  form.maxPTs);
    fd.append("status",  STATUS_API[form.status] || "ACTIVE");
    if (form.specialities.length)
      fd.append("specialityIds", JSON.stringify(form.specialities.map((s) => s.id)));
    if (form.photoFile)  fd.append("profilePhoto", form.photoFile);

    try {
      if (isNew) {
        await dispatch(createMentor(fd)).unwrap();
        alert("Mentor created ✅");
      } else {
        await dispatch(updateMentor({ id, formData: fd })).unwrap();
        alert("Mentor updated ✅");
      }
      router.push("/mentors");
    } catch (err) {
      alert(err || "Something went wrong");
    }
  };

  const satPct      = form.ptSaturationMax > 0 ? Math.min(100, (form.ptSaturation / form.ptSaturationMax) * 100) : 0;
  const statusColor = STATUS_COLORS[form.status] || STATUS_COLORS.Active;
  const displayName = [form.firstName, form.lastName].filter(Boolean).join(" ") || "New Mentor";

  if (!loaded && !isNew) {
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
        .dk-ig { background: #222 !important; border: 1px solid ${G.divider} !important; border-radius: 8px !important; }
        .dk-ig .form-control { background: ${G.input} !important; border: none !important; color: ${G.text} !important; font-size: 12.5px; }
        .dk-ig .form-control:focus { background: ${G.input} !important; box-shadow: none !important; }
        .dk-ig .form-control::placeholder { color: #2a2a2a !important; }
        .dk-ddm { background: #1e1e1e !important; border: 1px solid ${G.divider} !important; }
        .dk-ddm .dropdown-item { color: ${G.text} !important; font-size: 13px; }
        .dk-ddm .dropdown-item:hover { background: rgba(248,227,150,0.07) !important; color: ${G.goldLight} !important; }
        .dk-flag-toggle { background: #2a2a2a !important; border: none !important; color: ${G.text} !important; border-right: 1px solid ${G.divider} !important; display: flex !important; align-items: center !important; gap: 6px; min-width: 100px; }
        .dk-flag-toggle:hover, .dk-flag-toggle:focus { background: #333 !important; }
        .dk-flag-toggle::after { display: none !important; }
        .btn-region-toggle::after { display: none !important; }
        .btn-region-toggle:hover, .btn-region-toggle:focus, .btn-region-toggle:active { background: ${G.input} !important; border-color: rgba(248,227,150,0.25) !important; box-shadow: none !important; }
        .avatar-upload-wrap { width: 110px; height: 110px; border-radius: 50%; border: 3px solid ${G.gold}; background: rgba(248,227,150,0.07); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; margin: 0 auto 16px; }
        .avatar-upload-wrap .avatar-upload-overlay { opacity: 0; transition: opacity 0.2s ease; }
        .avatar-upload-wrap:hover .avatar-upload-overlay { opacity: 1; }
        .avatar-upload-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.72); text-align: center; padding: 5px 0; font-size: 10px; font-weight: 700; color: ${G.gold}; letter-spacing: 0.5px; }
        .sugg-box { position: absolute; top: 100%; left: 0; right: 0; background: #1e1e1e; border: 1px solid ${G.divider}; border-radius: 7px; z-index: 99; max-height: 160px; overflow-y: auto; margin-top: 4px; }
        .sugg-item { padding: 9px 14px; font-size: 12px; color: #cccccc; cursor: pointer; }
        .sugg-item:hover { background: rgba(248,227,150,0.07); color: ${G.goldLight}; }
      `}</style>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => router.push("/mentors")}
          style={{ background: "transparent", border: "1px solid rgba(248,227,150,0.25)", color: G.gold, padding: "6px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, marginBottom: 12 }}
        >
          ← Back
        </button>
        <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>Mentor Profile Management</h3>
        <small style={{ color: G.muted }}>Manage mentor information, assignments, expertise, and performance from a centralized profile.</small>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, overflow: "hidden" }}>

          {/* Avatar Upload */}
          <div style={{ padding: "32px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: `1px solid ${G.divider}` }}>
            <div
              className="avatar-upload-wrap"
              onClick={() => document.getElementById("mentorPhotoInput").click()}
            >
              {form.photoPreview ? (
                <img src={form.photoPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <img
                  src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1771390209/Layer_x0020_1_p5f6fs.png"
                  alt="logo"
                  style={{ width: 80, height: 80, objectFit: "contain", opacity: 0.13, pointerEvents: "none" }}
                />
              )}
              <div className="avatar-upload-overlay">Upload Photo</div>
              <input
                type="file"
                id="mentorPhotoInput"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  set("photoFile", file);
                  set("photoPreview", URL.createObjectURL(file));
                }}
              />
            </div>
            <p style={{ color: G.muted, fontSize: 11, textAlign: "center", margin: 0 }}>
              150×150 · PNG, JPG (Max 2MB)
            </p>

            <h5 style={{ color: G.text, fontWeight: 700, margin: "14px 0 6px", textAlign: "center", fontSize: 16 }}>
              {displayName}
            </h5>

            {form.title && (
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: G.goldFaint, border: `1px solid ${G.divider}`, color: G.goldLight, textAlign: "center" }}>
                {form.title}
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
                {form.experience ? `${form.experience} Yrs` : "—"}
              </p>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <i className="fe fe-globe" style={{ color: G.muted, fontSize: 11 }} />
                <span style={{ color: G.muted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07rem" }}>Region</span>
              </div>
              <p style={{ color: G.text, fontWeight: 700, margin: 0, fontSize: 12 }}>
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

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: G.muted, fontSize: 12, fontWeight: 600 }}>PT Saturation</span>
                <span style={{ color: G.text, fontSize: 12, fontWeight: 700 }}>{form.ptSaturation} / {form.ptSaturationMax}</span>
              </div>
              <div style={{ height: 5, background: "rgba(248,227,150,0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${satPct}%`, background: `linear-gradient(90deg, ${G.gold}, ${G.goldLight})`, borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>

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

          {/* TABS */}
          {!isNew && (
            <div style={{ display: "flex", borderBottom: `1px solid ${G.divider}`, gap: 0 }}>
              {["overview", "pts"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: "transparent", border: "none",
                    borderBottom: activeTab === tab ? `2px solid ${G.gold}` : "2px solid transparent",
                    color: activeTab === tab ? G.goldLight : G.muted,
                    padding: "10px 24px", cursor: "pointer",
                    fontWeight: activeTab === tab ? 700 : 400,
                    fontSize: 14, textTransform: "capitalize", marginBottom: -1,
                    fontFamily: "Montserrat, Arial, sans-serif",
                  }}
                >
                  {tab === "pts" ? "PTs" : "Overview"}
                </button>
              ))}
            </div>
          )}

          {/* PTs TAB */}
          {activeTab === "pts" && !isNew && (
            <PTsTab assignedTrainers={selected?.assignedTrainers || []} G={G} mentorId={id} />
          )}

          {/* OVERVIEW TAB (or always show when new) */}
          {(activeTab === "overview" || isNew) && (
            <>

          {/* CORE INFORMATION */}
          <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, padding: "24px 28px" }}>
            <div className="sec-title">
              <div className="sec-icon"><i className="fe fe-monitor" style={{ color: G.gold, fontSize: 13 }} /></div>
              Core Information
            </div>

            <div className="form-grid">
              <div>
                <label className="field-label">First Name</label>
                <input className="inp-profile" placeholder="First name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Last Name</label>
                <input className="inp-profile" placeholder="Last name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </div>

              {isNew && (
                <div>
                  <label className="field-label">Email</label>
                  <input className="inp-profile" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              )}

              <div>
                <label className="field-label">{isNew ? "Password" : "New Password"}</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="inp-profile"
                    type={showPass ? "text" : "password"}
                    placeholder={isNew ? "Strong@123" : "Leave blank to keep current"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: G.muted, padding: 0, display: "flex", alignItems: "center" }}
                  >
                    <i className={`fe ${showPass ? "fe-eye-off" : "fe-eye"}`} style={{ fontSize: 15 }} />
                  </button>
                </div>
              </div>

              <div>
                <label className="field-label">Phone</label>
                <InputGroup className="dk-ig">
                  <Dropdown>
                    <Dropdown.Toggle className="dk-flag-toggle">
                      <ReactCountryFlag countryCode={form.country} svg style={{ width: 20 }} />
                      {form.countryCode}
                      <i className="fe fe-chevron-down" style={{ fontSize: 11, color: G.muted, marginLeft: "auto" }} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dk-ddm">
                      {COUNTRY_OPTIONS.map((c) => (
                        <Dropdown.Item key={c.code} onClick={() => setForm((f) => ({ ...f, countryCode: c.code, country: c.country }))}>
                          <ReactCountryFlag countryCode={c.country} svg style={{ width: 20, marginRight: 10 }} />
                          {c.code}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Form.Control
                    value={form.phone}
                    placeholder="Phone number"
                    onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                  />
                </InputGroup>
              </div>

              <div>
                <label className="field-label">Title</label>
                <input className="inp-profile" placeholder="e.g. Senior Trainer Success Manager" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>

              <div>
                <label className="field-label">Experience (Years)</label>
                <input className="inp-profile" type="number" min="0" placeholder="e.g. 5" value={form.experience} onChange={(e) => set("experience", e.target.value)} />
              </div>

              <div>
                <label className="field-label">Region</label>
                <Dropdown style={{ width: "100%" }}>
                  <Dropdown.Toggle
                    className="btn-region-toggle"
                    style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, color: form.region ? G.text : G.muted, borderRadius: 7, padding: "10px 13px", fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 400 }}
                  >
                    {form.region || "Select region"}
                    <i className="fe fe-chevron-down" style={{ fontSize: 11, color: G.muted }} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dk-ddm" style={{ width: "100%" }}>
                    {REGIONS.map((r) => (
                      <Dropdown.Item key={r} onClick={() => set("region", r)} style={{ color: form.region === r ? G.gold : G.text }}>
                        {r}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div>
                <label className="field-label">Max PTs</label>
                <input className="inp-profile" type="number" min="0" placeholder="30" value={form.maxPTs} onChange={(e) => set("maxPTs", Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* EXPERTISE & SPECIALIZATION */}
          <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, padding: "24px 28px" }}>
            <div className="sec-title">
              <div className="sec-icon"><i className="fe fe-award" style={{ color: G.gold, fontSize: 13 }} /></div>
              Expertise &amp; Specialization
            </div>

            <label className="field-label" style={{ marginBottom: 10 }}>Active Specializations</label>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {form.specialities.map((spec) => (
                <span key={spec.id} className="spec-tag">
                  {spec.name}
                  <button className="spec-remove" onClick={() => removeSpec(spec.id)}>×</button>
                </span>
              ))}
              {form.specialities.length === 0 && (
                <span style={{ color: G.muted, fontSize: 12 }}>No specializations added yet.</span>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                <i className="fe fe-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 13 }} />
                <input
                  className="inp-profile"
                  placeholder="Search or add new specialization..."
                  value={specSearch}
                  style={{ paddingLeft: 36 }}
                  onChange={(e) => { setSpecSearch(e.target.value); setShowSugg(true); }}
                  onFocus={() => setShowSugg(true)}
                  onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                />
              </div>
              {showSugg && suggestions.length > 0 && (
                <div className="sugg-box">
                  {suggestions.map((s) => (
                    <div key={s._id} className="sugg-item" onMouseDown={() => addSpec(s)}>
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* OPERATIONAL STATUS */}
          <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, padding: "24px 28px" }}>
            <div className="sec-title">
              <div className="sec-icon"><i className="fe fe-bar-chart-2" style={{ color: G.gold, fontSize: 13 }} /></div>
              Operational Status
            </div>

            <label className="field-label" style={{ marginBottom: 8 }}>Current Status</label>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ position: "relative", minWidth: 200 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: statusColor.dot, boxShadow: `0 0 6px ${statusColor.dot}` }} />
                <select
                  className="inp-profile"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  style={{ paddingLeft: 30, color: statusColor.text, fontWeight: 600 }}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

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

            </>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── PTs Tab Component ── */
function PTsTab({ assignedTrainers, G, mentorId }) {
  const dispatch = useDispatch();
  const { unassignedTrainers, assigning } = useSelector((s) => s.mentors);

  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const openModal = () => {
    dispatch(fetchUnassignedTrainers());
    setSelectedIds([]);
    setModalSearch("");
    setShowModal(true);
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAssign = async () => {
    if (!selectedIds.length) return;
    try {
      await dispatch(assignTrainers({ mentorId, trainerIds: selectedIds })).unwrap();
      dispatch(fetchMentorById(mentorId));
      setShowModal(false);
    } catch (err) { alert(err || "Failed to assign"); }
  };

  const handleUnassign = async (trainerId) => {
    if (!confirm("Remove this PT from mentor?")) return;
    try {
      await dispatch(unassignTrainer({ mentorId, trainerId })).unwrap();
      dispatch(fetchMentorById(mentorId));
    } catch (err) { alert(err || "Failed to unassign"); }
  };

  const filtered = assignedTrainers.filter((pt) => {
    const name = [pt.firstName, pt.lastName].filter(Boolean).join(" ").toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      (pt.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (pt.phone || "").includes(search)
    );
  });

  const filteredUnassigned = unassignedTrainers.filter((t) => {
    const name = [t.firstName, t.lastName].filter(Boolean).join(" ").toLowerCase();
    return (
      name.includes(modalSearch.toLowerCase()) ||
      (t.email || "").toLowerCase().includes(modalSearch.toLowerCase())
    );
  });

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <i className="fe fe-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 13 }} />
              <input
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, color: "#cccccc", borderRadius: 7, padding: "8px 12px 8px 36px", fontSize: 13, outline: "none" }}
              />
            </div>
            <button
              onClick={openModal}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: G.gold, border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <i className="fe fe-plus" style={{ fontSize: 14 }} /> Add PT
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["TRAINER", "EMAIL", "PHONE", ""].map((h, i) => (
                    <th key={i} style={{ background: "#111111", color: "rgba(248,227,150,0.6)", borderBottom: `1px solid ${G.divider}`, fontSize: 10, letterSpacing: "1.2px", padding: "12px 16px", fontWeight: 700, textAlign: i === 3 ? "right" : "left" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ background: G.card, padding: "48px 16px", textAlign: "center", color: G.muted, fontSize: 13 }}>
                      <i className="fe fe-users" style={{ fontSize: 28, display: "block", marginBottom: 10, opacity: 0.3 }} />
                      No PTs assigned yet
                    </td>
                  </tr>
                ) : filtered.map((pt) => {
                  const name = [pt.firstName, pt.lastName].filter(Boolean).join(" ");
                  return (
                    <tr key={pt.id} style={{ borderBottom: "1px solid #141414" }}>
                      <td style={{ background: G.card, padding: "14px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(248,227,150,0.07)", border: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: G.goldLight, flexShrink: 0 }}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#cccccc" }}>{name}</span>
                        </div>
                      </td>
                      <td style={{ background: G.card, padding: "14px 16px", color: G.muted, fontSize: 12, verticalAlign: "middle" }}>{pt.email || "—"}</td>
                      <td style={{ background: G.card, padding: "14px 16px", color: G.muted, fontSize: 12, verticalAlign: "middle" }}>{pt.phone || "—"}</td>
                      <td style={{ background: G.card, padding: "14px 16px", textAlign: "right", verticalAlign: "middle" }}>
                        <button
                          onClick={() => handleUnassign(pt.id)}
                          disabled={assigning}
                          style={{ width: 30, height: 30, borderRadius: 6, cursor: assigning ? "not-allowed" : "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: assigning ? 0.5 : 1 }}
                        >
                          <i className="fe fe-user-minus" style={{ color: "#f87171", fontSize: 13 }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div style={{ padding: "12px 24px", borderTop: `1px solid ${G.divider}` }}>
              <span style={{ color: G.muted, fontSize: 12 }}>{filtered.length} trainer{filtered.length !== 1 ? "s" : ""} assigned</span>
            </div>
          )}
        </div>
      </div>

      {/* ── ADD PT MODAL ── */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, width: "100%", maxWidth: 500, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h5 style={{ color: G.text, fontWeight: 700, margin: 0, fontSize: 15 }}>Assign PTs</h5>
                <p style={{ color: G.muted, fontSize: 12, margin: "4px 0 0" }}>Select trainers to assign to this mentor</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
            </div>

            {/* Modal search */}
            <div style={{ padding: "14px 24px", borderBottom: `1px solid ${G.divider}` }}>
              <div style={{ position: "relative" }}>
                <i className="fe fe-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 13 }} />
                <input
                  placeholder="Search trainers..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, color: "#cccccc", borderRadius: 7, padding: "8px 12px 8px 36px", fontSize: 13, outline: "none" }}
                />
              </div>
            </div>

            {/* Trainer list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredUnassigned.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center", color: G.muted, fontSize: 13 }}>
                  <i className="fe fe-users" style={{ fontSize: 26, display: "block", marginBottom: 10, opacity: 0.3 }} />
                  No unassigned trainers found
                </div>
              ) : filteredUnassigned.map((t) => {
                const name     = [t.firstName, t.lastName].filter(Boolean).join(" ");
                const selected = selectedIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleSelect(t.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", cursor: "pointer", borderBottom: `1px solid ${G.divider}`, background: selected ? "rgba(248,227,150,0.05)" : "transparent", transition: "background 0.15s" }}
                  >
                    {/* Checkbox */}
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? G.gold : "#333"}`, background: selected ? G.gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                      {selected && <i className="fe fe-check" style={{ fontSize: 11, color: "#000" }} />}
                    </div>

                    {/* Avatar */}
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(248,227,150,0.07)", border: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: G.goldLight, flexShrink: 0 }}>
                      {name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#cccccc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                      <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{t.email || "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal footer */}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: G.muted, fontSize: 12 }}>
                {selectedIds.length} trainer{selectedIds.length !== 1 ? "s" : ""} selected
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ padding: "8px 20px", borderRadius: 8, background: "#2a2a2a", border: `1px solid ${G.divider}`, color: G.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedIds.length || assigning}
                  style={{ padding: "8px 22px", borderRadius: 8, background: selectedIds.length ? G.gold : "#333", border: "none", color: selectedIds.length ? "#000" : G.muted, fontWeight: 700, fontSize: 13, cursor: selectedIds.length && !assigning ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6, opacity: assigning ? 0.7 : 1 }}
                >
                  {assigning ? <><span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} /> Assigning…</> : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
