import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrainerById } from "../../../redux/slices/trainerSlice";
import { GeoAltFill } from "react-bootstrap-icons";

import { removeCustomerFromTrainer } from "../../../redux/slices/trainerSlice";

import { fetchTrainerBookings }  from "../../../redux/slices/sessionSlice";
import { 
  setSelectedTrainer 
} from "../../../redux/slices/trainerSlice";
import {
  fetchTrainerWorkouts,
  fetchAllTrainerVideos,
} from "../../../redux/slices/workoutSlice";


export default function TrainerProfile() {
  const router = useRouter();
  const dispatch = useDispatch();

 const { sessions: reduxSessions, loading: sessionLoading } = useSelector(
  (state) => state.sessions
);
const {
  trainerWorkouts,
  trainerLoading,
  trainerVideos,
  trainerVideosLoading,
} = useSelector((state) => state.workout);

const formatDate = (date) => {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


// Use demo if redux empty
const sessions = reduxSessions || [];
console.log("Redux Sessions:", reduxSessions);

const bookedDates = sessions
  .filter((b) => !b.isCancelled)
  .map((b) =>
    formatDate(new Date(b.timeSlot.startTime))
  );

const { trainers, selectedTrainer, loading } = useSelector(
  (state) => state.trainers
);

const trainer = selectedTrainer;


  const { id } = router.query;

  const [allTrainers, setAllTrainers] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  

  const [showImageModal, setShowImageModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Payout state
  const [payouts, setPayouts] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutPosting, setPayoutPosting] = useState(false);
  const [payoutPeriod, setPayoutPeriod] = useState("weekly");
  const [payoutStartDate, setPayoutStartDate] = useState("");
  const [payoutEndDate, setPayoutEndDate] = useState("");
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const payoutPageSize = 20;
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ totalPayout: "", netPayout: "", note: "", periodStart: "", periodEnd: "" });



const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedDate, setSelectedDate] = useState(new Date());
const [selectedWeekDate, setSelectedWeekDate] = useState(null);


const holidayDates = ["2026-02-22"];

const [unavailableDates, setUnavailableDates] = useState([]);

const [trainerTimeSlots, setTrainerTimeSlots] = useState([]);
const [trainerTimeSlotsLoading, setTrainerTimeSlotsLoading] = useState(false);

 /* ================= LOAD DATA ================= */

useEffect(() => {
  if (!id) return;

  const existingTrainer = trainers.find((t) => t.id === id);

  // ✅ If trainer exists AND has full details
  if (
    existingTrainer &&
    existingTrainer.userProfileDetails &&
    existingTrainer.userProfileDetails.length > 0
  ) {
    dispatch(setSelectedTrainer(existingTrainer));
  } else {
    // ❗ Fetch full trainer details
    dispatch(fetchTrainerById(id));
  }

}, [id]);

useEffect(() => {
  if (!trainer?.id) return;

  dispatch(fetchTrainerBookings(trainer.id));

}, [trainer]);

useEffect(() => {
  if (!trainer?.id) return;
  const fetchUnavailable = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/admin/trainers/unavailable",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        const dates = (data.data || [])
          .filter((item) => item.trainer?.id === trainer.id && item.isAvailable === false)
          .map((item) => item.date.split("T")[0]);
        setUnavailableDates(dates);
      }
    } catch (err) {
      console.error("Failed to fetch unavailable dates:", err);
    }
  };
  fetchUnavailable();
}, [trainer?.id]);

useEffect(() => {
  setPayouts([]);
  setPayoutPage(1);
  setPayoutTotal(0);
  setPayoutPeriod("weekly");
  setPayoutStartDate("");
  setPayoutEndDate("");
}, [id]);

useEffect(() => {
  if (!trainer?.id) return;

  dispatch(fetchTrainerWorkouts(trainer.id));
}, [dispatch, trainer?.id]);

useEffect(() => {
  dispatch(fetchAllTrainerVideos());
}, [dispatch]);

useEffect(() => {
  if (activeTab === "sessions" && selectedDate && trainer?.id) {
    fetchTrainerTimeSlots(selectedDate, trainer.id);
  }
}, [selectedDate, activeTab, trainer?.id]);








  if (!trainer && loading) {
  return <div className="p-4">Loading trainer data...</div>;
}


