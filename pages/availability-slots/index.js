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
  const [applyToAll, setApplyToAll] = useState(false);
  const [repeatMonth, setRepeatMonth] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);

  const requiredMinutes = 2700;

  /* -------- Initialize Week -------- */

 const initializeWeek = async (startDate) => {
  const start = new Date(startDate);
  const newWeek = {};

  daysOfWeek.forEach((day, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);

    newWeek[day] = {
      date: current.toISOString().split("T")[0],
      slots: [],
    };
  });

  await loadWeekSlots(newWeek);
};

  const loadWeekSlots = async (weekObject) => {
  const updatedWeek = { ...weekObject };

  for (const day of Object.keys(updatedWeek)) {
    const date = updatedWeek[day].date;

    try {
      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/time-slots?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await res.json();

      const backendSlots = data?.data?.slots || [];

      updatedWeek[day].slots = backendSlots.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime.substring(11, 16),
        endTime: slot.endTime.substring(11, 16),
      }));

    } catch (err) {
      console.error("Load slots error:", err);
    }
  }

  setWeekData(updatedWeek);
};
  /* -------- Time Calculation -------- */

  const calculateMinutes = (start, end) => {
    const s = new Date(`1970-01-01T${start}`);
    const e = new Date(`1970-01-01T${end}`);
    if (e <= s) return 0;
    return (e - s) / 60000;
  };

  useEffect(() => {
    let total = 0;
    Object.keys(weekData).forEach((day) => {
      weekData[day].slots.forEach((slot) => {
        if (slot.startTime && slot.endTime) {
          total += calculateMinutes(slot.startTime, slot.endTime);
        }
      });
    });
    setTotalMinutes(total);
  }, [weekData]);

  const totalHours = (totalMinutes / 60).toFixed(1);

  /* -------- Slot Functions -------- */

  const addSlot = (day) => {
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { startTime: "", endTime: "" }],
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
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  /* -------- Same For Week -------- */

  const handleApplyToAll = (checked) => {
    setApplyToAll(checked);

    if (checked && weekData["Monday"]) {
      const mondaySlots = weekData["Monday"].slots;

      setWeekData((prev) => {
        const updated = {};
        daysOfWeek.forEach((day) => {
          updated[day] = {
            ...prev[day],
            slots: [...mondaySlots],
          };
        });
        return updated;
      });
    }
  };

  /* -------- Submit -------- */
const handleSubmit = async () => {
  setError("");
  setSuccess("");

  if (!weekStart) {
    alert("Please select week start date.");
    return;
  }

  if (totalMinutes < requiredMinutes) {
    alert("Minimum 45 hours required per week.");
    return;
  }

  try {
    for (const day of Object.keys(weekData)) {
      const date = weekData[day].date;

      // 🔹 1. Fetch existing backend slots for this date
      const existingRes = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/time-slots?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const existingData = await existingRes.json();
      const existingSlots = existingData?.data?.slots || [];

      const uiSlots = weekData[day].slots;

      // 🔹 2. UPDATE or CREATE
      for (const slot of uiSlots) {
        if (!slot.startTime || !slot.endTime) continue;

        // If slot has id → PATCH
        if (slot.id) {
          await fetch(
            `https://fitness-app-seven-beryl.vercel.app/api/time-slots/${slot.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
              },
              body: JSON.stringify({
                start: slot.startTime,
                end: slot.endTime,
              }),
            }
          );
        } else {
          // No id → CREATE
          await fetch(
            "https://fitness-app-seven-beryl.vercel.app/api/time-slots",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
              },
              body: JSON.stringify({
                date,
                peakSlots: [
                  {
                    start: slot.startTime,
                    end: slot.endTime,
                  },
                ],
              }),
            }
          );
        }
      }

      // 🔹 3. DELETE removed slots
      for (const existing of existingSlots) {
        const stillExists = uiSlots.some(
          (slot) =>
            slot.startTime ===
              existing.startTime.substring(11, 16) &&
            slot.endTime ===
              existing.endTime.substring(11, 16)
        );

        if (!stillExists) {
          await fetch(
            `https://fitness-app-seven-beryl.vercel.app/api/time-slots/${existing.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
              },
            }
          );
        }
      }
    }

    alert("Time slots synced successfully ✅");
  } catch (err) {
    console.error(err);
    alert("Something went wrong ❌");
  }
};

//get details of slots
const fetchSlotsForDate = async (date) => {
  try {
    const res = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/time-slots?date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) return [];

    return data?.data?.slots || [];
  } catch (err) {
    console.error("Fetch slots error:", err);
    return [];
  }
};
const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toISOString().substring(11, 16);
};

  /* -------- UI -------- */

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-semibold">Weekly Time Slots</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Week Start */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form.Label>Select Week Start (Monday)</Form.Label>
          <Form.Control
            type="date"
            value={weekStart}
            onChange={(e) => {
              setWeekStart(e.target.value);
              initializeWeek(e.target.value);
            }}
          />
        </Card.Body>
      </Card>

      {/* Hours UI */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <ProgressBar
                now={(totalMinutes / requiredMinutes) * 100}
                variant={
                  totalMinutes >= requiredMinutes
                    ? "success"
                    : "danger"
                }
                style={{ height: "10px" }}
              />
            </Col>
            <Col md={4} className="text-end">
              <Badge
                bg={
                  totalMinutes >= requiredMinutes
                    ? "success"
                    : "danger"
                }
                className="fs-6 px-3 py-2"
              >
                {totalHours}h / 45h
              </Badge>
            </Col>
          </Row>
          <div className="mt-2 text-muted small">
            Minimum 45 hours required per week.
          </div>
        </Card.Body>
      </Card>

      {/* Options */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form.Check
            type="checkbox"
            label="Same slots for entire week"
            checked={applyToAll}
            onChange={(e) => handleApplyToAll(e.target.checked)}
            className="mb-2"
          />

          <Form.Check
            type="checkbox"
            label="Repeat this weekly schedule for entire month"
            checked={repeatMonth}
            onChange={(e) =>
              setRepeatMonth(e.target.checked)
            }
          />
        </Card.Body>
      </Card>

      {/* 7 Days */}
      <Accordion alwaysOpen>
        {Object.keys(weekData).map((day, idx) => (
          <Accordion.Item eventKey={idx.toString()} key={day}>
            <Accordion.Header>
              {day} ({weekData[day].date})
            </Accordion.Header>

            <Accordion.Body>
              {weekData[day].slots.map((slot, index) => (
                <Row key={index} className="mb-3">
                  <Col md={5}>
                    <Form.Control
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        updateSlot(day, index, "startTime", e.target.value)
                      }
                    />
                  </Col>

                  <Col md={5}>
                    <Form.Control
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateSlot(day, index, "endTime", e.target.value)
                      }
                    />
                  </Col>

                  <Col md={2}>
                    <Button
                      variant="outline-danger"
                      onClick={() =>
                        removeSlot(day, index)
                      }
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}

              <Button
                variant="outline-primary"
                onClick={() => addSlot(day)}
              >
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
          disabled={totalMinutes < requiredMinutes}
        >
          Save Time Slots
        </Button>
      </div>
    </div>
  );
}