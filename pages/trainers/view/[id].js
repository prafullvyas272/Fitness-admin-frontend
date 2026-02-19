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



export default function TrainerProfile() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { sessions, loading: sessionLoading } = useSelector(
  (state) => state.sessions
);

const { selectedTrainer: trainer, loading } = useSelector(
  (state) => state.trainers
);

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
const bookedDates = ["2026-02-16", "2026-02-18"];
const holidayDates = ["2026-02-22"];


 /* ================= LOAD DATA ================= */

useEffect(() => {
  if (id) {
    dispatch(fetchTrainerById(id));
  }
}, [id, dispatch]);

useEffect(() => {
  if (trainer?.id) {
    dispatch(fetchTrainerSessions(trainer.id));
  }
}, [trainer?.id, dispatch]);




  if (loading) {
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
  return date.toISOString().split("T")[0];
};

const weekDates = selectedDate ? getWeekDates(selectedDate) : [];




  return (
    <div className="p-4">
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
  {assignedCustomers.map((item) => {
    const customer = item.customer;

    const removeTrainerFromCustomer = async (customerId) => {
  if (!confirm("Remove this trainer from customer?")) return;

  try {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/unassign-customer/${customerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trainerId: trainer.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unassign failed");
    }

    // ✅ UPDATE REDUX INSTANTLY
    dispatch(removeCustomerFromTrainer(customerId));

    alert("Trainer removed successfully ✅");

  } catch (error) {
    alert(error.message);
  }
};


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
        <td>
          <div
  style={{alignItems: "center" }}
>
  <span
    style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "#22c55e",
      marginRight: 6,
    }}
  ></span>

    Assigned
  
</div>
        </td>
        <td className="text-end">
          {/* <Button size="sm" variant="outline-primary">
            Manage
          </Button> */}
          <Button
  size="sm"
  variant="outline-danger"
  onClick={() => removeTrainerFromCustomer(customer.id)}
>
  Remove Trainer
</Button>
        </td>
      </tr>
    );
  })}
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

        <h6 className="mb-0 fw-semibold">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h6>

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
        
        {/* ================= SESSION CARDS ================= */}
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

            <img
              src="https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
              className="booking-avatar"
              alt="avatar"
            />

            <div>
              <div className="booking-name-row">
                <h6 className="booking-name">
                  {slot.customer}
                </h6>

                {isPremium && (
                  <span className="crown">👑</span>
                )}
              </div>

              <div className="booking-info">
                <span>
  📅 {new Date(slot.date).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  })}
</span>

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
