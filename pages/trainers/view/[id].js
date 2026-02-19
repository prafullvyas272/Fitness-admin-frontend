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
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrainerById } from "../../../redux/slices/trainerSlice";

import { removeCustomerFromTrainer } from "../../../redux/slices/trainerSlice";

import { fetchTrainerSessions } from "../../../redux/slices/sessionSlice";
import { 
  setSelectedTrainer 
} from "../../../redux/slices/trainerSlice";


export default function TrainerProfile() {
  const router = useRouter();
  const dispatch = useDispatch();

 const { sessions: reduxSessions, loading: sessionLoading } = useSelector(
  (state) => state.sessions
);

// 🔥 Demo sessions (temporary UI testing)
const demoSessions = [
  {
    id: 1,
    customer: "Aman Sharma",
    date: "2026-02-19",
    start: "09:00",
    end: "10:00",
  },
  {
    id: 2,
    customer: "Riya Patel",
    date: "2026-02-19",
    start: "11:00",
    end: "12:30",
  },
  {
    id: 3,
    customer: "John Doe",
    date: "2026-02-19",
    start: "15:00",
    end: "16:00",
  },
  {
    id: 4,
    customer: "Neha Verma",
    date: "2026-02-20",
    start: "08:00",
    end: "09:00",
  },
  {
    id: 5,
    customer: "Rahul Mehta",
    date: "2026-02-21",
    start: "17:00",
    end: "18:00",
  },
];

// Use demo if redux empty
const sessions =
  reduxSessions && reduxSessions.length > 0
    ? reduxSessions
    : demoSessions;


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



const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedDate, setSelectedDate] = useState(new Date());
const [selectedWeekDate, setSelectedWeekDate] = useState(null);

// Demo status data (UI only)
const bookedDates = [
  "2026-02-16",
  "2026-02-18",
  "2026-02-19",
  "2026-02-20",
];

const holidayDates = ["2026-02-22"];


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
router.push(`/trainers/view/${trainer.id}`);
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

//New

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

const weeklyAssignedHours = sessions.reduce(
  (acc, slot) =>
    acc + calculateDuration(slot.start, slot.end),
  0
);


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

