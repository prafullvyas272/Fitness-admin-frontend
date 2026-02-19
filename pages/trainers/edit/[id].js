import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchTrainerById, 
  updateTrainerAsync,
  setSelectedTrainer
} from "../../../redux/slices/trainerSlice";

import {
  Card,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useRouter } from "next/router";
import ReactCountryFlag from "react-country-flag";
import Dropdown from "react-bootstrap/Dropdown";


export default function EditTrainer() {
  const router = useRouter();
  const dispatch = useDispatch();
const { trainers, selectedTrainer, loading } = useSelector(
  (state) => state.trainers
);


  const { id } = router.query;

  const [trainer, setTrainer] = useState({
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+91",
  country: "IN",   // 🔥 ADD THIS
  phone: "",
  hostGymName: "",
  hostGymAddress: "",
  address: "",
  bio: "",
  status: "Active",
  avatar: "",
});

  const [originalTrainer, setOriginalTrainer] = useState(null); // for back alert

  /* ================= LOAD TRAINER DATA ================= */
useEffect(() => {
  if (!id) return;

  const existingTrainer = trainers.find(
    (t) => String(t.id) === String(id)
  );

  if (
    existingTrainer &&
    existingTrainer.userProfileDetails &&
    existingTrainer.userProfileDetails.length > 0
  ) {
    dispatch(setSelectedTrainer(existingTrainer));
  } else {
    dispatch(fetchTrainerById(id));
  }

}, [id, trainers, dispatch]);



useEffect(() => {
  if (selectedTrainer) {
    const details = selectedTrainer.userProfileDetails?.[0] || {};

    const fullPhone = selectedTrainer.phone || "";
    const countryMatch = fullPhone.match(/^\+\d{1,4}/);
    const extractedCode = countryMatch ? countryMatch[0] : "+91";
    const extractedNumber = fullPhone.replace(extractedCode, "");

    const countryMap = {
  "+91": "IN",
  "+1": "US",
  "+44": "GB",
  "+61": "AU",
  "+971": "AE",
  "+49": "DE",
  "+51": "PE",
};

const formattedTrainer = {
  firstName: selectedTrainer.firstName || "",
  lastName: selectedTrainer.lastName || "",
  email: selectedTrainer.email || "",
  countryCode: extractedCode,
  country: countryMap[extractedCode] || "IN", // 🔥 IMPORTANT
  phone: extractedNumber,
  hostGymName: details.hostGymName || "",
  hostGymAddress: details.hostGymAddress || "",
  address: details.address || "",
  bio: details.bio || "",
  status: selectedTrainer.isActive ? "Active" : "Inactive",
  avatar: details.avatarUrl || "",
};


    setTrainer(formattedTrainer);
    setOriginalTrainer(formattedTrainer);
  }
}, [selectedTrainer]);





  const handleChange = (e) => {
    setTrainer({
      ...trainer,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTrainer({ ...trainer, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  /* ================= UPDATE TRAINER ================= */
  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = {
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    email: trainer.email,
    phone: trainer.countryCode + trainer.phone,
    isActive: trainer.status === "Active",
    hostGymName: trainer.hostGymName,
    hostGymAddress: trainer.hostGymAddress,
    address: trainer.address,
    bio: trainer.bio,
  };

  const resultAction = await dispatch(
    updateTrainerAsync({ id, formData })
  );

  if (updateTrainerAsync.fulfilled.match(resultAction)) {
    alert("Trainer updated successfully ✅");
    router.replace(`/trainers/view/${id}`);
  } else {
    alert(resultAction.payload || "Update failed");
  }
};


const countryOptions = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US" },
  { code: "+44", country: "GB" },
  { code: "+61", country: "AU" },
  { code: "+971", country: "AE" },
  { code: "+49", country: "DE" },
  { code: "+51", country: "PE" },
];


if (loading || !trainer) {
  return <div className="p-4">Loading trainer...</div>;
}



  return (
    <div className="p-4">
      {/* <h3 className="fw-bold mb-4">Edit Trainer</h3> */}
<div className="d-flex justify-content-between align-items-center mb-4">

  {/* LEFT SIDE BACK BUTTON */}
  <Button
    variant="outline-secondary"
    className="px-3 rounded-3"
    onClick={() => {
      if (
        originalTrainer &&
        JSON.stringify(trainer) !== JSON.stringify(originalTrainer)
      ) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Do you want to go back?"
        );
        if (!confirmLeave) return;
      }
      router.push("/trainers");
    }}
  >
    ← Back
  </Button>

  {/* RIGHT SIDE UPDATE BUTTON */}
  <Button
    type="submit"
    variant="primary"
    className="px-4 py-2 rounded-3"
    disabled={loading}
    form="editTrainerForm"
  >
    {loading ? "Updating..." : "Update Trainer"}
  </Button>

</div>



      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-4">
          <Form id="editTrainerForm" onSubmit={handleSubmit}>


            {/* AVATAR */}
            {/* AVATAR */}
<Row className="mb-4 align-items-center">
  <Col md={3} className="fw-semibold">
    Avatar:
  </Col>

  <Col md={9}>
    <div
      className="avatar-circle-wrapper"
      onClick={() => document.getElementById("editAvatarInput").click()}
    >
      <img
        src={
          trainer.avatar ||
          "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Free-Image.png"
        }
        alt="avatar"
        className="avatar-img"
      />

      <div className="avatar-overlay">
        <span>Change Photo</span>
      </div>

      <input
        type="file"
        id="editAvatarInput"
        accept="image/png, image/jpeg"
        onChange={handleImageUpload}
        hidden
      />
    </div>
  </Col>
</Row>

            {/* FIRST NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                First Name:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-user"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={trainer.firstName}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                    required
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* LAST NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Last Name:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-user"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={trainer.lastName}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                    required
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* EMAIL */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Email:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-mail"></i>
                  </InputGroup.Text>
                  <Form.Control
  type="email"
  name="email"
  value={trainer.email}
  onChange={handleChange}
  pattern="^[^\s@]+@[^\s@]+\.(com|in|org|net)$"
  title="Email must end with .com, .in, .org or .net"
  className="bg-light border-0 custom-input"
  required
/>

                </InputGroup>
              </Col>
            </Row>

            {/* PHONE */}
           {/* PHONE */}
<Row className="mb-4 align-items-center">
  <Col md={3} className="fw-semibold">Phone No:</Col>
  <Col md={9}>
    <InputGroup>

      <Dropdown>
  <Dropdown.Toggle
    variant="light"
    style={{ minWidth: "120px" }}
    className="d-flex align-items-center justify-content-center"
  >
    <ReactCountryFlag
      countryCode={trainer.country}
      svg
      style={{ width: "20px", marginRight: "8px" }}
    />
    {trainer.countryCode}
  </Dropdown.Toggle>

  <Dropdown.Menu>
    {countryOptions.map((c) => (
      <Dropdown.Item
        key={c.code}
        onClick={() =>
          setTrainer({
            ...trainer,
            countryCode: c.code,
            country: c.country,
          })
        }
      >
        <ReactCountryFlag
          countryCode={c.country}
          svg
          style={{ width: "20px", marginRight: "10px" }}
        />
        {c.code}
      </Dropdown.Item>
    ))}
  </Dropdown.Menu>
</Dropdown>


      <Form.Control
        type="tel"
        name="phone"
        value={trainer.phone}
        onChange={(e) => {
          const onlyNumbers = e.target.value.replace(/\D/g, "");
          setTrainer({ ...trainer, phone: onlyNumbers });
        }}
        className="custom-input"
        required
      />

    </InputGroup>
  </Col>
</Row>

            {/* HOST GYM NAME */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Host Gym Name:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-home"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="hostGymName"
                    value={trainer.hostGymName}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* HOST GYM ADDRESS */}
            <Row className="mb-4 align-items-center">
              <Col md={3} className="fw-semibold">
                Host Gym Address:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="fe fe-map-pin"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="hostGymAddress"
                    value={trainer.hostGymAddress}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* ADDRESS */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">
                Address:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0 textarea-icon">
                    <i className="fe fe-map"></i>
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={trainer.address}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* BIO */}
            <Row className="mb-4 align-items-start">
              <Col md={3} className="fw-semibold">
                Bio:
              </Col>
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0 textarea-icon">
                    <i className="fe fe-edit"></i>
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={trainer.bio}
                    onChange={handleChange}
                    className="bg-light border-0 custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* STATUS */}
            {/* STATUS */}
<Row className="mb-4 align-items-center">
  <Col md={3} className="fw-semibold">Status:</Col>

  <Col md={9}>
    <Dropdown>
      <Dropdown.Toggle
        variant="light"
        className="bg-light border-0 custom-input d-flex align-items-center"
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        <div className="d-flex align-items-center">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor:
                trainer.status === "Active" ? "#22c55e" : "#dc3545",
              marginRight: 8,
            }}
          ></span>

          <span className="fw-semibold">
            {trainer.status}
          </span>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow border-0 rounded-3">
        <Dropdown.Item
          onClick={() =>
            setTrainer({ ...trainer, status: "Active" })
          }
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "inline-block",
              marginRight: 8,
            }}
          ></span>
          Active
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() =>
            setTrainer({ ...trainer, status: "Inactive" })
          }
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#dc3545",
              display: "inline-block",
              marginRight: 8,
            }}
          ></span>
          Inactive
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  </Col>
</Row>


            {/* BUTTON */}
            

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
