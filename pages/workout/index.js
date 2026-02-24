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

export default function Workout() {
  const dispatch = useDispatch();
  const fileRef = useRef();

  const { workouts, currentPage, itemsPerPage } =
    useSelector((state) => state.workout);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

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
    if (!form.title || !form.file) return alert("Fill required fields");

    const payload = {
      id: editItem ? editItem.id : uuid(),
      title: form.title,
      description: form.description,
      tags: form.tags,
      url: form.preview,
      duration: form.duration,
    };

    if (editItem) {
      dispatch(updateWorkout(payload));
    } else {
      dispatch(addWorkout(payload));
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
  const currentItems = workouts.slice(
    indexOfLast - itemsPerPage,
    indexOfLast
  );
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
              <video src={video.url} />

              <div className="duration">
                {Math.floor(video.duration / 60)}:
                {("0" + (video.duration % 60)).slice(-2)}
              </div>

              <div className="hover-actions">
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
                  onClick={() => dispatch(deleteWorkout(video.id))}
                >
                  Delete
                </button>
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
              <button onClick={handleSubmit} className="app-primary-btn">
                {editItem ? "Update" : "Upload"}
              </button>
            </div>

          </div>
        </Modal.Body>
      </Modal>

    </div>
  );
}