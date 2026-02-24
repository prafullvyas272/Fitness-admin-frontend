import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addWorkout,
  deleteWorkout,
  updateWorkout,
  setPage,
} from "../../redux/slices/workoutSlice";
import { v4 as uuid } from "uuid";
import { Modal } from "react-bootstrap";
import { uploadWorkout } from "../../redux/slices/workoutSlice";
import { fetchWorkouts, removeWorkout, updateWorkoutAPI } 
from "../../redux/slices/workoutSlice";

import { useEffect } from "react";


export default function Workout() {
  const dispatch = useDispatch();
  useEffect(() => {
  dispatch(fetchWorkouts());
}, [dispatch]);

  const fileRef = useRef();


  const [previewVideo, setPreviewVideo] = useState(null);
  const { workouts, currentPage, itemsPerPage } =
    useSelector((state) => state.workout);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { loading } = useSelector((state) => state.workout);

  const [durations, setDurations] = useState({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: [],
    tagInput: "",
    file: null,
    preview: "",
    duration: 0,
  });

  // ================= HANDLE FILE =================
  const handleFile = (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;

    video.onloadedmetadata = () => {
      setForm((prev) => ({
        ...prev,
        file,
        preview: url,
        duration: Math.floor(video.duration),
      }));
    };
  };

  // ================= TAG SYSTEM =================
  const allTags = [...new Set(workouts.flatMap((w) => w.tags))];

  const addTag = () => {
    if (
      form.tagInput.trim() &&
      !form.tags.includes(form.tagInput.trim())
    ) {
      setForm({
        ...form,
        tags: [...form.tags, form.tagInput.trim()],
        tagInput: "",
      });
    }
  };

  const removeTag = (tag) => {
    setForm({
      ...form,
      tags: form.tags.filter((t) => t !== tag),
    });
  };

  // ================= SUBMIT =================
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
    setForm({
      title: "",
      description: "",
      tags: [],
      tagInput: "",
      file: null,
      preview: "",
      duration: 0,
    });
    setEditItem(null);
    setShowModal(false);
  };

  // ================= PAGINATION =================
  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = workouts;
  const totalPages = Math.ceil(workouts.length / itemsPerPage);

  return (
    <div className="workout-container">

      {/* TOP BAR */}
      <div className="workout-header">
        <h3>Workout Library</h3>
        <button
          className="app-primary-btn"
          onClick={() => setShowModal(true)}
        >
          + Upload Video
        </button>
      </div>

      {/* VIDEO GRID */}
      <div className="video-grid">
        {currentItems.map((video) => (
          <div key={video.id} className="video-card">

            <div className="video-thumb">

  {video.videoUrl && (
  <>
    <video
      src={video.videoUrl}
      preload="metadata"
      onLoadedMetadata={(e) => {
        const duration = e.target.duration;

        setDurations((prev) => ({
          ...prev,
          [video.id]: duration,
        }));
      }}
    />

    <div className="duration">
      {durations[video.id]
        ? `${Math.floor(durations[video.id] / 60)}:${(
            "0" + Math.floor(durations[video.id] % 60)
          ).slice(-2)}`
        : "--:--"}
    </div>
  </>
)}

              <div className="hover-overlay">
                {/* PLAY BUTTON CENTER */}
  <div
    className="play-btn"
    onClick={() => setPreviewVideo(video)}
  >
    ▶
  </div>
  <div className="bottom-actions">
                <button
                  onClick={() => {
                    setEditItem(video);
                    setForm({ ...video, preview: video.url });
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => dispatch(removeWorkout(video.id))}
                >
                  Delete
                </button>
              </div>
              </div>
            </div>

            <div className="video-info">
              <h6>{video.title}</h6>
              <div className="tags">
                {video.tags.map((tag, i) => (
                  <span key={i}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => dispatch(setPage(i + 1))}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={resetForm} centered size="lg">
        <Modal.Body>
          <div className="modal-content-custom">

            <h4>{editItem ? "Edit Workout" : "Upload Workout"}</h4>

            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            {/* TAG INPUT */}
            <div className="tag-input">
              <input
                placeholder="Add tag"
                value={form.tagInput}
                onChange={(e) =>
                  setForm({ ...form, tagInput: e.target.value })
                }
              />
              <button
  type="button"
  className="app-tag-btn"
  onClick={addTag}
>
  + Add
</button>
            </div>

            <div className="tag-list">
              {form.tags.map((tag, i) => (
                <span key={i} onClick={() => removeTag(tag)}>
                  {tag} ✕
                </span>
              ))}
            </div>

            {/* EXISTING TAGS */}
            <div className="existing-tags">
              {allTags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() =>
                    !form.tags.includes(tag) &&
                    setForm({ ...form, tags: [...form.tags, tag] })
                  }
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* FILE */}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {form.preview && (
              <div className="preview-box">
                <video src={form.preview} controls />
                <p>
                  Duration:{" "}
                  {Math.floor(form.duration / 60)}:
                  {("0" + (form.duration % 60)).slice(-2)}
                </p>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={resetForm}>Cancel</button>
              <button
  onClick={handleSubmit}
  className="app-primary-btn"
  disabled={loading}
>
  {loading ? "Uploading..." : editItem ? "Update" : "Upload"}
</button>
            </div>

            

          </div>
        </Modal.Body>
      </Modal>
      <Modal
  show={!!previewVideo}
  onHide={() => setPreviewVideo(null)}
  centered
  size="lg"
>
  <Modal.Body style={{ padding: 0 }}>
    {previewVideo && (
      <video
        src={previewVideo.videoUrl}
        controls
        autoPlay
        style={{ width: "100%", borderRadius: "10px" }}
      />
    )}
  </Modal.Body>
</Modal>

    </div>
  );
}