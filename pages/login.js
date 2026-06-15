import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const IMAGES = [
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltJTIwd29ya291dHxlbnwwfHwwfHx8MA%3D%3D",
  "https://media.istockphoto.com/id/2027278927/photo/young-athletic-woman-exercising-with-barbell-during-sports-training-in-a-gym.jpg?s=612x612&w=0&k=20&c=ifFL7Mqc8NwTj25PAx4ONy1OOQZvc1S_kVOofsbLgFw=",
  "https://www.puregym.com/media/w1kffo3p/pure-gym-day-16238.jpg?quality=80",
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [stayIn, setStayIn]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [idx, setIdx]           = useState(0);
  const [fading, setFading]     = useState(false);

  /* Slide every 5 s */
  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((p) => (p + 1) % IMAGES.length);
        setFading(false);
      }, 500);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("https://fitness-app-seven-beryl.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Login failed");
      const token = data?.data?.access_token;
      if (!token) throw new Error("Access token not received");
      localStorage.setItem("adminToken",   token);
      localStorage.setItem("refreshToken", data?.data?.refresh_token);
      localStorage.setItem("adminId",      data?.data?.user?.id);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const panelImages = [
    IMAGES[idx % IMAGES.length],
    IMAGES[(idx + 1) % IMAGES.length],
    IMAGES[(idx + 2) % IMAGES.length],
  ];

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "#0a0a0a",
      position: "relative",
      fontFamily: "'Montserrat', Arial, sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .lg-input {
          width: 100%;
          background: #1c1c1c !important;
          border: 1px solid #282828 !important;
          color: #fff !important;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .lg-input::placeholder { color: #444 !important; }
        .lg-input:focus { border-color: #f8e396 !important; }
        .lg-btn {
          width: 100%;
          padding: 11px;
          border: 1px solid rgba(248,227,150,0.65);
          background: transparent;
          color: #f8e396;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .lg-btn:hover:not(:disabled) { background: #f8e396; color: #000; }
        .lg-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .lg-eye {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: #555; cursor: pointer; padding: 0;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .lg-eye:hover { color: #f8e396; }
      `}</style>

      {/* ── THREE FULL-SCREEN PANELS ── */}
      <div style={{
        position: "absolute",
        inset: "14px",
        display: "flex",
        gap: 10,
        alignItems: "stretch",
      }}>
        {panelImages.map((src, i) => {
          const isCenter = i === 1;
          return (
            <div
              key={i}
              style={{
                flex: isCenter ? 2 : 1,
                borderRadius: 20,
                overflow: "hidden",
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: fading ? 0 : 1,
                transition: "opacity 0.5s ease",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute",
                inset: 0,
                background: isCenter
                  ? "rgba(0,0,0,0.42)"
                  : "rgba(0,0,0,0.68)",
              }} />
            </div>
          );
        })}
      </div>

      {/* ── LOGIN CARD ── centered over panels */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 286,
        background: "rgba(12,12,12,0.92)",
        borderRadius: 10,
        padding: "28px 24px 26px",
        zIndex: 20,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1781515780/Layer_x0020_1_1_klnh94.png"
            alt="Upto"
            style={{ height: 40, objectFit: "contain" }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.28)",
            color: "#f87171",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 12,
            marginBottom: 14,
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div style={{ marginBottom: 13 }}>
            <label style={{
              color: "#f8e396",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 7,
            }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="lg-input"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 13 }}>
            <label style={{
              color: "#f8e396",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 7,
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="lg-input"
                style={{ paddingRight: 40 }}
              />
              <button type="button" className="lg-eye" onClick={() => setShowPass(!showPass)}>
                <i className={`fe fe-${showPass ? "eye-off" : "eye"}`} style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>

          {/* Stay Logged In */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <input
              type="checkbox"
              id="stayIn"
              checked={stayIn}
              onChange={(e) => setStayIn(e.target.checked)}
              style={{ accentColor: "#f8e396", width: 13, height: 13, cursor: "pointer" }}
            />
            <label
              htmlFor="stayIn"
              style={{ color: "#5a5a5a", fontSize: 12, cursor: "pointer", margin: 0, userSelect: "none" }}
            >
              Stay Logged In
            </label>
          </div>

          {/* Sign In */}
          <button type="submit" className="lg-btn" disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{
                  width: 13, height: 13,
                  border: "2px solid rgba(248,227,150,0.2)",
                  borderTop: "2px solid #f8e396",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                }} />
                Signing in...
              </span>
            ) : "SIGN IN"}
          </button>

        </form>
      </div>
    </div>
  );
}
