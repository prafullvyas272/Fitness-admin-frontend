import { useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      const accessToken = data?.data?.access_token;

      if (!accessToken) {
        throw new Error("Access token not received");
      }

      localStorage.setItem("adminToken", accessToken);
      localStorage.setItem("refreshToken", data?.data?.refresh_token);

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center login-wrapper"
    >
      <Row>
        <Col>
          <Card className="login-card">
            
            {/* LOGO */}
            <div className="text-center mb-3">
              <img
                src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1772011826/Upto_logo_1_l2ocqd.png"
                alt="Upto Logo"
                className="login-logo"
              />
            </div>

            <h3 className="text-center fw-bold mb-2">
              Admin Login
            </h3>

            <p className="text-center text-muted mb-4 small">
              Welcome back! Please login to continue.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                />
              </Form.Group>

              <Button
                type="submit"
                className="login-btn w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      size="sm"
                      animation="border"
                      className="me-2"
                    />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}