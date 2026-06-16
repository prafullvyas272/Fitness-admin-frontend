import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import {
  uploadWorkout,
  fetchWorkouts,
  removeWorkout,
  updateWorkoutAPI,
  assignTrainersAPI,
  fetchAllTrainerVideos,
  fetchTrainerWorkouts,
} from "../../redux/slices/workoutSlice";
import { fetchTrainers } from "../../redux/slices/trainerSlice";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  divider: "#1e1e1e", text: "#ffffff", muted: "#888888", input: "#111111",
  cardBorder: "1px solid #1e1e1e", goldFaint: "rgba(248,227,150,0.07)",
};

const STATUS_MAP = {
  PUBLISHED: { bg: "rgba(74,222,128,0.12)", color: "#4ade80", border: "rgba(74,222,128,0.25)" },
  PENDING:   { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  REJECTED:  { bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.25)" },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.PUBLISHED;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: "4px 10px", borderRadius: 4, letterSpacing: "0.06em",
      border: `1px solid ${s.border}`,
    }}>
      {status || "PUBLISHED"}
    </span>
  );
}

function formatDuration(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

const ITEMS_PER_PAGE = 10;

export default function Workout() {
  const dispatch = useDispatch();
  const fileRef = useRef();

  const { workouts, trainerWorkouts, trainerLoading, loading, assigning, trainerVideos } = useSelector((s) => s.workout);
  const { trainers } = useSelector((s) => s.trainers);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedTrainers, setSelectedTrainers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trainerFilter, setTrainerFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    title: "", description: "", tags: [], tagInput: "", file: null, preview: "", duration: 0,
  });

  useEffect(() => {
    dispatch(fetchWorkouts());
    dispatch(fetchTrainers());
    dispatch(fetchAllTrainerVideos());
  }, [dispatch]);

  useEffect(() => {
    if (trainerFilter !== "All") {
      dispatch(fetchTrainerWorkouts(trainerFilter));
    }
  }, [trainerFilter, dispatch]);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      setForm((prev) => ({ ...prev, file, preview: url, duration: Math.floor(video.duration) }));
    };
  };

  const addTag = () => {
    if (form.tagInput.trim() && !form.tags.includes(form.tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, form.tagInput.trim()], tagInput: "" });
    }
  };

  const removeTag = (tag) => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });

  const handleSubmit = () => {
    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    form.tags.forEach((tag) => data.append("tags", tag));
    if (form.file) data.append("video", form.file);
    if (editItem) {
      dispatch(updateWorkoutAPI({ id: editItem.id, formData: data }));
    } else {
      dispatch(uploadWorkout(data));
    }
    resetUploadForm();
  };

  const resetUploadForm = () => {
    setForm({ title: "", description: "", tags: [], tagInput: "", file: null, preview: "", duration: 0 });
    setEditItem(null);
    setShowUploadModal(false);
  };

  const handleAssign = async () => {
    if (!selectedVideo || selectedTrainers.length === 0) {
      alert("Select a video and at least one trainer.");
      return;
    }
    await dispatch(assignTrainersAPI({ workoutId: selectedVideo, trainerIds: selectedTrainers }));
    setShowAssignModal(false);
    setSelectedVideo("");
    setSelectedTrainers([]);
  };

  const openEdit = (video) => {
    setEditItem(video);
    setForm({ title: video.title || "", description: video.description || "", tags: video.tags || [], tagInput: "", file: null, preview: "", duration: video.duration || 0 });
    setShowUploadModal(true);
  };

  // When a trainer is selected, use their assigned workouts; otherwise show all
  const sourceVideos = trainerFilter !== "All" ? trainerWorkouts : workouts;

  const allVideos = sourceVideos.map((w) => ({
    ...w,
    status: w.status || "PUBLISHED",
    views: w.views || 0,
    uploadDate: w.createdAt || w.uploadDate || null,
  }));

  const filtered = allVideos.filter((v) => {
    const matchSearch = !searchTerm || v.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalCount = allVideos.length;
  const publishedCount = allVideos.filter((v) => v.status === "PUBLISHED").length;
  const pendingCount = allVideos.filter((v) => v.status === "PENDING").length;
  const rejectedCount = allVideos.filter((v) => v.status === "REJECTED").length;

  const statCards = [
    { label: "Total Videos",     value: totalCount,     accent: G.gold,      pct: 100 },
    { label: "Published",        value: publishedCount, accent: "#4ade80",   pct: totalCount ? (publishedCount / totalCount) * 100 : 0 },
    { label: "Pending Approval", value: pendingCount,   accent: "#fbbf24",   pct: totalCount ? (pendingCount / totalCount) * 100 : 0 },
    { label: "Rejected",         value: rejectedCount,  accent: "#f87171",   pct: totalCount ? (rejectedCount / totalCount) * 100 : 0 },
  ];

  const showStart = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showEnd = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        .wk-modal .modal-content { background: ${G.card}; border: 1px solid ${G.divider}; color: ${G.text}; border-radius: 14px; }
        .wk-modal .modal-body { background: ${G.card} !important; padding: 28px; }
        .wk-modal .btn-close { filter: invert(1) brightness(0.6); }
        .wk-modal .modal-header { border-bottom: 1px solid ${G.divider}; }
        .wk-input::placeholder { color: ${G.muted}; }
        .wk-input:focus { border-color: ${G.gold} !important; outline: none; }
        .wk-search::placeholder { color: ${G.muted}; }
        .wk-search:focus { border-color: ${G.gold} !important; outline: none; }
        .wk-tag-item:hover { background: rgba(248,227,150,0.2) !important; }
        .wk-tr { transition: background 0.12s; }
        .wk-tr:hover td { background: rgba(255,255,255,0.02); }
        .wk-action-btn { background: transparent; border: none; cursor: pointer; padding: 6px 8px; border-radius: 6px; transition: color 0.15s; }
        .wk-filter-sel { background: ${G.input}; border: 1px solid ${G.divider}; border-radius: 8px; padding: 9px 14px; color: ${G.text}; font-size: 13px; cursor: pointer; outline: none; }
        .wk-filter-sel:focus { border-color: ${G.gold}; }
        @keyframes wk-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: G.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>
          ASSET MANAGEMENT
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: G.text, fontWeight: 700, fontSize: 26, margin: 0 }}>Video Performance Ledger</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowAssignModal(true)}
              style={{ background: "transparent", border: `1px solid rgba(248,227,150,0.4)`, color: G.gold, padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              Assign Trainer
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              style={{ background: G.gold, border: "none", color: "#000", padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
            >
              + Upload Video
            </button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "20px 24px 18px" }}>
            <p style={{ color: G.muted, fontSize: 13, margin: "0 0 8px", fontWeight: 500 }}>{s.label}</p>
            <h2 style={{ color: G.text, fontSize: 38, fontWeight: 700, margin: "0 0 18px", letterSpacing: "-0.02em" }}>{s.value}</h2>
            <div style={{ height: 3, background: "#1e1e1e", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${Math.max(s.pct, s.value > 0 ? 8 : 0)}%`, background: s.accent, borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* TABLE CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, overflow: "hidden" }}>

        {/* TOOLBAR */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: `1px solid ${G.divider}`, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <i className="fe fe-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 14, pointerEvents: "none" }} />
            <input
              className="wk-search"
              type="text"
              placeholder="Search video assets..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "9px 12px 9px 36px", color: G.text, fontSize: 13, transition: "border-color 0.2s" }}
            />
          </div>
          <select className="wk-filter-sel" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="All">Status: All</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select className="wk-filter-sel" value={trainerFilter} onChange={(e) => { setTrainerFilter(e.target.value); setCurrentPage(1); setSearchTerm(""); setStatusFilter("All"); }}>
            <option value="All">Trainer: All</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#111111" }}>
              {[
                { label: "Asset Details", align: "left",  width: "40%" },
                { label: "Status",        align: "left",  width: "14%" },
                { label: "Engagement",    align: "left",  width: "14%" },
                { label: "Upload Date",   align: "left",  width: "16%" },
                { label: "Actions",       align: "right", width: "16%" },
              ].map((h) => (
                <th key={h.label} style={{ padding: "11px 20px", textAlign: h.align, width: h.width, color: "rgba(248,227,150,0.6)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${G.divider}` }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(loading || trainerLoading) ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "56px 0" }}>
                  <div style={{ width: 22, height: 22, border: `3px solid ${G.divider}`, borderTop: `3px solid ${G.gold}`, borderRadius: "50%", animation: "wk-spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                  <span style={{ color: G.muted, fontSize: 14 }}>
                    {trainerFilter !== "All" ? "Loading trainer videos..." : "Loading videos..."}
                  </span>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "56px 0", color: G.muted, fontSize: 14 }}>
                  {trainerFilter !== "All"
                    ? "No videos assigned to this trainer"
                    : "No videos found"}
                </td>
              </tr>
            ) : paginated.map((video) => {
              const dur = formatDuration(video.duration);
              return (
                <tr key={video.id} className="wk-tr" style={{ borderBottom: `1px solid ${G.divider}` }}>

                  {/* ASSET DETAILS */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Thumbnail */}
                      <div style={{ position: "relative", width: 72, height: 48, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#161616", cursor: "pointer" }} onClick={() => setPreviewVideo(video)}>
                        {video.videoUrl ? (
                          <video src={video.videoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted preload="metadata" />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fe fe-film" style={{ color: G.muted, fontSize: 20 }} />
                          </div>
                        )}
                        {dur && (
                          <div style={{ position: "absolute", bottom: 3, right: 4, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 3, lineHeight: 1.5 }}>
                            {dur}
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div>
                        <div style={{ color: G.text, fontWeight: 600, fontSize: 14, marginBottom: 3, lineHeight: 1.3 }}>{video.title || "Untitled"}</div>
                        <div style={{ color: G.muted, fontSize: 12 }}>
                          {(video.tags?.length > 0 ? video.tags[0] : "General")} &bull; {video.description ? "HD" : "4K"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={video.status} />
                  </td>

                  {/* ENGAGEMENT */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ color: G.text, fontWeight: 700, fontSize: 16 }}>{formatViews(video.views)}</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>Views</div>
                  </td>

                  {/* DATE */}
                  <td style={{ padding: "14px 20px", color: "#cccccc", fontSize: 13 }}>
                    {formatDate(video.uploadDate)}
                  </td>

                  {/* ACTIONS */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                      <button
                        className="wk-action-btn"
                        style={{ color: G.muted }}
                        onMouseEnter={(e) => e.currentTarget.style.color = G.gold}
                        onMouseLeave={(e) => e.currentTarget.style.color = G.muted}
                        onClick={() => openEdit(video)}
                        title="Edit"
                      >
                        <i className="fe fe-edit-2" style={{ fontSize: 15 }} />
                      </button>
                      <button
                        className="wk-action-btn"
                        style={{ color: G.muted }}
                        onMouseEnter={(e) => e.currentTarget.style.color = G.gold}
                        onMouseLeave={(e) => e.currentTarget.style.color = G.muted}
                        onClick={() => setPreviewVideo(video)}
                        title="Preview"
                      >
                        <i className="fe fe-bar-chart-2" style={{ fontSize: 15 }} />
                      </button>
                      {video.status !== "REJECTED" && (
                        <button
                          className="wk-action-btn"
                          style={{ color: G.muted }}
                          onMouseEnter={(e) => e.currentTarget.style.color = G.gold}
                          onMouseLeave={(e) => e.currentTarget.style.color = G.muted}
                          title="Share"
                        >
                          <i className="fe fe-share-2" style={{ fontSize: 15 }} />
                        </button>
                      )}
                      {video.status === "REJECTED" && (
                        <button
                          className="wk-action-btn"
                          style={{ color: G.muted }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
                          onMouseLeave={(e) => e.currentTarget.style.color = G.muted}
                          onClick={() => dispatch(removeWorkout(video.id))}
                          title="Delete"
                        >
                          <i className="fe fe-trash-2" style={{ fontSize: 15 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: `1px solid ${G.divider}` }}>
          <span style={{ color: G.muted, fontSize: 13 }}>
            Showing {showStart}–{showEnd} of {filtered.length} videos
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ background: "transparent", border: `1px solid ${G.divider}`, color: currentPage === 1 ? "#444" : G.muted, padding: "6px 18px", borderRadius: 8, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500 }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || totalPages === 0}
              style={{ background: (currentPage >= totalPages || totalPages === 0) ? "transparent" : G.gold, border: `1px solid ${(currentPage >= totalPages || totalPages === 0) ? G.divider : G.gold}`, color: (currentPage >= totalPages || totalPages === 0) ? "#444" : "#000", padding: "6px 18px", borderRadius: 8, cursor: (currentPage >= totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* VIDEO PREVIEW MODAL */}
      <Modal show={!!previewVideo} onHide={() => setPreviewVideo(null)} centered className="wk-modal" size="lg">
        <Modal.Body style={{ padding: 0 }}>
          <video src={previewVideo?.videoUrl} controls autoPlay style={{ width: "100%", borderRadius: 14, display: "block" }} />
        </Modal.Body>
      </Modal>

      {/* ASSIGN TRAINER MODAL */}
      <Modal show={showAssignModal} onHide={() => { setShowAssignModal(false); setSelectedTrainers([]); setSelectedVideo(""); }} centered className="wk-modal">
        <Modal.Body>
          <h4 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 20 }}>Assign Trainers</h4>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Select Video</label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "9px 12px", color: G.text, fontSize: 13 }}
            >
              <option value="">— Choose a video —</option>
              {workouts.map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>
          <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 10 }}>Select Trainers</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto", marginBottom: 20 }}>
            {trainers.map((t) => (
              <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 12px", borderRadius: 8, background: selectedTrainers.includes(t.id) ? G.goldFaint : "transparent", border: `1px solid ${selectedTrainers.includes(t.id) ? G.gold : G.divider}`, transition: "all 0.15s" }}>
                <input type="checkbox" checked={selectedTrainers.includes(t.id)} style={{ accentColor: G.gold, width: 16, height: 16 }}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedTrainers([...selectedTrainers, t.id]);
                    else setSelectedTrainers(selectedTrainers.filter((id) => id !== t.id));
                  }}
                />
                <span style={{ color: G.text, fontSize: 13 }}>{t.firstName} {t.lastName}</span>
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => { setShowAssignModal(false); setSelectedTrainers([]); setSelectedVideo(""); }} style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
              Cancel
            </button>
            <button onClick={handleAssign} disabled={assigning} style={{ background: assigning ? "#333" : G.gold, border: "none", color: assigning ? G.muted : "#000", padding: "7px 20px", borderRadius: 8, fontWeight: 700, cursor: assigning ? "not-allowed" : "pointer", fontSize: 13 }}>
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* UPLOAD / EDIT MODAL */}
      <Modal show={showUploadModal} onHide={resetUploadForm} centered className="wk-modal">
        <Modal.Body>
          <h4 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 20 }}>
            {editItem ? "Edit Workout" : "Upload Workout"}
          </h4>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Title</label>
            <input className="wk-input" type="text" placeholder="Enter workout title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "9px 12px", color: G.text, fontSize: 13, transition: "border-color 0.2s" }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Description</label>
            <textarea className="wk-input" placeholder="Enter description" value={form.description} rows={3}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "9px 12px", color: G.text, fontSize: 13, resize: "none", transition: "border-color 0.2s" }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Upload Video</label>
            <div onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${G.divider}`, borderRadius: 10, padding: "24px 16px", textAlign: "center", cursor: "pointer", color: G.muted, fontSize: 13, transition: "border-color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = G.gold}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = G.divider}
            >
              <i className="fe fe-upload-cloud" style={{ fontSize: 22, display: "block", marginBottom: 6 }} />
              {form.file ? form.file.name : "Click to upload video"}
            </div>
            <input type="file" accept="video/*" ref={fileRef} hidden onChange={(e) => handleFile(e.target.files[0])} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Category</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input className="wk-input" type="text" placeholder="Add Category" value={form.tagInput}
                onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                style={{ flex: 1, background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "8px 12px", color: G.text, fontSize: 13, transition: "border-color 0.2s" }}
              />
              <button onClick={addTag} style={{ background: G.gold, border: "none", color: "#000", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Add</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {form.tags.map((tag) => (
                <span key={tag} className="wk-tag-item" onClick={() => removeTag(tag)}
                  style={{ background: G.goldFaint, border: `1px solid ${G.divider}`, color: G.goldLight, padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", transition: "background 0.15s" }}>
                  {tag} ✕
                </span>
              ))}
            </div>
          </div>
          {form.preview && (
            <div style={{ marginBottom: 14, borderRadius: 8, overflow: "hidden" }}>
              <video src={form.preview} controls style={{ width: "100%", borderRadius: 8 }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={resetUploadForm} style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
            <button onClick={handleSubmit} style={{ background: G.gold, border: "none", color: "#000", padding: "7px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              {editItem ? "Update" : "Upload Video"}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
