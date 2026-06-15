import { useState, useEffect } from "react";
import Select from "react-select";
import moment from "moment";

const G = {
  bg: "#0a0a0a", card: "#0d0d0d", gold: "#f8e396", goldLight: "#f8e396",
  divider: "#1e1e1e", text: "#ffffff", muted: "#888888", input: "#111111",
  cardBorder: "1px solid #1e1e1e", goldFaint: "rgba(248,227,150,0.07)",
};

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

const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: G.input,
    border: `1px solid ${state.isFocused ? G.gold : G.divider}`,
    borderRadius: 8,
    minHeight: 38,
    boxShadow: "none",
    "&:hover": { borderColor: G.gold },
  }),
  menu: (base) => ({
    ...base,
    background: G.card,
    border: `1px solid ${G.divider}`,
    borderRadius: 8,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "rgba(248,227,150,0.15)" : "transparent",
    color: state.isSelected ? G.goldLight : G.text,
    fontSize: 13,
  }),
  singleValue: (base) => ({ ...base, color: G.text, fontSize: 13 }),
  placeholder: (base) => ({ ...base, color: G.muted, fontSize: 13 }),
  input: (base) => ({ ...base, color: G.text }),
  dropdownIndicator: (base) => ({ ...base, color: G.muted }),
  indicatorSeparator: () => ({ display: "none" }),
};

