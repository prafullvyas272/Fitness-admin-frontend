import { useState, useEffect } from "react";
import { Card, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import moment from "moment";

const IST_TZ = "Asia/Kolkata";

const formatDateIST = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const apiIsoToISTTime = (iso) => moment.utc(iso).utcOffset(330).format("h:mm A");
const apiIsoToISTDate = (iso) => moment.utc(iso).utcOffset(330).format("YYYY-MM-DD");

const istLocalToUtcIso = (dateStr, time24) =>
  moment(`${dateStr} ${time24}`, "YYYY-MM-DD HH:mm")
    .utcOffset("+05:30", true)
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

export default function AvailabilitySlots() {
  const [creatorId, setCreatorId] = useState(null);
  const [token, setToken] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [slotDates, setSlotDates] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const [overlapError, setOverlapError] = useState(null);

  const formatDate = (date) => (date ? formatDateIST(date) : null);

  const addMinutesToTime = (time, minutesToAdd) => {
    if (!time) return "";

    return moment(time, "h:mm A").add(minutesToAdd, "minutes").format("h:mm A");
  };

  const generateTimeOptions = () => {
    const times = [];
    const start = 0;
const end = 24 * 60;

    for (let i = start; i <= end; i += 15) {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;

      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHour = hours % 12 || 12;

      const label = `${formattedHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;

      times.push({ value: label, label });
    }

    return times;
  };

  const timeOptions = generateTimeOptions();

  const toTwentyFourHourTime = (time) => {
    if (!time) return "";
    return moment(time, "h:mm A").format("HH:mm");
  };

  // Converts "h:mm A" to total minutes for easy comparison
const timeToMinutes = (time) => {
  if (!time) return null;
  return moment(time, "h:mm A").hours() * 60 + moment(time, "h:mm A").minutes();
};

  // Only allow start times where start + 45 min stays within the same day (end <= 11:59 PM)
  const startTimeOptions = timeOptions.filter(
    (t) => timeToMinutes(t.value) + 45 < 1440
  );

// Returns true if slot A overlaps slot B
const slotsOverlap = (startA, endA, startB, endB) => {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  if (sA === null || eA === null || sB === null || eB === null) return false;
  // Overlap if one starts before the other ends
  return sA < eB && sB < eA;
};

// Returns an error message if any two slots in the array overlap, else null
const validateNoOverlaps = (slotList) => {
  for (let i = 0; i < slotList.length; i++) {
    for (let j = i + 1; j < slotList.length; j++) {
      const a = slotList[i];
      const b = slotList[j];
      if (a.startTime && a.endTime && b.startTime && b.endTime) {
        if (slotsOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
          return `Slot ${i + 1} (${a.startTime}–${a.endTime}) overlaps with Slot ${j + 1} (${b.startTime}–${b.endTime}).`;
        }
      }
    }
  }
  return null;
};

  const changeMonth = (dir) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
  };

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

  useEffect(() => {
  setOverlapError(validateNoOverlaps(slots));
}, [slots]);

  const fetchMonthSlots = async () => {
    if (!creatorId || !token) return;
    try {
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

      const uniqueDates = [...new Set(data?.data?.slots?.map((slot) => apiIsoToISTDate(slot.date)))];

      setSlotDates(uniqueDates);
    } catch (err) {
      console.error(err);
    }
  };

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
          startTime: apiIsoToISTTime(slot.startTime),
          endTime: apiIsoToISTTime(slot.endTime),
        })) || [];

      setSlots(loadedSlots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const addSlot = () => {
    setSlots([...slots, { startTime: "", endTime: "" }]);
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const updateStartTimeWithAutoEnd = (index, value) => {
    const updated = [...slots];
    updated[index].startTime = value;
    updated[index].endTime = addMinutesToTime(value, 45);
    setSlots(updated);
  };

  const handleStartTimeChange = (index, value) => {
  const updated = [...slots];
  updated[index].startTime = value;
  updated[index].endTime = addMinutesToTime(value, 45);
  setSlots(updated);

  // Validate overlaps live
  const error = validateNoOverlaps(updated);
  setOverlapError(error);
};

  const handleEndTimeChange = (index, value) => {
  const updated = [...slots];
  updated[index].endTime = value;
  setSlots(updated);

  const error = validateNoOverlaps(updated);
  setOverlapError(error);
};

  const deleteSlot = async (index) => {
    const slot = slots[index];

    if (slot.id) {
      await fetch(`https://fitness-app-seven-beryl.vercel.app/api/time-slots/${slot.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    setSlots(slots.filter((_, i) => i !== index));
    fetchMonthSlots();
  };

  const handleSave = async () => {
    if (!selectedDate) return;

    const formatted = formatDate(selectedDate);

    for (let slot of slots) {
      if (!slot.startTime || !slot.endTime) {
        alert("Please fill both start and end time.");
        return;
      }

    }

    const overlapMsg = validateNoOverlaps(slots);
if (overlapMsg) {
  alert(`Cannot save: ${overlapMsg}`);
  return;
}

    setSaving(true);

    try {
      for (let slot of slots) {
        const formattedStartTime = toTwentyFourHourTime(slot.startTime);
        const formattedEndTime = toTwentyFourHourTime(slot.endTime);

        if (slot.id) {
          await fetch(`https://fitness-app-seven-beryl.vercel.app/api/time-slots/${slot.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              date: formatted,
              startTime: istLocalToUtcIso(formatted, formattedStartTime),
              endTime: istLocalToUtcIso(formatted, formattedEndTime),
            }),
          });
        } else {
          await fetch(`https://fitness-app-seven-beryl.vercel.app/api/time-slots`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              date: formatted,
              peakSlots: [
                {
                  start: formattedStartTime,
                  end: formattedEndTime,
                },
              ],
            }),
          });
        }
      }

      await fetchMonthSlots();
      await fetchSlotsForDate(selectedDate);
      alert("Slots saved successfully");
    } catch (err) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">Peak Slots</h3>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>
          <div className="availability-pro-calendar">
            <div className="availability-pro-header">
              <button className="availability-pro-nav" onClick={() => changeMonth(-1)}>
                {"<"}
              </button>

              <h4 className="fw-semibold mb-0">
                {currentMonth.toLocaleString("en-IN", {
                  timeZone: IST_TZ,
                  month: "long",
                  year: "numeric",
                })}
              </h4>

              <button className="availability-pro-nav" onClick={() => changeMonth(1)}>
                {">"}
              </button>
            </div>

            <div className="availability-pro-weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="availability-pro-grid">
              {generateCalendarDays().map((date, i) => {
                if (!date) return <div key={i}></div>;

                const formatted = formatDate(date);
                const hasSlots = slotDates.includes(formatted);
                const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);

                return (
                  <div
                    key={i}
                    className={`availability-pro-cell ${isSelected ? "availability-pro-selected" : ""}`}
                    onClick={() => handleDateClick(date)}
                  >
                    {date.getDate()}
                    {hasSlots && <span className="availability-dot"></span>}
                  </div>
                );
              })}
            </div>
          </div>
        </Card.Body>
      </Card>

      {selectedDate && (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body style={{ overflow: "visible" }}>
            <h5
              style={{
                marginBottom: "16px",
                fontWeight: "600",
              }}
            >
              Time Slots
            </h5>

            {loadingSlots ? (
              <p>Loading slots...</p>
            ) : (
              <>
              {overlapError && (
  <div
    style={{
      background: "#fff0f0",
      border: "1px solid #ffcccc",
      borderRadius: "8px",
      padding: "10px 14px",
      marginBottom: "12px",
      color: "#cc0000",
      fontSize: "13px",
    }}
  >
    ⚠️ {overlapError}
  </div>
)}
                {slots.map((slot, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ width: "180px" }}>
                      <Select
                        options={startTimeOptions}
                        value={startTimeOptions.find((t) => t.value === slot.startTime)}
                        onChange={(selected) => handleStartTimeChange(index, selected?.value || "")}
                        placeholder="Select Time"
                        menuPlacement="top"
                        menuPosition="fixed"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: "38px",
                            borderRadius: "8px",
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </div>

                    <div
                      style={{
                        width: "180px",
                        minHeight: "38px",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                        background: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 12px",
                        color: "#6c757d",
                        fontSize: "14px",
                        cursor: "not-allowed",
                      }}
                    >
                      {slot.endTime || "Auto (45 min)"}
                    </div>

                    <span
                      style={{
                        background: "#eef2ff",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedDate.toLocaleDateString("en-US", { timeZone: IST_TZ, month: "2-digit", day: "2-digit", year: "numeric" })}
                    </span>

                    <Button
                      variant="outline-danger"
                      onClick={() => deleteSlot(index)}
                      style={{
                        height: "38px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <Button variant="outline-primary" onClick={addSlot}>
                    + Add Slot
                  </Button>
                  <Button 
  variant="primary" 
  onClick={handleSave} 
  disabled={saving || !!overlapError}
>
  {saving ? "Saving..." : "Save Changes"}
</Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

