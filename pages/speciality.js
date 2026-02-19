import { useState, useEffect } from "react";
import { Card, Form, Alert } from "react-bootstrap";

export default function Speciality() {
  const [input, setInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");

  const baseURL = "https://fitness-app-seven-beryl.vercel.app/api";

  /* ---------------- LOAD SPECIALITIES ---------------- */

  const fetchSpecialities = async () => {
    try {
      const res = await fetch(`${baseURL}/specialities`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Failed to fetch");

      setSkills(data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load specialities");
    }
  };

  useEffect(() => {
    fetchSpecialities();
  }, []);

  /* ---------------- CREATE SPECIALITY ---------------- */

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();

      try {
        const res = await fetch(`${baseURL}/specialities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "adminToken"
            )}`,
          },
          body: JSON.stringify({ name: input.trim() }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error("Failed to create");

        setInput("");
        fetchSpecialities(); // Refresh list
      } catch (err) {
        console.error(err);
        setError("Failed to create speciality");
      }
    }
  };

  /* ---------------- UPDATE SPECIALITY ---------------- */

  const updateSpeciality = async (id, newName) => {
    try {
      const res = await fetch(
        `${baseURL}/specialities/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "adminToken"
            )}`,
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      fetchSpecialities();
    } catch (err) {
      console.error(err);
      setError("Failed to update speciality");
    }
  };

  /* ---------------- DELETE (Optional if API exists) ---------------- */

  const removeSkill = async (id) => {
    try {
      await fetch(`${baseURL}/specialities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "adminToken"
          )}`,
        },
      });

      fetchSpecialities();
    } catch (err) {
      console.error(err);
      setError("Failed to delete speciality");
    }
  };

  /* ---------------- UI ---------------- */

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

      <div className="speciality-chips">
        {skills.map((skill) => (
          <div key={skill.id} className="speciality-chip">
            {skill.name}
            <span
              className="chip-close"
              onClick={() => removeSkill(skill.id)}
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