if (!trainer) {
  return <div className="p-4 text-danger">Trainer not found</div>;
}


const assignedCustomers =
  trainer.assignedCustomersAsTrainer || [];


const StatusPill = ({ isActive }) => (
  <div
    className={`status-pill ${
      isActive ? "status-active" : "status-inactive"
    }`}
    style={{ display: "inline-flex", alignItems: "center" }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: isActive ? "#22c55e" : "#dc3545",
        marginRight: 6,
      }}
    ></span>

    <span className="fw-semibold">
      {isActive ? "Active" : "Inactive"}
    </span>
  </div>
);


const assignToThisTrainer = async (customerId) => {
  try {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      "https://fitness-app-seven-beryl.vercel.app/api/assign-customer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trainerId: trainer.id,
          customerId: customerId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    alert("Customer Assigned ✅");

    // refresh customers
    const customerRes = await fetch(
  "https://fitness-app-seven-beryl.vercel.app/api/customers",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

const customerData = await customerRes.json();

if (customerRes.ok) {
  setCustomers(customerData.data || []);
}

  } catch (error) {
    alert(error.message);
  }
};
  /* ================= ASSIGN ================= */
  const openAssignModal = (customer) => {
    setSelectedCustomer(customer);
    setSelectedTrainerId(customer.assignedTrainerId || "");
    setShowModal(true);
  };

  const handleAssignTrainer = () => {
    const updatedCustomers = customers.map((cust) => {
      if (cust.id === selectedCustomer.id) {
        return {
          ...cust,
          assignedTrainerId: selectedTrainerId,
        };
      }
      return cust;
    });

    setCustomers(updatedCustomers);
    localStorage.setItem(
      "gymCustomers",
      JSON.stringify(updatedCustomers)
    );

    setShowModal(false);
  };

  const getTrainerName = (trainerId) => {
    const found = allTrainers.find(
      (t) => String(t.id) === String(trainerId)
    );
    return found
      ? `${found.firstName} ${found.lastName}`
      : "Not Assigned";
  };


  /* ================= EDIT & DELETE ================= */

const handleEditTrainer = () => {
  dispatch(setSelectedTrainer(trainer));
  router.push(`/trainers/edit/${trainer.id}`);
};

const handleDeleteTrainer = async () => {
  if (!confirm("Are you sure?")) return;

  try {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/trainers/${trainer.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    router.push("/trainers");

  } catch (err) {
    alert(err.message);
  }
};

const displayValue = (value) => {
  return value && value !== "" ? value : "N/A";
};

/* ================= PAYOUT ================= */

const fetchPayouts = async (period, startDate, endDate, page) => {
  if (!trainer?.id) return;
  setPayoutLoading(true);
  try {
    const token = localStorage.getItem("adminToken");
    let url = `https://fitness-app-seven-beryl.vercel.app/api/trainers/${trainer.id}/payout?page=${page}&pageSize=${payoutPageSize}`;
    if (period === "custom" && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    } else if (period !== "custom") {
      url += `&period=${period}`;
    }
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setPayouts(data.payouts || []);
      setPayoutTotal(data.pagination?.total || 0);
    }
  } catch (err) {
    console.error("Failed to fetch payouts:", err);
  } finally {
    setPayoutLoading(false);
  }
};

const handlePostPayout = async () => {
  setPayoutPosting(true);
  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/trainers/${trainer.id}/payout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          totalPayout: Number(payoutForm.totalPayout),
          netPayout: Number(payoutForm.netPayout),
          periodStart: payoutForm.periodStart,
          periodEnd: payoutForm.periodEnd,
          ...(payoutForm.note ? { note: payoutForm.note } : {}),
        }),
      }
    );
    const data = await res.json();
    if (res.ok) {
      setShowPayoutModal(false);
      setPayoutForm({ totalPayout: "", netPayout: "", note: "", periodStart: "", periodEnd: "" });
      fetchPayouts(payoutPeriod, payoutStartDate, payoutEndDate, 1);
      setPayoutPage(1);
    } else {
      alert(data.error || data.message || "Payout failed");
    }
  } catch (err) {
    alert("Payout failed: " + err.message);
  } finally {
    setPayoutPosting(false);
  }
};

