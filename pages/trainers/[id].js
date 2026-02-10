import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Tabs, Tab, Card, Table, Dropdown } from "react-bootstrap";

export default function TrainerDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [key, setKey] = useState("profile");
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("gymCustomers")) || [
        {
          id: 1,
          name: "Alex Johnson",
          email: "alex@example.com",
          phone: "+1 9632 548",
          status: "Active",
        },
        {
          id: 2,
          name: "Nancy Elliot",
          email: "nancy@outlook.com",
          phone: "+1 8523 456",
          status: "Inactive",
        },
      ];

    setCustomers(stored);
  }, []);

  return (
    <div className="p-4">
      <Card>
        <Card.Body>
          <h3 className="mb-4">Trainer ID: {id}</h3>

          <Tabs
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-4"
          >
            {/* PROFILE TAB */}
            <Tab eventKey="profile" title="Profile">
              <Card className="p-4 shadow-sm">
                <h5>Personal Information</h5>
                <hr />
                <p><strong>Name:</strong> John Smith</p>
                <p><strong>Email:</strong> john@gym.com</p>
                <p><strong>Phone:</strong> +1 9632 111</p>
                <p><strong>Status:</strong> Active</p>
              </Card>
            </Tab>

            {/* CUSTOMER LIST TAB */}
            <Tab eventKey="customers" title="Customer List">
              <Card className="p-4 shadow-sm">
                <h5>Customers</h5>
                <hr />

                <Table striped bordered hover responsive>
                  <thead>
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
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>
                          <span className="d-flex align-items-center gap-2">
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor:
                                  customer.status === "Active"
                                    ? "#22c55e"
                                    : "#6b7280",
                              }}
                            ></span>
                            {customer.status}
                          </span>
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle size="sm" variant="light">
                              Assign
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>
                                Assign to Trainer {id}
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}
