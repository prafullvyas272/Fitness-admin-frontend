import { Card } from "react-bootstrap";

export default function Terms() {
  return (
    <div className="p-4">
      <h2 className="mb-4">Terms & Conditions</h2>

      <Card className="p-4">
        <p>
          All gym members must comply with gym rules and regulations.
        </p>

        <p>
          Trainers and staff must maintain professionalism at all times.
        </p>

        <p>
          Management reserves the right to suspend memberships for
          policy violations.
        </p>
      </Card>
    </div>
  );
}