export default function AvailabilitySlots() {
  const [creatorId, setCreatorId] = useState(null);
  const [token, setToken] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [slotDates, setSlotDates] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState(false);

  const [overlapError, setOverlapError] = useState(null);

  const formatDate = (date) => (date ? formatDateIST(date) : null);

  const addMinutesToTime = (time, minutesToAdd) => {
    if (!time) return "";
    return moment(time, "h:mm A").add(minutesToAdd, "minutes").format("h:mm A");
  };

  const generateTimeOptions = () => {
    const times = [];
    const end = 24 * 60;
    for (let i = 0; i < end; i += 15) {
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

  const timeToMinutes = (time) => {
    if (!time) return null;
    return moment(time, "h:mm A").hours() * 60 + moment(time, "h:mm A").minutes();
  };

  const startTimeOptions = timeOptions.filter(
    (t) => timeToMinutes(t.value) + 45 < 1440
  );

  const slotsOverlap = (startA, endA, startB, endB) => {
    const sA = timeToMinutes(startA);
    const eA = timeToMinutes(endA);
    const sB = timeToMinutes(startB);
    const eB = timeToMinutes(endB);
    if (sA === null || eA === null || sB === null || eB === null) return false;
    return sA < eB && sB < eA;
  };

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
    if (creatorId && token) fetchMonthSlots();
  }, [currentMonth, creatorId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedDate && creatorId && token) fetchSlotsForDate(selectedDate);
  }, [selectedDate, creatorId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setOverlapError(validateNoOverlaps(slots));
  }, [slots]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMonthSlots = async () => {
    if (!creatorId || !token) return;
    try {
      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/time-slots?creatorId=${creatorId}&pageSize=500`,
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
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
    setOverlapError(validateNoOverlaps(updated));
  };

  const handleEndTimeChange = (index, value) => {
    const updated = [...slots];
    updated[index].endTime = value;
    setSlots(updated);
    setOverlapError(validateNoOverlaps(updated));
  };

  const deleteSlot = async (index) => {
    const slot = slots[index];
    setDeletingSlot(true);
    try {
      if (slot.id) {
        await fetch(`https://fitness-app-seven-beryl.vercel.app/api/time-slots/${slot.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setSlots(slots.filter((_, i) => i !== index));
      fetchMonthSlots();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingSlot(false);
    }
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
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              date: formatted,
              startTime: istLocalToUtcIso(formatted, formattedStartTime),
              endTime: istLocalToUtcIso(formatted, formattedEndTime),
            }),
          });
        } else {
          await fetch(`https://fitness-app-seven-beryl.vercel.app/api/time-slots`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              date: formatted,
              peakSlots: [{ start: formattedStartTime, end: formattedEndTime }],
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

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* FULL-SCREEN LOADER */}
      {deletingSlot && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, border: `5px solid rgba(248,227,150,0.2)`, borderTop: `5px solid ${G.gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: G.goldLight }}>Deleting slot...</p>
        </div>
      )}

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: G.goldLight, fontWeight: 700, margin: 0 }}>Peak Slots</h3>
        <small style={{ color: G.muted }}>Manage your availability time slots.</small>
      </div>

      {/* CALENDAR CARD */}
      <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={() => changeMonth(-1)}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.gold, width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
          >
            ‹
          </button>
          <h5 style={{ color: G.text, fontWeight: 700, margin: 0 }}>
            {currentMonth.toLocaleString("en-IN", { timeZone: IST_TZ, month: "long", year: "numeric" })}
          </h5>
          <button
            onClick={() => changeMonth(1)}
            style={{ background: "transparent", border: `1px solid ${G.divider}`, color: G.gold, width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
          >
            ›
          </button>
        </div>

        {/* Weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ textAlign: "center", color: G.gold, fontSize: 12, fontWeight: 600, padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {generateCalendarDays().map((date, i) => {
            if (!date) return <div key={i} />;
            const formatted = formatDate(date);
            const hasSlots = slotDates.includes(formatted);
            const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
            return (
              <div
                key={i}
                onClick={() => handleDateClick(date)}
                style={{
                  position: "relative",
                  textAlign: "center",
                  padding: "8px 4px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 400,
                  background: isSelected ? `${G.gold}` : "transparent",
                  color: isSelected ? "#111" : G.text,
                  border: `1px solid ${isSelected ? "transparent" : "transparent"}`,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(248,227,150,0.1)"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                {date.getDate()}
                {hasSlots && (
                  <span style={{
                    position: "absolute",
                    bottom: 3,
                    left: "50%",
                    marginLeft: -3,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "block",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SLOTS CARD */}
      {selectedDate && (
        <div style={{ background: G.card, border: `1px solid ${G.divider}`, borderRadius: 14, padding: 24 }}>
          <h5 style={{ color: G.text, fontWeight: 700, marginBottom: 20 }}>Time Slots</h5>

          {loadingSlots ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: G.muted, fontSize: 13 }}>
              <div style={{ width: 18, height: 18, border: `3px solid #333`, borderTop: `3px solid ${G.gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Loading slots...
            </div>
          ) : (
            <>
              {overlapError && (
                <div style={{
                  background: "rgba(248,113,113,0.12)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  color: "#f87171",
                  fontSize: 13,
                }}>
                  {overlapError}
                </div>
              )}

              {slots.map((slot, index) => (
                <div
                  key={index}
                  style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}
                >
                  {/* Start time */}
                  <div style={{ width: 180 }}>
                    <Select
                      options={startTimeOptions}
                      value={startTimeOptions.find((t) => t.value === slot.startTime) || null}
                      onChange={(selected) => handleStartTimeChange(index, selected?.value || "")}
                      placeholder="Select Time"
                      menuPlacement="top"
                      menuPosition="fixed"
                      styles={selectStyles}
                    />
                  </div>

                  {/* End time (read-only) */}
                  <div style={{
                    width: 180,
                    minHeight: 38,
                    borderRadius: 8,
                    border: `1px solid ${G.divider}`,
                    background: "#161616",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 12px",
                    color: G.muted,
                    fontSize: 13,
                    cursor: "not-allowed",
                  }}>
                    {slot.endTime || "Auto (45 min)"}
                  </div>

                  {/* Date badge */}
                  <span style={{
                    background: "rgba(248,227,150,0.07)",
                    border: `1px solid ${G.divider}`,
                    padding: "5px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    color: G.goldLight,
                    whiteSpace: "nowrap",
                  }}>
                    {selectedDate.toLocaleDateString("en-US", { timeZone: IST_TZ, month: "2-digit", day: "2-digit", year: "numeric" })}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => deleteSlot(index)}
                    style={{
                      background: "rgba(248,113,113,0.1)",
                      border: "1px solid rgba(248,113,113,0.3)",
                      color: "#f87171",
                      padding: "6px 16px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      height: 38,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}

              {/* Actions */}
              <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                <button
                  onClick={addSlot}
                  style={{
                    background: "transparent",
                    border: `1px solid ${G.divider}`,
                    color: G.text,
                    padding: "8px 20px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  + Add Slot
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !!overlapError}
                  style={{
                    background: (saving || !!overlapError) ? "#333" : `${G.gold}`,
                    border: "none",
                    color: (saving || !!overlapError) ? G.muted : "#111",
                    padding: "8px 24px",
                    borderRadius: 8,
                    cursor: (saving || !!overlapError) ? "not-allowed" : "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
