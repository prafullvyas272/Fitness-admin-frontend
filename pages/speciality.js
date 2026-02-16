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
    <div className="p-4">
      <h2 className="mb-4">Speciality</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-4 shadow-sm">
        <Form.Control
          type="text"
          placeholder="Type speciality and press Enter..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-4"
        />

        <div className="skill-container">
          {skills.map((skill) => (
            <div key={skill.id} className="skill-chip">
              {skill.name}

              <button
                className="remove-btn"
                onClick={() => removeSkill(skill.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}