import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const [weekStart, setWeekStart] = useState(null);
  const [weekData, setWeekData] = useState({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [repeatMonth, setRepeatMonth] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);

  const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);

  // const requiredMinutes = 2700;

  /* -------- Initialize Week -------- */

const initializeWeek = async (startDate) => {
  const [year, month, day] = startDate.split("-");

  const start = new Date(Number(year), Number(month) - 1, Number(day));

  const newWeek = {};

  daysOfWeek.forEach((dayName, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);

    const formattedDate =
      current.getFullYear() +
      "-" +
      String(current.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(current.getDate()).padStart(2, "0");

    newWeek[dayName] = {
      date: formattedDate,
      slots: [],
    };
  });

  // 🔥 RESET FIRST
 await loadWeekSlots(newWeek);
};
  const loadWeekSlots = async (weekObject) => {
  setLoading(true);

  const updatedWeek = JSON.parse(JSON.stringify(weekObject));

  try {
    await Promise.all(
      Object.keys(updatedWeek).map(async (day) => {
        const date = updatedWeek[day].date;

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

        updatedWeek[day].slots = backendSlots.map((slot) => {
          const start = new Date(slot.startTime);
          const end = new Date(slot.endTime);

          const startUTC =
            String(start.getUTCHours()).padStart(2, "0") +
            ":" +
            String(start.getUTCMinutes()).padStart(2, "0");

          const endUTC =
            String(end.getUTCHours()).padStart(2, "0") +
            ":" +
            String(end.getUTCMinutes()).padStart(2, "0");

          return {
            id: slot.id,
            startTime: startUTC,
            endTime: endUTC,
          };
        });
      })
    );

    setWeekData(updatedWeek);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
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

    // If startTime changed, reset endTime if invalid
    if (field === "startTime") {
      const end = updatedSlots[index].endTime;
      if (end && end <= value) {
        updatedSlots[index].endTime = "";
      }
    }

    return {
      ...prev,
      [day]: {
        ...prev[day],
        slots: updatedSlots,
      },
    };
  });
};


 const removeSlot = async (day, index) => {
  const slot = weekData[day].slots[index];

  try {
    // If slot exists in backend → delete from DB
    if (slot.id) {
      await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/time-slots/${slot.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
    }

    // Remove from frontend state
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));

  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete slot ❌");
  }
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
  if (!weekStart) {
    alert("Please select week start date.");
    return;
  }

  setSaving(true);

  try {
    const requests = [];

    Object.keys(weekData).forEach((day) => {
      const date = weekData[day].date;

      weekData[day].slots.forEach((slot) => {
        if (!slot.startTime || !slot.endTime) return;

        const utcStart = new Date(`${date}T${slot.startTime}:00`);
        const utcEnd = new Date(`${date}T${slot.endTime}:00`);

        if (slot.id) {
          requests.push(
            fetch(
              `https://fitness-app-seven-beryl.vercel.app/api/time-slots/${slot.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
                body: JSON.stringify({
                  date,
                  startTime: utcStart.toISOString(),
                  endTime: utcEnd.toISOString(),
                }),
              }
            )
          );
        } else {
          requests.push(
            fetch(
              `https://fitness-app-seven-beryl.vercel.app/api/time-slots`,
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
            )
          );
        }
      });
    });

    await Promise.all(requests);

    alert("Time slots saved successfully ✅");

    const isoDate =
      weekStart.getFullYear() +
      "-" +
      String(weekStart.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(weekStart.getDate()).padStart(2, "0");

    await initializeWeek(isoDate);
  } catch (err) {
    console.error(err);
    alert("Something went wrong ❌");
  } finally {
    setSaving(false);
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


const formatToUS = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${month}/${day}/${year}`;
};


  /* -------- UI -------- */

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-semibold">Peak Time Slots</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Week Start */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
       <Form.Label>Select Week Start (Monday)</Form.Label>

<div style={{ position: "relative" }}>
  <DatePicker
  selected={weekStart}
  onChange={(date) => {
    setWeekStart(date);

    const isoDate =
  date.getFullYear() +
  "-" +
  String(date.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(date.getDate()).padStart(2, "0");
    initializeWeek(isoDate);
  }}
  dateFormat="MM/dd/yy"
  placeholderText="MM/DD/YY"
  className="form-control"
  calendarStartDay={1}
  filterDate={(date) => date.getDay() === 1}
  wrapperClassName="w-100"
/>
</div>



        </Card.Body>
      </Card>

      {/* Hours UI */}
      {/* <Card className="shadow-sm border-0 mb-4">
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
      </Card> */}

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

{loading && (
  <div className="text-center my-4">
    <div className="spinner-border text-primary" />
  </div>
)}

      {/* 7 Days */}
      <Accordion alwaysOpen>
        {Object.keys(weekData).map((day, idx) => (
          <Accordion.Item eventKey={idx.toString()} key={day}>
            <Accordion.Header>
              {day} ({formatToUS(weekData[day].date)})
            </Accordion.Header>

            <Accordion.Body>
              {weekData[day].slots.map((slot, index) => (
  <div
    key={index}
    className="d-flex align-items-center gap-3 mb-3 flex-wrap"
  >

    {/* START TIME */}
<div style={{ flex: "1 1 200px" }}>
  <DatePicker
    selected={
      slot.startTime
        ? new Date(`1970-01-01T${slot.startTime}:00`)
        : null
    }
    onChange={(date) => {
      const formatted = date
        .toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .substring(0, 5);

      updateSlot(day, index, "startTime", formatted);
    }}
    showTimeSelect
    showTimeSelectOnly
    timeIntervals={15}
    dateFormat="hh:mm aa"
    placeholderText="Start time"
    className="form-control custom-time-input"
  />
</div>

    {/* END TIME */}
<div style={{ flex: "1 1 200px" }}>
  <DatePicker
    selected={
      slot.endTime
        ? new Date(`1970-01-01T${slot.endTime}:00`)
        : null
    }
    onChange={(date) => {
      const formatted = date
        .toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .substring(0, 5);

      if (slot.startTime && formatted <= slot.startTime) {
        alert("End time must be greater than start time");
        return;
      }

      updateSlot(day, index, "endTime", formatted);
    }}
    showTimeSelect
    showTimeSelectOnly
    timeIntervals={15}
    dateFormat="hh:mm aa"
    placeholderText="End time"
    className="form-control custom-time-input"
  />
</div>

    <Button
      variant="outline-danger"
      onClick={() => removeSlot(day, index)}
    >
      Remove
    </Button>

  </div>
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
  // size="lg"
  variant="primary"
  onClick={handleSubmit}
  disabled={saving}
>
  {saving ? "Saving..." : "Save Time Slots"}
</Button>
      </div>
    </div>
  );
}