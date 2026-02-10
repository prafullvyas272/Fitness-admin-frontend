import { Card, Accordion } from "react-bootstrap";

export default function FAQ() {
  return (
    <div className="p-4">
      <h2 className="mb-4">Frequently Asked Questions</h2>

      <Card className="p-4">
        <Accordion>

          <Accordion.Item eventKey="0">
            <Accordion.Header>
              How can I assign a trainer to a member?
            </Accordion.Header>
            <Accordion.Body>
              Go to Customers page → Click 3 dots →
              Select Assign Trainer.
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1">
            <Accordion.Header>
              How do I deactivate a trainer?
            </Accordion.Header>
            <Accordion.Body>
              Go to Trainers page → Edit trainer →
              Change status to Inactive.
            </Accordion.Body>
          </Accordion.Item>

        </Accordion>
      </Card>
    </div>
  );
}
