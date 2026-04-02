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
} from "../../redux/slices/workoutSlice";
import { fetchTrainers } from "../../redux/slices/trainerSlice";

export default function Workout() {
  const dispatch = useDispatch();
  const fileRef = useRef();

  const {
  workouts,
  trainerWorkouts,
  currentPage,
  itemsPerPage,
  loading,
  assigning,          // ✅ ADD THIS
  trainerLoading      // ✅ ALSO ADD THIS (important)
} = useSelector((state) => state.workout);

  const { trainers, loading: trainersLoading } = useSelector(
    (state) => state.trainers
  );

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [searchTrainer, setSearchTrainer] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedTrainers, setSelectedTrainers] = useState([]);

  const [previewVideo, setPreviewVideo] = useState(null);
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

  // ================= INIT =================
  useEffect(() => {
    dispatch(fetchWorkouts());
    dispatch(fetchTrainers());
  }, [dispatch]);

  // ================= FETCH TRAINER VIDEOS =================
  useEffect(() => {
    if (selectedTrainer) {
      dispatch(fetchTrainerWorkouts(selectedTrainer.id));
    }
  }, [selectedTrainer, dispatch]);

  // ================= FILE =================
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

  // ================= TAG =================
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

  // ================= ASSIGN =================
  const handleAssign = async () => {
    if (!selectedVideo || selectedTrainers.length === 0) {
      alert("Select video and trainers");
      return;
    }

    await dispatch(
      assignTrainersAPI({
        workoutId: selectedVideo,
        trainerIds: selectedTrainers,
      })
    );

    setShowAssignModal(false);
    setSelectedVideo("");
    setSelectedTrainers([]);
  };

  // ================= PAGINATION =================
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

      {/* BODY */}
      <div className="workout-body">

        {/* TRAINERS */}
        <div className="trainer-sidebar">
          <input
            type="text"
            placeholder="Search trainer..."
            value={searchTrainer}
            onChange={(e) => setSearchTrainer(e.target.value)}
          />

          <div className="trainer-list">
            {trainers
              .filter((t) =>
                `${t.firstName} ${t.lastName}`
                  .toLowerCase()
                  .includes(searchTrainer.toLowerCase())
              )
              .map((trainer) => (
                <div
                  key={trainer.id}
                  className={`trainer-card ${
                    selectedTrainer?.id === trainer.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedTrainer(trainer)}
                >
                  {trainer.firstName} {trainer.lastName}
                </div>
              ))}
          </div>
        </div>

        {/* VIDEOS */}
       <div className="trainer-content">

  {!selectedTrainer ? (
    <div className="empty-state">
      Select a trainer to view workouts
    </div>
  ) : trainerLoading ? (
    <div className="empty-state">
      Loading videos...
    </div>
  ) : trainerWorkouts.length === 0 ? (
    <div className="empty-state">
      No videos assigned
    </div>
  ) : (
    <div className="video-grid">
      {trainerWorkouts.map((video) => (
        <div key={video.id} className="video-card">

          <div className="video-thumb">
            <video src={video.videoUrl} />

            <div className="video-overlay">
              <div
                className="play-btn"
                onClick={() => setPreviewVideo(video)}
              >
                ▶
              </div>

              <div className="video-actions">
                <button
                  className="delete-btn"
                  onClick={() => dispatch(removeWorkout(video.id))}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="video-info">
            <h6>{video.title}</h6>
          </div>

        </div>
      ))}
    </div>
  )}

</div>
</div>


      {/* ASSIGN MODAL */}
      <Modal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
      >
        <Modal.Body>

          <h4>Assign Trainers</h4>

          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
          >
            <option>Select Video</option>
            {workouts.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>

          {trainers.map((t) => (
            <div key={t.id}>
              <input
                type="checkbox"
                checked={selectedTrainers.includes(t.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTrainers([...selectedTrainers, t.id]);
                  } else {
                    setSelectedTrainers(
                      selectedTrainers.filter((id) => id !== t.id)
                    );
                  }
                }}
              />
              {t.firstName}
            </div>
          ))}

         <button
  className="app-primary-btn"
  onClick={handleAssign}
  disabled={assigning}
>
  {assigning ? "Assigning..." : "Assign"}
</button>

        </Modal.Body>
      </Modal>

      {/* VIDEO PREVIEW */}
      <Modal
        show={!!previewVideo}
        onHide={() => setPreviewVideo(null)}
      >
        <video src={previewVideo?.videoUrl} controls autoPlay />
      </Modal>

    </div>
  );
}