const formatDate = (date) => {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const weekDates = selectedDate ? getWeekDates(selectedDate) : [];




  return (
    <div className="p-4">
  {/* BACK BUTTON */}
<div className="mb-3">
  <Button
    variant="outline-secondary"
    className="px-3 rounded-3"
    onClick={() => router.push("/trainers")}
  >
    ← Back
  </Button>
</div>

{/* PAGE TITLE */}
<h3 className="fw-bold mb-4">Trainer Profile</h3>



      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>

          {/* TABS */}
 {/* ================= NAV TABS ================= */}
<ul className="nav nav-tabs custom-tabs mb-4">

  <li className="nav-item">
    <button
      className={`nav-link ${activeTab === "profile" ? "active fw-semibold" : ""}`}
      onClick={() => setActiveTab("profile")}
    >
      Overview
    </button>
  </li>

  <li className="nav-item">
    <button
      className={`nav-link ${activeTab === "customers" ? "active fw-semibold" : ""}`}
      onClick={() => setActiveTab("customers")}
    >
    Customers ({trainer.assignedCustomersAsTrainer?.length || 0})
    </button>
  </li>

  <li className="nav-item">
  <button
    className={`nav-link ${
      activeTab === "sessions" ? "active fw-semibold" : ""
    }`}
    onClick={() => setActiveTab("sessions")}
  >
    Session Management
  </button>
</li>

</ul>


          {/* ================= PROFILE ================= */}
          {activeTab === "profile" && (
            <Row>

              {/* LEFT SIDE IMAGE */}
              <Col md={4} className="text-center border-end">
                <img
  src={
    trainer.userProfileDetails?.[0]?.avatarUrl ||
    "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
  }
  alt="avatar"
  onClick={() => setShowImageModal(true)}
  style={{
    width: 170,
    height: 170,
    objectFit: "cover",
    borderRadius: "50%",
    border: "4px solid #e9ecef",
    cursor: "pointer",
    transition: "0.3s",
  }}
  className="mb-3"
/>

                <h5 className="fw-bold">
                  {trainer.firstName} {trainer.lastName}
                </h5>

                <p className="text-muted mb-2">
                  {trainer.email}
                </p>

                <StatusPill isActive={trainer.isActive} />
                <div className="d-flex justify-content-center gap-2 mt-4">
  <Button
    variant="outline-danger"
    size="sm"
    onClick={handleDeleteTrainer}
    style={{ minWidth: "100px" }}
  >
    Delete
  </Button>

  <Button
    variant="primary"
    size="sm"
    onClick={handleEditTrainer}
    style={{ minWidth: "120px" }}
  >
    Edit Profile
  </Button>
</div>

              </Col>

              {/* RIGHT SIDE DETAILS */}
              <Col md={8} className="ps-4">

                {/* BIO ON TOP */}
                <h5 className="fw-bold mb-2">Bio:</h5>
                <p className=" mb-4">
                  {displayValue(trainer.userProfileDetails?.[0]?.bio)}
                </p>
<br />
                <h5 className="fw-bold mb-2">Profile Details:</h5>
<br />
                <Row className="mb-3">
                  <Col md={4} className="fw-semibold">Full Name:</Col>
                  <Col md={8}>
                    {trainer.firstName} {trainer.lastName}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4} className="fw-semibold">Phone:</Col>
                  <Col md={8}>{displayValue(trainer.phone)}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4} className="fw-semibold">Host Gym:</Col>
                  <Col md={8}>{displayValue(trainer.userProfileDetails?.[0]?.hostGymName)}</Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4} className="fw-semibold">Gym Address:</Col>
                  <Col md={8}>{displayValue(trainer.userProfileDetails?.[0]?.hostGymAddress)}</Col>
                </Row>

                <Row>
                  <Col md={4} className="fw-semibold">Address:</Col>
                  <Col md={8}>{displayValue(trainer.userProfileDetails?.[0]?.address)}</Col>
                </Row>

              </Col>
            </Row>
          )}

          {/* ================= CUSTOMER LIST ================= */}
          {activeTab === "customers" && (
            <>
              <h5 className="fw-bold mb-3">Customer List</h5>

              <Table responsive hover className="align-middle">
                <thead className="bg-light">
                  <tr className="text-muted text-uppercase small">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th className="text-center">Status</th>
    <th className="text-center">Assigned Trainer</th>
    <th className="text-center">Action</th>
                  </tr>
                </thead>

<tbody>
  {assignedCustomers.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-4 text-muted">
        No customers assigned
      </td>
    </tr>
  ) : (
    assignedCustomers.map((item) => {
      const customer = item.customer;

      return (
        <tr key={customer.id}>
          <td className="fw-semibold">
            {customer.firstName} {customer.lastName}
          </td>
          <td>{customer.email}</td>
          <td>{customer.phone}</td>
          <td>
            <StatusPill isActive={item.isActive} />
          </td>
          <td>Assigned</td>
          <td className="text-end">
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() =>
                removeTrainerFromCustomer(customer.id)
              }
            >
              Remove Trainer
            </Button>
          </td>
        </tr>
      );
    })
  )}
