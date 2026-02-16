import { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, ProgressBar, Alert } from "react-bootstrap";

export default function AvailabilitySlots() {
  const [date, setDate] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [slots, setSlots] = useState([
    { slotType: "PEAK", startTime: "", endTime: "" },
  ]);

  const [repeatWeek, setRepeatWeek] = useState(false);
  const [repeatMonth, setRepeatMonth] = useState(false);

  const [totalMinutes, setTotalMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const requiredMinutes = 2700; // 45 hours
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------- DATE HANDLER ---------------- */

  const handleDateChange = (value) => {
    setDate(value);
    const day = new Date(value).toLocaleDateString("en-US", {
      weekday: "long",
    });
    setDayOfWeek(day);
  };

  /* ---------------- SLOT MANAGEMENT ---------------- */

  const addSlot = () => {
    setSlots([...slots, { slotType: "PEAK", startTime: "", endTime: "" }]);
  };

  const removeSlot = (index) => {
    const updated = slots.filter((_, i) => i !== index);
    setSlots(updated);
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  /* ---------------- TIME CALCULATION ---------------- */

  const calculateMinutes = (start, end) => {
    const startTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);
    return (endTime - startTime) / 60000;
  };

  useEffect(() => {
    let total = 0;
    slots.forEach((slot) => {
      if (slot.startTime && slot.endTime) {
        total += calculateMinutes(slot.startTime, slot.endTime);
      }
    });
    setTotalMinutes(total);
  }, [slots]);

  /* ---------------- SUBMIT HANDLER ---------------- */

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (repeatWeek && totalMinutes < requiredMinutes) {
      setError("Minimum 45 hours (2700 minutes) required for weekly schedule.");
      return;
    }

    const peakSlots = slots
      .filter((s) => s.slotType === "PEAK")
      .map((s) => ({
        start: s.startTime,
        end: s.endTime,
      }));

    const alternativeSlots = slots
      .filter((s) => s.slotType === "ALTERNATIVE")
      .map((s) => ({
        start: s.startTime,
        end: s.endTime,
      }));

    try {
      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/user/availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            date,
            isAvailable,
            peakSlots,
            alternativeSlots,
            repeatWeek,
            repeatMonth,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Availability saved successfully.");
      setWeeklyMinutes(data?.data?.trainerWeek?.totalBookedMinutes || 0);
    } catch (err) {
      setError(err.message);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4">
      <h2 className="mb-4">Availability Slots</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* BASIC INFO */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </Col>

            <Col md={4}>
              <Form.Label>Day</Form.Label>
              <Form.Control value={dayOfWeek} disabled />
            </Col>

            <Col md={4} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                label="Available"
                checked={isAvailable}
                onChange={() => setIsAvailable(!isAvailable)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* SLOT SECTION */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Time Slots</h5>

          {slots.map((slot, index) => (
            <Row key={index} className="mb-3">
              <Col md={3}>
                <Form.Select
                  value={slot.slotType}
                  onChange={(e) =>
                    updateSlot(index, "slotType", e.target.value)
                  }
                >
                  <option value="PEAK">Peak</option>
                  <option value="ALTERNATIVE">Alternative</option>
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Control
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    updateSlot(index, "startTime", e.target.value)
                  }
                />
              </Col>

              <Col md={3}>
                <Form.Control
                  type="time"
                  value={slot.endTime}
                  onChange={(e) =>
                    updateSlot(index, "endTime", e.target.value)
                  }
                />
              </Col>

              <Col md={3}>
                <Button
                  variant="outline-danger"
                  onClick={() => removeSlot(index)}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}

          <Button variant="outline-primary" onClick={addSlot}>
            + Add Slot
          </Button>

          <div className="mt-3">
            <strong>Total Day Minutes:</strong> {totalMinutes}
          </div>
        </Card.Body>
      </Card>

      {/* REPEAT OPTIONS */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form.Check
            type="checkbox"
            label="Repeat for entire week"
            checked={repeatWeek}
            onChange={() => setRepeatWeek(!repeatWeek)}
          />

          <Form.Check
            type="checkbox"
            label="Repeat for entire month"
            checked={repeatMonth}
            onChange={() => setRepeatMonth(!repeatMonth)}
          />
        </Card.Body>
      </Card>

      {/* WEEKLY PROGRESS */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h6>Weekly Progress (Required: 2700 minutes)</h6>
          <ProgressBar
            now={(weeklyMinutes / requiredMinutes) * 100}
            label={`${weeklyMinutes} / ${requiredMinutes}`}
          />
        </Card.Body>
      </Card>

      <Button variant="primary" size="lg" onClick={handleSubmit}>
        Save Availability
      </Button>
    </div>
  );
}