import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  Badge,
  Dropdown,
  Card,
  Row,
  Col,
} from "react-bootstrap";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("gymTrainers")) || [];
    setTrainers(stored);
  }, []);

  return (
    <div className="p-4">
      <Card>
        <Card.Body>

          {/* Header Section */}
          <Row className="mb-4 align-items-center">
            <Col>
              <h3>All Trainers</h3>
            </Col>

            <Col className="text-end">
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="div"
                  className="btn btn-sm p-2 border bg-light shadow-sm"
                >
                  <i className="fe fe-more-vertical fs-5"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu>

                  <Dropdown.Item
                    as={Link}
                    href="/trainers/create"
                  >
                    <i className="fe fe-user-plus me-2"></i>
                    Create New Trainer
                  </Dropdown.Item>

                  <Dropdown.Item>
                    <i className="fe fe-trash me-2"></i>
                    Delete Trainer
                  </Dropdown.Item>

                  <Dropdown.Item>
                    <i className="fe fe-slash me-2"></i>
                    Inactive Trainer
                  </Dropdown.Item>

                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {/* Table */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {trainers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Trainers Found
                  </td>
                </tr>
              ) : (
                trainers.map((trainer) => (
                  <tr key={trainer.id}>
                    <td>{trainer.name}</td>
                    <td>{trainer.email}</td>
                    <td>{trainer.phone}</td>
                    <td>
                      <Badge
                        bg={
                          trainer.status === "Active"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {trainer.status}
                      </Badge>
                    </td>

                    {/* Row 3 Dots */}
                    <td>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          as="div"
                          className="btn btn-sm p-1 border-0 bg-transparent shadow-none"
                        >
                          <i className="fe fe-more-vertical fs-5 text-dark"></i>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item>
                            <i className="fe fe-edit me-2"></i>
                            Edit
                          </Dropdown.Item>

                          <Dropdown.Item>
                            <i className="fe fe-users me-2"></i>
                            Assign Customer
                          </Dropdown.Item>

                          <Dropdown.Divider />

                          <Dropdown.Item className="text-danger">
                            <i className="fe fe-trash me-2"></i>
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

        </Card.Body>
      </Card>
    </div>
  );
}
