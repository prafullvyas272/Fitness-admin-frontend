import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Accordion,
  Alert,
  ProgressBar,
  Badge,
} from "react-bootstrap";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilitySlots() {
  const [weekStart, setWeekStart] = useState("");
  const [weekData, setWeekData] = useState({});
  const [backupWeekData, setBackupWeekData] = useState(null);

  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const requiredMinutes = 2700;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [repeatMonth, setRepeatMonth] = useState(false);

  /* -------- Initialize Week -------- */

  const initializeWeek = (startDate) => {
    const start = new Date(startDate);
    const newWeek = {};

    daysOfWeek.forEach((day, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);

      newWeek[day] = {
        date: current.toISOString().split("T")[0],
        isAvailable: true,
        slots: [],
      };
    });

    setWeekData(newWeek);
  };

  /* -------- Time Calculation -------- */

  const calculateMinutes = (start, end) => {
    const s = new Date(`1970-01-01T${start}`);
    const e = new Date(`1970-01-01T${end}`);
    if (e <= s) return 0;
    return (e - s) / 60000;
  };

  const getDayMinutes = (day) => {
    return weekData[day]?.slots.reduce((acc, slot) => {
      if (slot.startTime && slot.endTime) {
        return acc + calculateMinutes(slot.startTime, slot.endTime);
      }
      return acc;
    }, 0);
  };

  useEffect(() => {
    let total = 0;
    Object.keys(weekData).forEach((day) => {
      total += getDayMinutes(day);
    });
    setWeeklyMinutes(total);
  }, [weekData]);

  /* -------- Slot Management -------- */

  const addSlot = (day) => {
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [
          ...prev[day].slots,
          { slotType: "PEAK", startTime: "", endTime: "" },
        ],
      },
    }));
  };

  const updateSlot = (day, index, field, value) => {
    setWeekData((prev) => {
      const updatedSlots = [...prev[day].slots];
      updatedSlots[index][field] = value;

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots,
        },
      };
    });
  };

  const removeSlot = (day, index) => {
    setWeekData((prev) => {
      const updatedSlots = prev[day].slots.filter((_, i) => i !== index);

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots,
        },
      };
    });
  };

  const toggleAvailability = (day) => {
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable,
      },
    }));
  };

  /* -------- Apply Monday To All (Reversible) -------- */

  const handleApplyToAll = (checked) => {
    setApplyToAll(checked);

    if (checked) {
      setBackupWeekData(weekData); // store original

      const mondaySlots = weekData["Monday"]?.slots || [];
      const updated = {};

      daysOfWeek.forEach((day) => {
        updated[day] = {
          ...weekData[day],
          slots: [...mondaySlots],
        };
      });

      setWeekData(updated);
    } else {
      if (backupWeekData) {
        setWeekData(backupWeekData);
      }
    }
  };

  /* -------- Submit -------- */

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!weekStart) {
      setError("Please select week start date.");
      return;
    }

    if (weeklyMinutes < requiredMinutes) {
      setError("Minimum 45 hours required per week.");
      return;
    }

    try {
      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/superadmin/trainer/availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            weekStartDate: weekStart,
            availability: weekData,
            repeatMonth,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Weekly availability saved successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  const weeklyHours = (weeklyMinutes / 60).toFixed(1);

  /* -------- UI -------- */

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-semibold">Weekly Availability</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Label className="fw-medium">
                Select Week Start (Monday)
              </Form.Label>
              <Form.Control
                type="date"
                value={weekStart}
                onChange={(e) => {
                  setWeekStart(e.target.value);
                  initializeWeek(e.target.value);
                }}
              />
            </Col>

            <Col md={6} className="d-flex align-items-end justify-content-end">
              <Badge
                bg={weeklyMinutes >= requiredMinutes ? "success" : "danger"}
                className="fs-6 px-3 py-2"
              >
                {weeklyHours}h / 45h
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form.Check
            type="checkbox"
            label="Apply Monday slots to all days"
            checked={applyToAll}
            onChange={(e) => handleApplyToAll(e.target.checked)}
            className="mb-2"
          />

          <Form.Check
            type="checkbox"
            label="Repeat this weekly schedule for entire month"
            checked={repeatMonth}
            onChange={(e) => setRepeatMonth(e.target.checked)}
          />
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <ProgressBar
            now={(weeklyMinutes / requiredMinutes) * 100}
            style={{ height: "10px" }}
          />
        </Card.Body>
      </Card>

      <Accordion alwaysOpen>
        {Object.keys(weekData).map((day, idx) => (
          <Accordion.Item eventKey={idx.toString()} key={day}>
            <Accordion.Header>
              <div className="d-flex justify-content-between w-100 me-3">
                <span>
                  {day} ({weekData[day].date})
                </span>
                <Badge bg="light" text="dark">
                  {(getDayMinutes(day) / 60).toFixed(1)}h
                </Badge>
              </div>
            </Accordion.Header>

            <Accordion.Body className="bg-light">
              <Form.Check
                type="switch"
                label="Available"
                checked={weekData[day].isAvailable}
                onChange={() => toggleAvailability(day)}
                className="mb-3"
              />

              {weekData[day].slots.map((slot, index) => (
                <Row key={index} className="mb-3">
                  <Col md={3}>
                    <Form.Select
                      value={slot.slotType}
                      onChange={(e) =>
                        updateSlot(day, index, "slotType", e.target.value)
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
                        updateSlot(day, index, "startTime", e.target.value)
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Control
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateSlot(day, index, "endTime", e.target.value)
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <Button
                      variant="outline-danger"
                      onClick={() => removeSlot(day, index)}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}

              <Button variant="outline-primary" onClick={() => addSlot(day)}>
                + Add Slot
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <div className="text-end mt-4">
        <Button
          size="lg"
          variant="primary"
          onClick={handleSubmit}
          disabled={weeklyMinutes < requiredMinutes}
        >
          Save Weekly Availability
        </Button>
      </div>
    </div>
  );
}