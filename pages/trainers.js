import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  Dropdown,
  Card,
  Row,
  Col,
  Button,
  Nav,
} from "react-bootstrap";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const storedTrainers =
      JSON.parse(localStorage.getItem("gymTrainers")) || [];
    const storedCustomers =
      JSON.parse(localStorage.getItem("gymCustomers")) || [];

    setTrainers(storedTrainers);
    setCustomers(storedCustomers);
  }, []);

  return (
    <div className="p-4">

      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold">Trainer Management</h3>
        </Col>
        <Col className="text-end">
          <Link href="/trainers/create">
            <Button variant="primary">
              + Create Trainer
            </Button>
          </Link>
        </Col>
      </Row>

      {/* MAIN CARD */}
      <Card className="shadow-sm border-0">
        <Card.Body>

          {/* TABS */}
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                active={activeTab === "customers"}
                onClick={() => setActiveTab("customers")}
              >
                Customer List
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* ================= PROFILE TAB ================= */}
          {activeTab === "profile" && (
            <>
              <h5 className="fw-bold mb-3">All Trainers</h5>
              <hr />

              <Table hover responsive className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {trainers.map((trainer) => (
                    <tr key={trainer.id}>
                      <td className="fw-semibold">{trainer.name}</td>
                      <td>{trainer.email}</td>
                      <td>{trainer.phone}</td>

                      <td>
                        <span className="d-inline-flex align-items-center gap-2">
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor:
                                trainer.status === "Active"
                                  ? "#22c55e"
                                  : "#dc3545",
                            }}
                          ></span>
                          {trainer.status}
                        </span>
                      </td>

                      <td className="text-end">
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            as="div"
                            className="btn btn-sm border-0 bg-transparent"
                          >
                            <i className="fe fe-more-vertical fs-5"></i>
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <i className="fe fe-eye me-2"></i> View Details
                            </Dropdown.Item>

                            <Dropdown.Item>
                              <i className="fe fe-edit me-2"></i> Edit
                            </Dropdown.Item>

                            <Dropdown.Divider />

                            <Dropdown.Item className="text-danger">
                              <i className="fe fe-trash me-2"></i> Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {/* ================= CUSTOMER TAB ================= */}
          {activeTab === "customers" && (
            <>
              <h5 className="fw-bold mb-3">All Customers</h5>
              <hr />

              <Table hover responsive className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Assign</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="fw-semibold">{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>

                      <td>
                        <span className="d-inline-flex align-items-center gap-2">
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor:
                                customer.status === "Active"
                                  ? "#22c55e"
                                  : "#dc3545",
                            }}
                          ></span>
                          {customer.status}
                        </span>
                      </td>

                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                        >
                          Assign Trainer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

        </Card.Body>
      </Card>
    </div>
  );
}
