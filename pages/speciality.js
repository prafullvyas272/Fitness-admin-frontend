import { useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";

export default function Speciality() {
  const [input, setInput] = useState("");
  const [skills, setSkills] = useState([]);

  // Load from localStorage on page load
  useEffect(() => {
    const savedSkills = localStorage.getItem("gymSpecialities");
    if (savedSkills) {
      setSkills(JSON.parse(savedSkills));
    }
  }, []);

  // Save to localStorage whenever skills change
  useEffect(() => {
    localStorage.setItem("gymSpecialities", JSON.stringify(skills));
  }, [skills]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      const newSkill = input.trim();

      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }

      setInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Speciality</h2>

      <Card className="p-4">
        <Form.Control
          type="text"
          placeholder="Type speciality and press Enter..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-4"
        />

        <div className="skill-container">
          {skills.map((skill, index) => (
            <div key={index} className="skill-chip">
              {skill}
              <button
                className="remove-btn"
                onClick={() => removeSkill(skill)}
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