const fetchTrainerTimeSlots = async (date, tid) => {
  if (!tid || !date) return;
  setTrainerTimeSlotsLoading(true);
  try {
    const token = localStorage.getItem("adminToken");
    const formatted = formatDate(date);
    const d = new Date(date);
    console.log("[trainer-time-slots] trainerId:", tid, "date:", formatted);
    const res = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/admin/trainer-time-slots?trainerId=${tid}&date=${formatted}&day=${d.getDate()}&month=${d.getMonth() + 1}&year=${d.getFullYear()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (res.ok) {
      const all = [
        ...(data.data?.upcomingSessions || []),
        ...(data.data?.pastSessions || []),
      ];
      setTrainerTimeSlots(all);
    } else {
      setTrainerTimeSlots([]);
    }
  } catch (err) {
    console.error("Failed to fetch trainer time slots:", err);
    setTrainerTimeSlots([]);
  } finally {
    setTrainerTimeSlotsLoading(false);
  }
};

/* ================= SESSIONS STATE ================= */

/* ===== MONTH NAVIGATION ===== */

const changeMonth = (direction) => {
  const newMonth = new Date(currentMonth);
  newMonth.setMonth(newMonth.getMonth() + direction);
  setCurrentMonth(newMonth);
};

/* ===== CALENDAR GRID ===== */

const generateCalendarDays = () => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

/* ===== WEEK STRIP ===== */

const generateWeekDays = (date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

/* ===== HOURS CALCULATION ===== */

const calculateDuration = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  return (eh + em / 60) - (sh + sm / 60);
};

const weeklyAssignedHours = sessions
  .filter((b) => !b.isCancelled)
  .reduce((acc, booking) => {
    const start = new Date(booking.timeSlot.startTime);
    const end = new Date(booking.timeSlot.endTime);

    return acc + (end - start) / (1000 * 60 * 60);
  }, 0);


// Get week dates (7 days from selected date)
const getWeekDates = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};



const weekDates = selectedDate ? getWeekDates(selectedDate) : [];

const filteredTrainerVideos = trainerVideos.filter(
  (video) => video.trainer?.id === trainer?.id
);

