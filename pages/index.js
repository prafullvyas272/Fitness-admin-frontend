// import node module libraries
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Container, Col, Row } from "react-bootstrap";

// import widget/custom components
import { StatRightTopIcon } from "widgets";

// import sub components
import { ActiveProjects, Teams, TasksPerformance } from "sub-components";

// import required data files
import ProjectsStatsData from "data/dashboard/ProjectsStatsData";

const Home = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Ensure this only runs in browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/login");
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Prevent rendering dashboard until auth check finishes
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Fragment>
      <div className="bg-primary pt-10 pb-21"></div>

      <Container fluid className="mt-n22 px-6">
        <Row>
          <Col lg={12} md={12} xs={12}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="mb-2 mb-lg-0">
                <h3 className="mb-0 text-white">Dashboard</h3>
              </div>
              <div>
                <Link href="#" className="btn btn-white">
                  Create New Project
                </Link>
              </div>
            </div>
          </Col>

          {ProjectsStatsData.map((item, index) => (
            <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
              <StatRightTopIcon info={item} />
            </Col>
          ))}
        </Row>

        <ActiveProjects />

        <Row className="my-6">
          <Col xl={4} lg={12} md={12} xs={12} className="mb-6 mb-xl-0">
            <TasksPerformance />
          </Col>

          <Col xl={8} lg={12} md={12} xs={12}>
            <Teams />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Home;