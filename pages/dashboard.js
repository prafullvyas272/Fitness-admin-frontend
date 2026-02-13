import { Card, Row, Col, ProgressBar } from "react-bootstrap";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function Dashboard() {
  const chartOptions = {
    chart: {
      id: "gym-sales",
      toolbar: { show: false },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
  };

  const chartSeries = [
    {
      name: "Revenue",
      data: [2000, 3500, 4000, 3000, 5000, 6000],
    },
  ];

  return (
    <div className="p-4">
      <h2 className="mb-4">Gym Dashboard</h2>

      {/* Top Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Total Members</h5>
              <h3>120</h3>
              <ProgressBar now={75} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Active Members</h5>
              <h3>95</h3>
              <ProgressBar variant="success" now={80} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Total Trainers</h5>
              <h3>12</h3>
              <ProgressBar variant="info" now={60} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Monthly Revenue</h5>
              <h3>$30,569</h3>
              <ProgressBar variant="warning" now={65} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Revenue Overview</h5>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm bg-primary text-white">
            <Card.Body>
              <h4>Total Revenue</h4>
              <h2>$30,569</h2>
              <p>+12% this month</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
