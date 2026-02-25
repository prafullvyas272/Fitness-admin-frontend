import { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form } from "react-bootstrap";

export default function AvailabilitySlots() {

  const [creatorId, setCreatorId] = useState(null);
const [token, setToken] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [slotDates, setSlotDates] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= FORMAT DATE ================= */

  const formatDate = (date) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  /* ================= MONTH NAV ================= */

  const changeMonth = (dir) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
  };

  /* ================= CALENDAR GRID ================= */

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  /* ================= FETCH MONTH SLOT DATES ================= */
  useEffect(() => {
  if (typeof window !== "undefined") {
    setCreatorId(localStorage.getItem("adminId"));
    setToken(localStorage.getItem("adminToken"));
  }
}, []);

 useEffect(() => {
  if (creatorId && token) {
    fetchMonthSlots();
  }
}, [currentMonth, creatorId, token]);

useEffect(() => {
  if (selectedDate && creatorId && token) {
    fetchSlotsForDate(selectedDate);
  }
}, [selectedDate, creatorId, token]);

  const fetchMonthSlots = async () => {
    if (!creatorId || !token) return;
    try {
      const firstDay = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );

      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/time-slots?creatorId=${creatorId}&pageSize=500`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) return;

      const uniqueDates = [
        ...new Set(
          data?.data?.slots?.map((slot) =>
            slot.date.split("T")[0]
          )
        ),
      ];

      setSlotDates(uniqueDates);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH SLOTS FOR DATE ================= */

 const fetchSlotsForDate = async (date) => {
  if (!creatorId || !token) return;

  setLoadingSlots(true);
  const formatted = formatDate(date);

    try {
      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/time-slots?creatorId=${creatorId}&date=${formatted}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) return;

      const loadedSlots =
        data?.data?.slots?.map((slot) => ({
          id: slot.id,
          startTime: new Date(slot.startTime)
            .toISOString()
            .substring(11, 16),
          endTime: new Date(slot.endTime)
            .toISOString()
            .substring(11, 16),
        })) || [];

      setSlots(loadedSlots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  /* ================= DATE CLICK ================= */

  const handleDateClick = (date) => {
  setSelectedDate(date);
};
  /* ================= SLOT CRUD ================= */

  const addSlot = () => {
    setSlots([...slots, { startTime: "", endTime: "" }]);
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const deleteSlot = async (index) => {
    const slot = slots[index];

    if (slot.id) {
      await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/time-slots/${slot.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    setSlots(slots.filter((_, i) => i !== index));
    fetchMonthSlots();
  };

  const handleSave = async () => {
  if (!selectedDate) return;

  const formatted = formatDate(selectedDate);

  // ✅ VALIDATION CHECK
  for (let slot of slots) {
    if (!slot.startTime || !slot.endTime) {
      alert("Please fill both start and end time.");
      return;
    }

    if (slot.endTime <= slot.startTime) {
      alert("End time must be greater than start time.");
      return;
    }
  }

  setSaving(true);

  try {
    for (let slot of slots) {

      if (slot.id) {
        await fetch(
          `https://fitness-app-seven-beryl.vercel.app/api/time-slots/${slot.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              date: formatted,
              startTime: `${formatted}T${slot.startTime}:00.000Z`,
              endTime: `${formatted}T${slot.endTime}:00.000Z`,
            }),
          }
        );
      } else {
        await fetch(
          `https://fitness-app-seven-beryl.vercel.app/api/time-slots`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              date: formatted,
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

    fetchMonthSlots();
    alert("Slots saved successfully ✅");

  } catch (err) {
    alert("Error saving ❌");
  } finally {
    setSaving(false);
  }
};

  /* ================= UI ================= */

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">Availability Slots</h3>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>

          <div className="availability-pro-calendar">

            <div className="availability-pro-header">
              <button
                className="availability-pro-nav"
                onClick={() => changeMonth(-1)}
              >
                ‹
              </button>

              <h4 className="fw-semibold mb-0">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>

              <button
                className="availability-pro-nav"
                onClick={() => changeMonth(1)}
              >
                ›
              </button>
            </div>

            <div className="availability-pro-weekdays">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="availability-pro-grid">
              {generateCalendarDays().map((date, i) => {
                if (!date) return <div key={i}></div>;

                const formatted = formatDate(date);
                const hasSlots = slotDates.includes(formatted);
                const isSelected =
                  selectedDate &&
                  date.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={i}
                    className={`availability-pro-cell
                      ${isSelected ? "availability-pro-selected" : ""}
                    `}
                    onClick={() => handleDateClick(date)}
                  >
                    {date.getDate()}
                    {hasSlots && (
                      <span className="availability-dot"></span>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </Card.Body>
      </Card>

      {selectedDate && (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>

            <h5 className="fw-semibold mb-3">
              Slots for {selectedDate.toDateString()}
            </h5>

            {loadingSlots ? (
              <p>Loading slots...</p>
            ) : (
              <>
                {slots.map((slot, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={4}>
                      <Form.Control
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateSlot(index, "startTime", e.target.value)
                        }
                      />
                    </Col>

                    <Col md={4}>
                      <Form.Control
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateSlot(index, "endTime", e.target.value)
                        }
                      />
                    </Col>

                    <Col md={2}>
                      <Button
                        variant="outline-danger"
                        onClick={() => deleteSlot(index)}
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                ))}

                <Button
                  variant="outline-primary"
                  onClick={addSlot}
                  className="me-3"
                >
                  + Add Slot
                </Button>

                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}

          </Card.Body>
        </Card>
      )}
    </div>
  );
}