</tbody>

              </Table>
            </>
          )}

                    {/* ================= SESSIONS SECTION ================= */}
          {activeTab === "sessions" && (
  <>
    {/* <h5 className="fw-bold mb-4">Trainer Sessions</h5> */}

    {/* ================= CALENDAR CARD ================= */}
    <div className="calendar-card">

      {/* Month Header */}
      <div className="calendar-header">
        <button
          className="calendar-nav"
          onClick={() => changeMonth(-1)}
        >
          ‹
        </button>

        <h4 className="mb-0 fw-semibold">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h4>

        <button
          className="calendar-nav"
          onClick={() => changeMonth(1)}
        >
          ›
        </button>
      </div>

      {/* Weekday Row */}
      <div className="calendar-weekdays">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
{/* Calendar Grid */}
<div className="calendar-grid">
  {generateCalendarDays().map((date, index) => {
    if (!date) return <div key={index}></div>;

    const formatted = formatDate(date);

    const isBooked = bookedDates.includes(formatted);
    const isHoliday = holidayDates.includes(formatted);
    const isToday =
      date.toDateString() === new Date().toDateString();

    const isSelected =
      selectedDate &&
      date.toDateString() === selectedDate.toDateString();

    let statusClass = "available";
    if (isBooked) statusClass = "booked";
    if (isHoliday) statusClass = "holiday";

    return (
      <div
        key={index}
        className={`calendar-cell 
          ${statusClass}
          ${isSelected ? "selected" : ""}
        `}
        onClick={() => setSelectedDate(date)}
      >
        {date.getDate()}
      </div>
    );
  })}
</div>

{/* Legend */}
<div className="calendar-legend">
  <span className="legend-item booked-dot">Booked</span>
  <span className="legend-item available-dot">Available</span>
  <span className="legend-item holiday-dot">Holiday</span>
</div>


      {/* Hours Section */}
      <div className="stats-wrapper">

  <div className="stats-card">
    <p className="stats-label">
      Hours remaining for this week
    </p>
    <h2 className="stats-value">
      45
    </h2>
  </div>

  <div className="stats-card">
    <p className="stats-label">
      Total Booking hours for this week
    </p>
    <h2 className="stats-value">
      {weeklyAssignedHours.toFixed(1)}
    </h2>
  </div>

</div>


    </div>

    {/* ================= WEEKLY STRIP ================= */}
   {selectedDate && (
  <>
    {/* Show heading only if slots exist */}
    {sessions.filter(
      (s) =>
        s.date === formatDate(selectedWeekDate || selectedDate)
    ).length > 0 && (
      <h5 className="fw-semibold mt-4 mb-3 booked-heading">
        Booked Slots
      </h5>
    )}

    <div className="booking-wrapper">


  {sessions
  .filter(
    (s) =>
      s.date ===
      formatDate(selectedWeekDate || selectedDate)
  )
  .map((slot) => {


      const isPremium = slot.customer === "John Doe"; // demo logic

      return (
        <div key={slot.id} className="booking-card">

          {/* LEFT SECTION */}
          <div className="booking-left">

  <div className="avatar-wrapper">
    <img
      src="https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
      className="booking-avatar"
      alt="avatar"
    />

    {isPremium && (
      <span className="premium-badge">👑</span>
    )}
  </div>

  <div className="booking-content">
    <h6 className="booking-name">
      {slot.customer}
    </h6>

    <div className="booking-meta">
      <span>📅 {new Date(slot.date).toLocaleDateString()}</span>
      <span>⏰ {slot.start} - {slot.end}</span>
      <span>📍 Body care Gym</span>
    </div>
  </div>

</div>


          {/* RIGHT SECTION */}
          {/* <div className="booking-actions">
  <button className="btn-cancel">
    Cancel
  </button> */}
{/* </div> */}


        </div>
      );
    })}

</div>

      </>
    )}
  </>
)}

        </Card.Body>
      </Card>

      {/* ================= MODAL ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Trainer</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Select
            value={selectedTrainerId}
            onChange={(e) =>
              setSelectedTrainerId(Number(e.target.value))
            }
          >
            <option value="">Select Trainer</option>
            {allTrainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
<Button
  variant="primary"
  onClick={() => assignToThisTrainer(selectedCustomer.id)}
  disabled={!selectedCustomer}
>
  Assign to This Trainer
</Button>
        </Modal.Footer>
      </Modal>

{/* IMAGE PREVIEW MODAL */}
<Modal
  show={showImageModal}
  onHide={() => setShowImageModal(false)}
  centered
  size="lg"
>
  <Modal.Body className="text-center p-0">
    <img
      src={
        trainer.userProfileDetails?.[0]?.avatarUrl ||
        "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
      }
      alt="preview"
      style={{
        width: "100%",
        maxHeight: "80vh",
        objectFit: "contain",
      }}
    />
  </Modal.Body>
</Modal>
      

    </div>
  );
}
