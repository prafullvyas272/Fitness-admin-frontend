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
  const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedVideo, setSelectedVideo] = useState("");
const [selectedTrainers, setSelectedTrainers] = useState([]);

const [showTrainerModal, setShowTrainerModal] = useState(false);
const [selectedVideoTrainers, setSelectedVideoTrainers] = useState([]);
const [selectedVideoTitle, setSelectedVideoTitle] = useState("");

const [selectedTrainer, setSelectedTrainer] = useState(null);
const [searchTrainer, setSearchTrainer] = useState("");

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

  const trainers = [
  { id: 1, name: "Trainer John" },
  { id: 2, name: "Trainer Mike" },
  { id: 3, name: "Trainer Alex" },
  { id: 4, name: "Trainer David" },
];

const trainerAssignments = {
  1: [1, 2],
  2: [3],
  3: [4, 2],
};

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

    {/* HEADER */}
    <div className="workout-header">
      <h3>Workout Library</h3>

      <div className="workout-actions">
        <button
          className="app-secondary-btn"
          onClick={() => setShowAssignModal(true)}
        >
          Assign Trainer
        </button>

        <button
          className="app-primary-btn"
          onClick={() => setShowModal(true)}
        >
          + Upload Video
        </button>
      </div>
    </div>

    {/* MAIN SPLIT LAYOUT */}
    <div className="workout-body">

      {/* LEFT SIDE - TRAINERS */}
      <div className="trainer-sidebar">

        <input
          type="text"
          placeholder="Search trainer..."
          value={searchTrainer}
          onChange={(e) => setSearchTrainer(e.target.value)}
          className="trainer-search"
        />

        <div className="trainer-list">
          {trainers
            .filter((t) =>
              t.name.toLowerCase().includes(searchTrainer.toLowerCase())
            )
            .map((trainer) => (
              <div
                key={trainer.id}
                className={`trainer-card ${
                  selectedTrainer?.id === trainer.id ? "active" : ""
                }`}
                onClick={() => setSelectedTrainer(trainer)}
              >
                {trainer.name}
              </div>
            ))}
        </div>
      </div>

      {/* RIGHT SIDE - VIDEOS */}
      <div className="trainer-content">

        {!selectedTrainer ? (
          <div className="empty-state">
            Select a trainer to view workouts
          </div>
        ) : (
          <>
            <h4>{selectedTrainer.name}'s Workouts</h4>

            <div className="video-grid">
              {workouts
                .filter((video) =>
                  (trainerAssignments[video.id] || []).includes(
                    selectedTrainer.id
                  )
                )
                .map((video) => (
                  <div key={video.id} className="video-card">

                    <div className="video-thumb">
                      {video.videoUrl && (
                        <>
                          <video src={video.videoUrl} preload="metadata" />

                          <div className="duration">--:--</div>
                        </>
                      )}

                      <div className="hover-overlay">
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
                              setForm({ ...video });
                              setShowModal(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              dispatch(removeWorkout(video.id))
                            }
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
          </>
        )}
      </div>

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

<Modal
  show={showAssignModal}
  onHide={() => setShowAssignModal(false)}
  centered
>
  <Modal.Body>

    <div className="assign-modal">

      <h4>Assign Workout to Trainers</h4>

      {/* SELECT VIDEO */}
      <div className="assign-section">
        <label>Select Video</label>

        <select
          value={selectedVideo}
          onChange={(e) => setSelectedVideo(e.target.value)}
        >
          <option value="">Select workout</option>

          {workouts.map((video) => (
            <option key={video.id} value={video.id}>
              {video.title}
            </option>
          ))}
        </select>
      </div>

      {/* TRAINER LIST */}
      <div className="assign-section">
        <label>Select Trainers</label>

        <div className="trainer-list">
          {trainers.map((trainer) => (
            <label key={trainer.id} className="trainer-item">
              <input
                type="checkbox"
                checked={selectedTrainers.includes(trainer.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTrainers([...selectedTrainers, trainer.id]);
                  } else {
                    setSelectedTrainers(
                      selectedTrainers.filter((id) => id !== trainer.id)
                    );
                  }
                }}
              />
              {trainer.name}
            </label>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="modal-actions">
        <button onClick={() => setShowAssignModal(false)}>
          Cancel
        </button>

        <button className="app-primary-btn">
          Assign
        </button>
      </div>

    </div>

  </Modal.Body>
</Modal>
<Modal
  show={showTrainerModal}
  onHide={() => setShowTrainerModal(false)}
  centered
>
  <Modal.Body>

    <div className="trainer-modal">
      <h4>Assigned Trainers</h4>
      <p className="video-name">{selectedVideoTitle}</p>

      {selectedVideoTrainers.length > 0 ? (
        <ul className="trainer-list-modal">
          {selectedVideoTrainers.map((trainer, index) => (
            <li key={index}>{trainer}</li>
          ))}
        </ul>
      ) : (
        <p>No trainers assigned</p>
      )}

      <div className="modal-actions">
        <button onClick={() => setShowTrainerModal(false)}>
          Close
        </button>
      </div>
    </div>

  </Modal.Body>
</Modal>

    </div>
  );
}