import { useEffect, useState } from "react";
import { Card, Form, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSpecialities,
  createSpeciality,
  deleteSpeciality,
} from "../redux/slices/specialitySlice";

export default function Speciality() {
  const dispatch = useDispatch();
  const { skills, loading, error } = useSelector(
    (state) => state.speciality
  );

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
    <div className="speciality-page">
      <div className="page-header">
        <h2>Speciality</h2>
        <p className="text-muted">
          Manage trainer specialities here.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="speciality-card">
        <Form.Control
          type="text"
          placeholder="Type speciality and press enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="speciality-input"
        />

        {loading && <Spinner animation="border" />}

        <div className="speciality-chips">
          {skills.map((skill) => (
            <div key={skill.id} className="speciality-chip">
              {skill.name}
              <span
                className="chip-close"
                onClick={() =>
                  dispatch(deleteSpeciality(skill.id))
                }
              >
                ×
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}