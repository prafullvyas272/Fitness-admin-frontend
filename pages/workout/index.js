import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import {
  uploadWorkout,
  fetchWorkouts,
  removeWorkout,
  updateWorkoutAPI,
  setPage,
  fetchTrainerWorkouts,
  assignTrainersAPI,
  fetchAllTrainerVideos,
} from "../../redux/slices/workoutSlice";
import { fetchTrainers } from "../../redux/slices/trainerSlice";

const G = {
  bg: "#111111", card: "#1a1a1a", gold: "#d4a017", goldLight: "#f5d76e",
  divider: "rgba(212,160,23,0.2)", text: "#f1f1f1", muted: "#888888", input: "#222222",
};

export default function Workout() {
  const dispatch = useDispatch();
  const fileRef = useRef();

  const {
    workouts,
    trainerWorkouts,
    currentPage,
    itemsPerPage,
    loading,
    assigning,
    trainerLoading,
  } = useSelector((state) => state.workout);

  const { trainers, loading: trainersLoading } = useSelector((state) => state.trainers);

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [searchTrainer, setSearchTrainer] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedTrainers, setSelectedTrainers] = useState([]);

  const [previewVideo, setPreviewVideo] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const { trainerVideos, trainerVideosLoading } = useSelector((state) => state.workout);

  const filteredTrainerVideos = trainerVideos.filter(
    (video) => video.trainer?.id === selectedTrainer?.id
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: [],
    tagInput: "",
    file: null,
    preview: "",
    duration: 0,
  });

  useEffect(() => {
    dispatch(fetchWorkouts());
    dispatch(fetchTrainers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllTrainerVideos());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTrainer) {
      dispatch(fetchTrainerWorkouts(selectedTrainer.id));
    }
  }, [selectedTrainer, dispatch]);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      setForm((prev) => ({ ...prev, file, preview: url, duration: Math.floor(video.duration) }));
    };
  };

  const allTags = [...new Set(workouts.flatMap((w) => w.tags))];

  const addTag = () => {
    if (form.tagInput.trim() && !form.tags.includes(form.tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, form.tagInput.trim()], tagInput: "" });
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

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
    resetForm();
  };

  const resetForm = () => {
    setForm({ title: "", description: "", tags: [], tagInput: "", file: null, preview: "", duration: 0 });
    setEditItem(null);
    setShowModal(false);
  };

  const handleAssign = async () => {
    if (!selectedVideo || selectedTrainers.length === 0) {
      alert("Select video and trainers");
      return;
    }
    await dispatch(assignTrainersAPI({ workoutId: selectedVideo, trainerIds: selectedTrainers }));
    setShowAssignModal(false);
    setSelectedVideo("");
    setSelectedTrainers([]);
  };

  const totalPages = Math.ceil(workouts.length / itemsPerPage);

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24, display: "flex", flexDirection: "column" }}>
      <style>{`
        .wk-modal .modal-content { background: ${G.card}; border: 1px solid ${G.divider}; color: ${G.text}; border-radius: 14px; }
        .wk-modal .modal-body { background: ${G.card} !important; padding: 28px; }
        .wk-modal .btn-close { filter: invert(1) brightness(0.6); }
        .wk-modal .modal-header { border-bottom: 1px solid ${G.divider}; }
        .wk-search::placeholder { color: ${G.muted}; }
        .wk-search:focus { border-color: ${G.gold} !important; outline: none; }
        .wk-input::placeholder { color: ${G.muted}; }
        .wk-input:focus { border-color: ${G.gold} !important; outline: none; }
        .wk-trainer-card:hover { background: rgba(212,160,23,0.08) !important; border-color: ${G.gold} !important; }
        .wk-video-card:hover { border-color: ${G.gold} !important; }
        .wk-video-card:hover .wk-overlay { opacity: 1 !important; }
        .wk-play:hover { background: ${G.gold} !important; color: #111 !important; }
        .wk-tag-item:hover { background: rgba(212,160,23,0.25) !important; }
        @keyframes wk-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h3 style={{ color: G.goldLight, fontWeight: 700, margin: 0 }}>Workout Library</h3>
          <small style={{ color: G.muted }}>Manage and assign workout videos.</small>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowAssignModal(true)}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Assign Trainer
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: `linear-gradient(135deg, ${G.gold}, #b8860b)`, border: "none", color: "#111", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
          >
            + Upload Video
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, gap: 16, alignItems: "flex-start" }}>

        {/* TRAINER SIDEBAR */}
        <div style={{ width: "25%", background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 16, flexShrink: 0 }}>
          <input
            className="wk-search"
            type="text"
            placeholder="Search trainer..."
            value={searchTrainer}
            onChange={(e) => setSearchTrainer(e.target.value)}
            style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "9px 12px", color: G.text, fontSize: 13, marginBottom: 12, transition: "border-color 0.2s" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "70vh", overflowY: "auto" }}>
            {trainers
              .filter((t) => `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTrainer.toLowerCase()))
              .map((trainer) => {
                const isActive = selectedTrainer?.id === trainer.id;
                return (
                  <div
                    key={trainer.id}
                    className="wk-trainer-card"
                    onClick={() => setSelectedTrainer(trainer)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 400,
                      background: isActive ? `linear-gradient(135deg, ${G.gold}, #b8860b)` : "transparent",
                      color: isActive ? "#111" : G.text,
                      border: `1px solid ${isActive ? "transparent" : G.divider}`,
                      transition: "all 0.15s",
                    }}
                  >
                    {trainer.firstName} {trainer.lastName}
                  </div>
                );
              })}
          </div>
        </div>

        {/* VIDEO CONTENT */}
        <div style={{ flex: 1, background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 20, minHeight: 400 }}>

          {/* ASSIGNED VIDEOS */}
          {!selectedTrainer ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: G.muted, fontSize: 15 }}>
              Select a trainer to view workouts
            </div>
          ) : trainerLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "60px 0", color: G.muted }}>
              <div style={{ width: 18, height: 18, border: `3px solid #333`, borderTop: `3px solid ${G.gold}`, borderRadius: "50%", animation: "wk-spin 0.8s linear infinite" }} />
              Loading videos...
            </div>
          ) : trainerWorkouts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: G.muted, fontSize: 15 }}>
              No videos assigned
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {trainerWorkouts.map((video) => (
                <div
                  key={video.id}
                  className="wk-video-card"
                  style={{ background: "#141414", borderRadius: 12, overflow: "hidden", border: `1px solid ${G.divider}`, transition: "border-color 0.2s" }}
                >
                  <div style={{ position: "relative", height: 150, background: "#000", overflow: "hidden" }}>
                    <video src={video.videoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div
                      className="wk-overlay"
                      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", opacity: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 10, transition: "opacity 0.25s" }}
                    >
                      <div
                        className="wk-play"
                        onClick={() => setPreviewVideo(video)}
                        style={{ margin: "auto", fontSize: 22, color: G.text, background: "rgba(255,255,255,0.15)", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
                      >
                        ▶
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => dispatch(removeWorkout(video.id))}
                          style={{ background: "rgba(248,113,113,0.85)", border: "none", color: "#fff", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <h6 style={{ color: G.text, fontSize: 13, margin: 0, fontWeight: 600 }}>{video.title}</h6>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TRAINER UPLOADED VIDEOS */}
          {selectedTrainer && (
            <>
              <h5 style={{ color: G.text, fontWeight: 700, marginTop: 28, marginBottom: 16 }}>Trainer Uploaded Videos</h5>
              {trainerVideosLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: G.muted, fontSize: 13 }}>
                  <div style={{ width: 16, height: 16, border: `3px solid #333`, borderTop: `3px solid ${G.gold}`, borderRadius: "50%", animation: "wk-spin 0.8s linear infinite" }} />
                  Loading trainer videos...
                </div>
              ) : filteredTrainerVideos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: G.muted, fontSize: 14 }}>
                  No videos uploaded by this trainer
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  {filteredTrainerVideos.map((video) => (
                    <div
                      key={video.id}
                      className="wk-video-card"
                      style={{ background: "#141414", borderRadius: 12, overflow: "hidden", border: `1px solid ${G.divider}`, transition: "border-color 0.2s" }}
                    >
                      <div style={{ height: 150, background: "#000", overflow: "hidden" }}>
                        <img src={video.thumbnail} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <h6 style={{ color: G.text, fontSize: 13, margin: 0, fontWeight: 600 }}>{video.title}</h6>
                        <p style={{ fontSize: 12, color: G.muted, margin: "4px 0 0" }}>
                          {video.trainer?.firstName} {video.trainer?.lastName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ASSIGN MODAL */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered className="wk-modal">
        <Modal.Body>
          <h4 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 20 }}>Assign Trainers</h4>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Select Video</label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "9px 12px", color: G.text, fontSize: 13 }}
            >
              <option value="">Select Video</option>
              {workouts.map((v) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
          </div>

          <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 10 }}>Select Trainers</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto", marginBottom: 20 }}>
            {trainers.map((t) => (
              <label
                key={t.id}
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 12px", borderRadius: 8, background: selectedTrainers.includes(t.id) ? "rgba(212,160,23,0.1)" : "transparent", border: `1px solid ${selectedTrainers.includes(t.id) ? G.gold : G.divider}`, transition: "all 0.15s" }}
              >
                <input
                  type="checkbox"
                  checked={selectedTrainers.includes(t.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTrainers([...selectedTrainers, t.id]);
                    } else {
                      setSelectedTrainers(selectedTrainers.filter((id) => id !== t.id));
                    }
                  }}
                  style={{ accentColor: G.gold, width: 16, height: 16 }}
                />
                <span style={{ color: G.text, fontSize: 13 }}>{t.firstName} {t.lastName}</span>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => { setShowAssignModal(false); setSelectedTrainers([]); setSelectedVideo(""); }}
              style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={assigning}
              style={{ background: assigning ? "#333" : `linear-gradient(135deg, ${G.gold}, #b8860b)`, border: "none", color: assigning ? G.muted : "#111", padding: "7px 20px", borderRadius: 8, fontWeight: 700, cursor: assigning ? "not-allowed" : "pointer", fontSize: 13 }}
            >
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* VIDEO PREVIEW MODAL */}
      <Modal show={!!previewVideo} onHide={() => setPreviewVideo(null)} centered className="wk-modal" size="lg">
        <Modal.Body style={{ padding: 0 }}>
          <video src={previewVideo?.videoUrl} controls autoPlay style={{ width: "100%", borderRadius: 14, display: "block" }} />
        </Modal.Body>
      </Modal>

      {/* UPLOAD MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="wk-modal">
        <Modal.Body>
          <h4 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 20 }}>
            {editItem ? "Edit Workout" : "Upload Workout"}
          </h4>

          {/* TITLE */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Title</label>
            <input
              className="wk-input"
              type="text"
              placeholder="Enter workout title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "9px 12px", color: G.text, fontSize: 13, transition: "border-color 0.2s" }}
            />
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Description</label>
            <textarea
              className="wk-input"
              placeholder="Enter description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ width: "100%", background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "9px 12px", color: G.text, fontSize: 13, resize: "none", transition: "border-color 0.2s" }}
            />
          </div>

          {/* FILE UPLOAD */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Upload Video</label>
            <div
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${G.divider}`, borderRadius: 10, padding: "24px 16px", textAlign: "center", cursor: "pointer", color: G.muted, fontSize: 13, transition: "border-color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = G.gold}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = G.divider}
            >
              {form.file ? form.file.name : "Click to upload video"}
            </div>
            <input type="file" accept="video/*" ref={fileRef} hidden onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {/* TAGS */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: G.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Tags</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="wk-input"
                type="text"
                placeholder="Add tag"
                value={form.tagInput}
                onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                style={{ flex: 1, background: G.input, border: `1px solid ${G.divider}`, borderRadius: 8, padding: "8px 12px", color: G.text, fontSize: 13, transition: "border-color 0.2s" }}
              />
              <button
                onClick={addTag}
                style={{ background: `linear-gradient(135deg, ${G.gold}, #b8860b)`, border: "none", color: "#111", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
              >
                Add
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="wk-tag-item"
                  onClick={() => removeTag(tag)}
                  style={{ background: "rgba(212,160,23,0.12)", border: `1px solid ${G.divider}`, color: G.goldLight, padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", transition: "background 0.15s" }}
                >
                  {tag} ✕
                </span>
              ))}
            </div>
          </div>

          {/* PREVIEW */}
          {form.preview && (
            <div style={{ marginBottom: 14, borderRadius: 8, overflow: "hidden" }}>
              <video src={form.preview} controls style={{ width: "100%", borderRadius: 8 }} />
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              onClick={resetForm}
              style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.text, padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{ background: `linear-gradient(135deg, ${G.gold}, #b8860b)`, border: "none", color: "#111", padding: "7px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              {editItem ? "Update" : "Upload Video"}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
