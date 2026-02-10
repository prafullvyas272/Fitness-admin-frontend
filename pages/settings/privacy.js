import { Card } from "react-bootstrap";

export default function PrivacyPolicy() {
  return (
    <div className="p-4">
      <h2 className="mb-4">Privacy Policy</h2>

      <Card className="p-4">
        <p>
          We value your privacy. All customer and trainer information
          collected in this Gym Management System is securely stored
          and never shared with third parties.
        </p>

        <p>
          Personal data including names, contact details, and
          membership information is used only for internal
          management purposes.
        </p>
      </Card>
    </div>
  );
}
