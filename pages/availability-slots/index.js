import { useState, useEffect } from "react";
import { Card, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import moment from "moment";

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

  const addMinutesToTime = (time, minutesToAdd) => {
    if (!time) return "";

    return moment(time, "h:mm A")
      .add(minutesToAdd, "minutes")
      .format("h:mm A");
  };

  const generateTimeOptions = () => {
    const times = [];
    const start = 9 * 60;
    const end = 21 * 60;

    for (let i = start; i <= end; i += 15) {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;

      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHour = hours % 12 || 12;

      const label = `${formattedHour}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;

      times.push({ value: label, label });
    }

    return times;
  };

  const timeOptions = generateTimeOptions();

  const toTwentyFourHourTime = (time) => {
    if (!time) return "";
    return moment(time, "h:mm A").format("HH:mm");
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
          startTime: moment(slot.startTime).format("h:mm A"),
          endTime: moment(slot.endTime).format("h:mm A"),
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

  const updateStartTimeWithAutoEnd = (index, value) => {
    const updated = [...slots];
    updated[index].startTime = value;
    updated[index].endTime = addMinutesToTime(value, 45);
    setSlots(updated);
  };

  const handleStartTimeChange = (index, value) => {
    updateStartTimeWithAutoEnd(index, value);
  };

  const handleEndTimeChange = (index, value) => {
    updateSlot(index, "endTime", value);
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

    if (
      moment(slot.endTime, "h:mm A").isSameOrBefore(
        moment(slot.startTime, "h:mm A")
      )
    ) {
      alert("End time must be greater than start time.");
      return;
    }
  }

  setSaving(true);

  try {
    for (let slot of slots) {

      const formattedStartTime = toTwentyFourHourTime(slot.startTime);
      const formattedEndTime = toTwentyFourHourTime(slot.endTime);

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
              startTime: `${formatted}T${formattedStartTime}:00.000Z`,
              endTime: `${formatted}T${formattedEndTime}:00.000Z`,
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
                  start: formattedStartTime,
                  end: formattedEndTime,
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
      <h3 className="fw-bold mb-4">Peak Slots</h3>

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
                        options={timeOptions}
                        value={timeOptions.find(
                          (t) => t.value === slot.startTime
                        )}
                        onChange={(selected) =>
                          handleStartTimeChange(
                            index,
                            selected?.value || ""
                          )
                        }
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

                    <div style={{ width: "180px" }}>
                      <Select
                        options={timeOptions}
                        value={timeOptions.find(
                          (t) => t.value === slot.endTime
                        )}
                        onChange={(selected) =>
                          handleEndTimeChange(
                            index,
                            selected?.value || ""
                          )
                        }
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

                    <span
                      style={{
                        background: "#eef2ff",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedDate.toDateString()}
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
                    disabled={saving}
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