const formatDisplayDate = (dateString) => {
  const d = new Date(dateString);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
};



  const G = {
    bg:        "#111111",
    card:      "#1a1a1a",
    cardBorder:"1px solid rgba(212,160,23,0.25)",
    gold:      "#d4a017",
    goldLight: "#f5d76e",
    goldFaint: "rgba(212,160,23,0.08)",
    text:      "#f1f1f1",
    muted:     "#888888",
    divider:   "rgba(212,160,23,0.15)",
    input:     "#222222",
  };

  const goldBtn = {
    background: `linear-gradient(135deg, ${G.gold}, #b8860b)`,
    border: "none", color: "#111", fontWeight: 700,
    borderRadius: 8, padding: "6px 18px", cursor: "pointer", fontSize: 13,
  };
  const ghostBtn = {
    background: "transparent", border: `1px solid ${G.divider}`,
    color: G.text, borderRadius: 8, padding: "6px 18px",
    cursor: "pointer", fontSize: 13,
  };
  const dangerBtn = {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171", borderRadius: 8, padding: "6px 18px",
    cursor: "pointer", fontSize: 13,
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`
        .vw-tab { background: transparent; border: none; padding: 10px 18px; font-size: 14px; font-weight: 500; color: ${G.muted}; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; }
        .vw-tab:hover { color: ${G.goldLight}; }
        .vw-tab.active { color: ${G.goldLight}; border-bottom-color: ${G.gold}; font-weight: 600; }
        .vw-tr td { background: ${G.card} !important; border-bottom: 1px solid ${G.divider} !important; color: ${G.text} !important; padding: 13px 14px !important; }
        .vw-tr:hover td { background: ${G.goldFaint} !important; }
        .vw-th { background: #161616 !important; color: ${G.goldLight} !important; border-bottom: 2px solid ${G.divider} !important; font-size: 11px; letter-spacing: 0.8px; padding: 12px 14px !important; }
        table { background: ${G.card} !important; }
        .vw-inp { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px !important; }
        .vw-inp:focus { border-color: ${G.gold} !important; box-shadow: 0 0 0 3px rgba(212,160,23,0.15) !important; }
        .vw-inp option { background: #1a1a1a; }
        .modal-gold .modal-content { background: #1a1a1a; border: 1px solid ${G.divider}; color: ${G.text}; }
        .modal-gold .modal-header { border-bottom: 1px solid ${G.divider}; }
        .modal-gold .modal-footer { border-top: 1px solid ${G.divider}; }
        .modal-gold .modal-title { color: ${G.goldLight}; font-weight: 700; }
        .modal-gold .btn-close { filter: invert(1); }
        .modal-gold .form-label { color: ${G.muted}; font-size: 13px; }
        .modal-gold .form-control { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: ${G.text} !important; border-radius: 8px; }
        .modal-gold .form-control:focus { border-color: ${G.gold} !important; box-shadow: 0 0 0 3px rgba(212,160,23,0.15) !important; }
        .vw-stat { background: #1e1e1e; border: 1px solid ${G.divider}; border-radius: 12px; padding: 20px; }
        .vw-stat p { color: ${G.muted}; font-size: 13px; margin-bottom: 6px; }
        .vw-stat h2 { color: ${G.goldLight}; font-size: 36px; font-weight: 700; margin: 0; }
        .vw-booking { background: #1e1e1e; border: 1px solid ${G.divider}; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .vw-booking-name { font-weight: 600; color: ${G.goldLight}; margin-bottom: 4px; }
        .vw-booking-meta { display: flex; gap: 16px; font-size: 13px; color: ${G.muted}; flex-wrap: wrap; }
        .vw-video-card { background: #1e1e1e; border: 1px solid ${G.divider}; border-radius: 12px; overflow: hidden; }
        .vw-video-card h6 { color: ${G.text}; font-size: 13px; margin: 0; }
        .vw-video-info { padding: 10px 12px; }
        .calendar-card { background: #1e1e1e !important; border-radius: 16px; padding: 20px; border: 1px solid ${G.divider}; }
        .calendar-header h4 { color: ${G.text} !important; }
        .calendar-nav { background: #2a2a2a !important; color: ${G.goldLight} !important; border: 1px solid ${G.divider} !important; }
        .calendar-nav:hover { background: ${G.goldFaint} !important; }
        .calendar-weekdays div { color: ${G.gold} !important; font-size: 13px; }
        .calendar-cell { color: #aaa !important; border-radius: 8px; }
        .calendar-cell:hover { background: ${G.goldFaint} !important; color: ${G.goldLight} !important; }
        .calendar-cell.selected { background: ${G.gold} !important; color: #111 !important; font-weight: 700 !important; }
        .calendar-cell.booked { color: #4ade80 !important; font-weight: 600 !important; }
        .calendar-cell.holiday { color: #f87171 !important; font-weight: 600 !important; }
        .calendar-legend { color: ${G.muted} !important; }
        .pg-gold .page-link { background: #1a1a1a; border-color: ${G.divider}; color: ${G.goldLight}; }
        .pg-gold .page-link:hover { background: ${G.goldFaint}; color: ${G.gold}; }
        .pg-gold .page-item.active .page-link { background: ${G.gold}; border-color: ${G.gold}; color: #111; font-weight: 700; }
        .pg-gold .page-item.disabled .page-link { background: #161616; color: #444; border-color: ${G.divider}; }
      `}</style>

      {/* BACK */}
      <div className="mb-3">
        <button style={ghostBtn} onClick={() => router.push("/trainers")}>← Back</button>
      </div>
      <h3 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 20 }}>Trainer Profile</h3>

      {/* MAIN CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 14, overflow: "visible" }}>

        {/* TABS */}
        <div style={{ borderBottom: `1px solid ${G.divider}`, padding: "0 24px", display: "flex", gap: 4 }}>
          {[
            { key: "profile",   label: "Overview" },
            { key: "customers", label: `Customers (${trainer.assignedCustomersAsTrainer?.length || 0})` },
            { key: "sessions",  label: "Manage Sessions" },
            { key: "videos",    label: "Videos" },
            { key: "payout",    label: "Payout", onClick: () => { setActiveTab("payout"); fetchPayouts("weekly","","",1); } },
          ].map(({ key, label, onClick }) => (
            <button
              key={key}
              className={`vw-tab ${activeTab === key ? "active" : ""}`}
              onClick={onClick || (() => setActiveTab(key))}
            >{label}</button>
          ))}
        </div>

        <div style={{ padding: 24 }}>

          {/* ===== OVERVIEW ===== */}
          {activeTab === "profile" && (
            <Row>
              <Col md={4} className="text-center" style={{ borderRight: `1px solid ${G.divider}` }}>
                <img
                  src={trainer.userProfileDetails?.[0]?.avatarUrl || "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"}
                  alt="avatar"
                  onClick={() => setShowImageModal(true)}
                  style={{ width: 170, height: 170, objectFit: "cover", borderRadius: "50%", border: `4px solid ${G.gold}`, cursor: "pointer", transition: "0.3s" }}
                  className="mb-3"
                />
                <h5 style={{ color: G.goldLight, fontWeight: 700 }}>{trainer.firstName} {trainer.lastName}</h5>
                <p style={{ color: G.muted, marginBottom: 10 }}>{trainer.email}</p>
                <StatusPill isActive={trainer.isActive} />
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button style={dangerBtn} onClick={handleDeleteTrainer}>Delete</button>
                  <button style={goldBtn} onClick={handleEditTrainer}>Edit Profile</button>
                </div>
              </Col>

              <Col md={8} className="ps-4">
                <h5 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 6 }}>Bio:</h5>
                <p style={{ color: G.muted, marginBottom: 24 }}>{displayValue(trainer.userProfileDetails?.[0]?.bio)}</p>
                <h5 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 16 }}>Profile Details:</h5>
                {[
                  ["Full Name", `${trainer.firstName} ${trainer.lastName}`],
                  ["Phone", displayValue(trainer.phone)],
                  ["Gender", trainer.gender ? trainer.gender.charAt(0).toUpperCase() + trainer.gender.slice(1).toLowerCase() : "N/A"],
                  ["Host Gym", displayValue(trainer.userProfileDetails?.[0]?.hostGymName)],
                  ["Gym Address", displayValue(trainer.userProfileDetails?.[0]?.hostGymAddress)],
                ].map(([label, value]) => (
                  <Row key={label} className="mb-3">
                    <Col md={4} style={{ color: G.muted, fontWeight: 600, fontSize: 13 }}>{label}:</Col>
                    <Col md={8} style={{ color: G.text, fontSize: 14 }}>{value}</Col>
                  </Row>
                ))}
              </Col>
            </Row>
          )}

          {/* ===== CUSTOMERS ===== */}
          {activeTab === "customers" && (
            <>
              <h5 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 16 }}>Customer List</h5>
              <Table responsive className="align-middle mb-0">
                <thead>
                  <tr>
                    {["Name","Email","Phone","Status","Assigned Trainer","Action"].map(h => (
                      <th key={h} className="vw-th">{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assignedCustomers.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5" style={{ background: G.card, color: G.muted }}>No customers assigned</td></tr>
                  ) : assignedCustomers.map((item) => {
                    const customer = item.customer;
                    return (
                      <tr key={customer.id} className="vw-tr">
                        <td style={{ fontWeight: 600 }}>{customer.firstName} {customer.lastName}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td><StatusPill isActive={item.isActive} /></td>
                        <td>Assigned</td>
                        <td className="text-end">
                          <button style={dangerBtn} onClick={() => removeTrainerFromCustomer(customer.id)}>Remove Trainer</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </>
          )}

          {/* ===== SESSIONS ===== */}
          {activeTab === "sessions" && (
            <>
              <div className="calendar-card">
                <div className="calendar-header">
                  <button className="calendar-nav" onClick={() => changeMonth(-1)}>‹</button>
                  <h4 className="mb-0 fw-semibold">
                    {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                  </h4>
                  <button className="calendar-nav" onClick={() => changeMonth(1)}>›</button>
                </div>
                <div className="calendar-weekdays">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="calendar-grid">
                  {generateCalendarDays().map((date, index) => {
                    if (!date) return <div key={index}></div>;
                    const formatted = formatDate(date);
                    const isBooked = bookedDates.includes(formatted);
                    const isHoliday = holidayDates.includes(formatted);
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    const isUnavailable = unavailableDates.includes(formatted);
                    let statusClass = "available";
                    if (isBooked) statusClass = "booked";
                    if (isHoliday || isUnavailable) statusClass = "holiday";
                    return (
                      <div key={index} className={`calendar-cell ${statusClass} ${isSelected ? "selected" : ""}`} onClick={() => setSelectedDate(date)}>
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
                <div className="calendar-legend">
                  <span className="legend-item booked-dot">Booked</span>
                  <span className="legend-item available-dot">Available</span>
                  <span className="legend-item holiday-dot">Holiday</span>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
                  {[
                    ["Hours remaining for this week", "45"],
                    ["Total Booking hours for this week", weeklyAssignedHours.toFixed(1)],
                  ].map(([label, val]) => (
                    <div key={label} className="vw-stat" style={{ flex: 1, minWidth: 200 }}>
                      <p>{label}</p>
                      <h2>{val}</h2>
                    </div>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <>
                  {sessions.filter(b => b.timeSlot.startTime.split("T")[0] === formatDate(selectedDate) && !b.isCancelled).length > 0 && (
                    <h5 style={{ color: G.goldLight, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Booked Slots</h5>
                  )}
                  {sessions.filter(b => formatDate(new Date(b.timeSlot.startTime)) === formatDate(selectedDate) && !b.isCancelled).map((booking) => (
                    <div key={booking.id} className="vw-booking">
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <img src="https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png" alt="avatar"
                          style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${G.gold}`, objectFit: "cover" }} />
                        <div>
                          <div className="vw-booking-name">{booking.customer.firstName} {booking.customer.lastName}</div>
                          <div className="vw-booking-meta">
                            <span>📅 {formatDisplayDate(booking.timeSlot.startTime)}</span>
                            <span>⏰ {new Date(booking.timeSlot.startTime).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})} - {new Date(booking.timeSlot.endTime).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <GeoAltFill size={13} style={{ color: "#f87171" }} />
                              {booking.trainer.userProfileDetails?.[0]?.hostGymName || "Gym"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4">
                    <h5 style={{ color: G.goldLight, fontWeight: 600, marginBottom: 12 }}>Trainer Created Slots</h5>
                    {trainerTimeSlotsLoading ? (
                      <p style={{ color: G.muted, fontSize: 14 }}>Loading slots...</p>
                    ) : trainerTimeSlots.length === 0 ? (
                      <div style={{ background: "#1e1e1e", border: `1px dashed ${G.divider}`, borderRadius: 10, padding: 20, textAlign: "center", color: G.muted, fontSize: 14 }}>
                        No slots created for this date
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {trainerTimeSlots.map((slot, idx) => {
                          const start = new Date(slot.startTime);
                          const end = new Date(slot.endTime);
                          const isPast = end < new Date();
                          return (
                            <div key={slot.id || idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1e1e1e", border: `1px solid ${G.divider}`, borderRadius: 10, padding: "12px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: isPast ? "#555" : "#4ade80", flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, fontSize: 14, color: G.text }}>
                                  {start.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})} – {end.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})}
                                </span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: isPast ? "#2a2a2a" : "rgba(74,222,128,0.1)", color: isPast ? "#555" : "#4ade80" }}>
                                {isPast ? "Past" : "Upcoming"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ===== VIDEOS ===== */}
          {activeTab === "videos" && (
            <>
              <h5 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 20 }}>Assigned Videos</h5>
              {trainerLoading ? (
                <p style={{ color: G.muted }}>Loading videos...</p>
              ) : trainerWorkouts.length === 0 ? (
                <p style={{ color: G.muted }}>No videos assigned</p>
              ) : (
                <div className="video-grid">
                  {trainerWorkouts.map((video) => (
                    <div key={video.id} className="vw-video-card">
                      <div className="video-thumb">
                        <video src={video.videoUrl} />
                        <div className="video-overlay">
                          <div className="play-btn" onClick={() => setPreviewVideo(video)}>▶</div>
                        </div>
                      </div>
                      <div className="vw-video-info"><h6>{video.title}</h6></div>
                    </div>
                  ))}
                </div>
              )}

              <h5 style={{ color: G.goldLight, fontWeight: 700, margin: "32px 0 20px" }}>Trainer Uploaded Videos</h5>
              {trainerVideosLoading ? (
                <p style={{ color: G.muted }}>Loading trainer videos...</p>
              ) : filteredTrainerVideos.length === 0 ? (
                <p style={{ color: G.muted }}>No videos uploaded by this trainer</p>
              ) : (
                <div className="video-grid">
                  {filteredTrainerVideos.map((video) => (
                    <div key={video.id} className="vw-video-card">
                      <div className="video-thumb">
                        <img src={video.thumbnail} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div className="vw-video-info">
                        <h6>{video.title}</h6>
                        <p style={{ fontSize: 12, color: G.muted, margin: "4px 0 0" }}>{video.trainer?.firstName} {video.trainer?.lastName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ===== PAYOUT ===== */}
          {activeTab === "payout" && (
            <>
              <Row className="align-items-center mb-4">
                <Col>
                  <h5 style={{ color: G.goldLight, fontWeight: 700, marginBottom: 4 }}>Payout History</h5>
                  <small style={{ color: G.muted }}>View and process trainer payouts</small>
                </Col>
                <Col className="text-end">
                  <button style={goldBtn} onClick={() => setShowPayoutModal(true)}>Process Payout</button>
                </Col>
              </Row>

              <Row className="mb-4 align-items-end">
                <Col xs="auto">
                  <div className="d-flex gap-2">
                    {["weekly","monthly","custom"].map((p) => (
                      <button
                        key={p}
                        style={payoutPeriod === p ? goldBtn : ghostBtn}
                        onClick={() => { setPayoutPeriod(p); setPayoutPage(1); if (p !== "custom") fetchPayouts(p,"","",1); }}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </Col>
                {payoutPeriod === "custom" && (
                  <>
                    <Col xs="auto"><input type="date" className="vw-inp" style={{ padding: "5px 10px" }} value={payoutStartDate} onChange={(e) => setPayoutStartDate(e.target.value)} /></Col>
                    <Col xs="auto"><input type="date" className="vw-inp" style={{ padding: "5px 10px" }} value={payoutEndDate} onChange={(e) => setPayoutEndDate(e.target.value)} /></Col>
                    <Col xs="auto">
                      <button style={goldBtn} disabled={!payoutStartDate || !payoutEndDate} onClick={() => { setPayoutPage(1); fetchPayouts("custom",payoutStartDate,payoutEndDate,1); }}>Apply</button>
                    </Col>
                  </>
                )}
              </Row>

              <Table responsive className="align-middle mb-0">
                <thead>
                  <tr>{["#","Total Payout","Net Payout","Period","Note","Date"].map(h => <th key={h} className="vw-th">{h.toUpperCase()}</th>)}</tr>
                </thead>
                <tbody>
                  {payoutLoading ? (
                    <tr><td colSpan={6} className="text-center py-5" style={{ background: G.card, color: G.muted }}>
                      <Spinner animation="border" size="sm" style={{ color: G.gold }} className="me-2" />Loading payouts...
                    </td></tr>
                  ) : payouts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5" style={{ background: G.card, color: G.muted, fontWeight: 600 }}>No payouts found for this period</td></tr>
                  ) : payouts.map((payout, idx) => (
                    <tr key={payout.id || idx} className="vw-tr">
                      <td style={{ color: G.muted }}>{(payoutPage-1)*payoutPageSize+idx+1}</td>
                      <td style={{ fontWeight: 600, color: G.goldLight }}>€{payout.totalPayout ?? "—"}</td>
                      <td style={{ fontWeight: 600, color: "#4ade80" }}>€{payout.netPayout ?? "—"}</td>
                      <td style={{ color: G.muted, fontSize: 13 }}>
                        {payout.periodStart && payout.periodEnd
                          ? `${new Date(payout.periodStart).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"})} – ${new Date(payout.periodEnd).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"})}`
                          : "—"}
                      </td>
                      <td style={{ color: G.muted }}>{payout.note || "—"}</td>
                      <td style={{ color: G.muted, fontSize: 13 }}>{payout.createdAt ? new Date(payout.createdAt).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"}) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {!payoutLoading && payouts.length > 0 && (
                <Row className="mt-3 align-items-center">
                  <Col md={6} style={{ color: G.muted, fontSize: 13 }}>Page {payoutPage} · {payouts.length} records</Col>
                  <Col md={6} className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button style={ghostBtn} disabled={payoutPage===1} onClick={() => { const p=payoutPage-1; setPayoutPage(p); fetchPayouts(payoutPeriod,payoutStartDate,payoutEndDate,p); }}>Previous</button>
                      <button style={ghostBtn} disabled={payoutPage>=Math.ceil(payoutTotal/payoutPageSize)} onClick={() => { const p=payoutPage+1; setPayoutPage(p); fetchPayouts(payoutPeriod,payoutStartDate,payoutEndDate,p); }}>Next</button>
                    </div>
                  </Col>
                </Row>
              )}
            </>
          )}

        </div>
      </div>

      {/* ASSIGN TRAINER MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-gold">
        <Modal.Header closeButton><Modal.Title>Assign Trainer</Modal.Title></Modal.Header>
        <Modal.Body>
          <select className="vw-inp" style={{ width: "100%", padding: "8px 12px" }} value={selectedTrainerId} onChange={(e) => setSelectedTrainerId(Number(e.target.value))}>
            <option value="">Select Trainer</option>
            {allTrainers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
          </select>
        </Modal.Body>
        <Modal.Footer>
          <button style={ghostBtn} onClick={() => setShowModal(false)}>Cancel</button>
          <button style={goldBtn} onClick={() => assignToThisTrainer(selectedCustomer.id)} disabled={!selectedCustomer}>Assign to This Trainer</button>
        </Modal.Footer>
      </Modal>

      {/* VIDEO PREVIEW MODAL */}
      <Modal show={!!previewVideo} onHide={() => setPreviewVideo(null)} centered>
        <video src={previewVideo?.videoUrl} controls autoPlay style={{ width: "100%" }} />
      </Modal>

      {/* PROCESS PAYOUT MODAL */}
      <Modal show={showPayoutModal} onHide={() => setShowPayoutModal(false)} centered className="modal-gold">
        <Modal.Header closeButton><Modal.Title>Process Payout</Modal.Title></Modal.Header>
        <Modal.Body>
          {[
            { label: "Total Payout *", key: "totalPayout", placeholder: "e.g. 1200", type: "number" },
            { label: "Net Payout *",   key: "netPayout",   placeholder: "e.g. 750",  type: "number" },
          ].map(({ label, key, placeholder, type }) => (
            <Form.Group key={key} className="mb-3">
              <Form.Label>{label}</Form.Label>
              <Form.Control type={type} min="0" placeholder={placeholder} value={payoutForm[key]} onChange={(e) => setPayoutForm({ ...payoutForm, [key]: e.target.value })} />
            </Form.Group>
          ))}
          <Row className="mb-3">
            {[["Period Start *","periodStart"],["Period End *","periodEnd"]].map(([label,key]) => (
              <Col key={key}>
                <Form.Label>{label}</Form.Label>
                <Form.Control type="date" value={payoutForm[key]} onChange={(e) => setPayoutForm({ ...payoutForm, [key]: e.target.value })} />
              </Col>
            ))}
          </Row>
          <Form.Group>
            <Form.Label>Note <span style={{ color: G.muted }}>(optional)</span></Form.Label>
            <Form.Control type="text" placeholder="e.g. April payout" value={payoutForm.note} onChange={(e) => setPayoutForm({ ...payoutForm, note: e.target.value })} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <button style={ghostBtn} onClick={() => setShowPayoutModal(false)}>Cancel</button>
          <button style={goldBtn} onClick={handlePostPayout} disabled={payoutPosting || !payoutForm.totalPayout || !payoutForm.netPayout || !payoutForm.periodStart || !payoutForm.periodEnd}>
            {payoutPosting ? <><Spinner animation="border" size="sm" className="me-2" />Processing...</> : "Confirm Payout"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* IMAGE PREVIEW MODAL */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
        <Modal.Body className="text-center p-0" style={{ background: "#000" }}>
          <img src={trainer.userProfileDetails?.[0]?.avatarUrl || "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"} alt="preview" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }} />
        </Modal.Body>
      </Modal>

    </div>
  );
}
