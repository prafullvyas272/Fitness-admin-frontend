import { useState, useEffect } from "react";
import { Table, Modal, Badge, Dropdown, Form, Button } from "react-bootstrap";

export default function AllCustomers() {
  const [customers, setCustomers] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedTrainer, setSelectedTrainer] = useState("");

  // Load customers + trainers
  useEffect(() => {
    const storedCustomers =
      JSON.parse(localStorage.getItem("gymCustomers")) || [];
    const storedTrainers =
      JSON.parse(localStorage.getItem("gymTrainers")) || [];

    setCustomers(storedCustomers);
    setTrainers(storedTrainers);
  }, []);

  // Save customers
  const saveCustomers = (updated) => {
    setCustomers(updated);
    localStorage.setItem("gymCustomers", JSON.stringify(updated));
  };

  // DELETE
  const deleteCustomer = (id) => {
    const updated = customers.filter((c) => c.id !== id);
    saveCustomers(updated);
  };

  // VIEW
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowView(true);
  };

  // EDIT
  const handleEditOpen = (customer) => {
    setEditData(customer);
    setShowEdit(true);
  };

  const handleEditSave = () => {
    const updated = customers.map((c) =>
      c.id === editData.id ? editData : c
    );
    saveCustomers(updated);
    setShowEdit(false);
  };

  // ASSIGN TRAINER
  const handleAssignOpen = (customer) => {
    setSelectedCustomer(customer);
    setSelectedTrainer(customer.assignedTrainer || "");
    setShowAssign(true);
  };

  const handleAssignSave = () => {
    const updated = customers.map((c) =>
      c.id === selectedCustomer.id
        ? { ...c, assignedTrainer: selectedTrainer }
        : c
    );
    saveCustomers(updated);
    setShowAssign(false);
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">All Customers</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Membership</th>
            <th>Status</th>
            <th>Trainer</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No Customers Found
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.membership}</td>
                <td>
                  <Badge
                    bg={
                      customer.status === "Active"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {customer.status}
                  </Badge>
                </td>
                <td>{customer.assignedTrainer || "-"}</td>

                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      as="div"
                      className="btn btn-sm p-1 border-0 bg-transparent shadow-none"
                    >
                      <i className="fe fe-more-vertical fs-5 text-dark"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleView(customer)}>
                        <i className="fe fe-eye me-2"></i> View
                      </Dropdown.Item>

                      <Dropdown.Item onClick={() => handleAssignOpen(customer)}>
                        <i className="fe fe-user-plus me-2"></i> Assign Trainer
                      </Dropdown.Item>

                      <Dropdown.Item onClick={() => handleEditOpen(customer)}>
                        <i className="fe fe-edit me-2"></i> Edit
                      </Dropdown.Item>

                      <Dropdown.Divider />

                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => deleteCustomer(customer.id)}
                      >
                        <i className="fe fe-trash me-2"></i> Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* VIEW MODAL */}
      <Modal show={showView} onHide={() => setShowView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCustomer && (
            <>
              <p><strong>Name:</strong> {selectedCustomer.name}</p>
              <p><strong>Email:</strong> {selectedCustomer.email}</p>
              <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
              <p><strong>Membership:</strong> {selectedCustomer.membership}</p>
              <p><strong>Status:</strong> {selectedCustomer.status}</p>
              <p><strong>Trainer:</strong> {selectedCustomer.assignedTrainer || "-"}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* EDIT MODAL */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-3"
              value={editData.name || ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
            <Form.Control
              className="mb-3"
              value={editData.email || ""}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
            />
            <Form.Control
              className="mb-3"
              value={editData.phone || ""}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
            />
            <Button onClick={handleEditSave}>Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ASSIGN TRAINER MODAL */}
      <Modal show={showAssign} onHide={() => setShowAssign(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Trainer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
          >
            <option value="">Select Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.name}>
                {trainer.name}
              </option>
            ))}
          </Form.Select>

          <Button className="mt-3" onClick={handleAssignSave}>
            Assign
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
