import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";

const IMAGES = [
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltJTIwd29ya291dHxlbnwwfHwwfHx8MA%3D%3D",
  "https://media.istockphoto.com/id/2027278927/photo/young-athletic-woman-exercising-with-barbell-during-sports-training-in-a-gym.jpg?s=612x612&w=0&k=20&c=ifFL7Mqc8NwTj25PAx4ONy1OOQZvc1S_kVOofsbLgFw=",
  "https://www.puregym.com/media/w1kffo3p/pure-gym-day-16238.jpg?quality=80",
];

const N = IMAGES.length;

// Compute delta in range [-floor(N/2), ..., +floor(N/2)]
const getDelta = (i, center) => {
  const raw = ((i - center) % N + N) % N;
  return raw > Math.floor(N / 2) ? raw - N : raw;
};

// CSS style for each image based on its role
const slotStyle = (delta, isPreRight) => {
  const TRANSITION = "left 0.7s ease-in-out, width 0.7s ease-in-out, transform 0.7s ease-in-out, filter 0.7s ease-in-out, opacity 0.7s ease-in-out";

  const base = {
    position: "absolute",
    top: 0,
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    willChange: "transform, left, width, filter",
  };

  // Off-screen right — no transition, snapped before advance begins
  if (isPreRight) {
    return {
      ...base,
      left: "115%",
      width: "22%",
      opacity: 0,
      transform: "perspective(800px) rotateY(-25deg) scale(0.7)",
      filter: "brightness(0.3)",
      zIndex: 0,
      transition: "none",
    };
  }

  if (delta === 0) {
    return {
      ...base,
      left: "22%",
      width: "56%",
      transform: "perspective(800px) rotateY(0deg) scale(1)",
      filter: "brightness(1)",
      zIndex: 2,
      transition: TRANSITION,
    };
  }

  if (delta === 1) {
    // RIGHT panel
    return {
      ...base,
      left: "78%",
      width: "22%",
      transform: "perspective(800px) rotateY(-25deg) scale(0.85)",
      filter: "brightness(0.5)",
      zIndex: 1,
      transition: TRANSITION,
    };
  }

  if (delta === -1) {
    // LEFT panel
    return {
      ...base,
      left: "0%",
      width: "22%",
      transform: "perspective(800px) rotateY(25deg) scale(0.85)",
      filter: "brightness(0.5)",
      zIndex: 1,
      transition: TRANSITION,
    };
  }

  // Any other delta: hidden off-screen left
  return {
    ...base,
    left: "-30%",
    width: "22%",
    opacity: 0,
    transform: "perspective(800px) rotateY(25deg) scale(0.7)",
    filter: "brightness(0.2)",
    zIndex: 0,
    transition: TRANSITION,
  };
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [stayIn, setStayIn]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  // Carousel state
  const [center, setCenter]         = useState(0);
  const [preRightIdx, setPreRightIdx] = useState(null); // image snapped off-screen-right before transition
  const centerRef = useRef(0);
  const busyRef   = useRef(false);

  const advance = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    const c = centerRef.current;
    // The current LEFT image must jump to off-screen-right before the transition
    const leftIdx = ((c - 1) % N + N) % N;

    // Phase 1: snap that image to pre-right (no transition)
    setPreRightIdx(leftIdx);

    // Phase 2: two RAF frames so browser paints the snap first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Now enable transitions and advance center
        const next = (c + 1) % N;
        centerRef.current = next;
        setCenter(next);
        setPreRightIdx(null); // let it animate from its pre-right snap into right position

        // Phase 3: unlock after transition completes
        setTimeout(() => { busyRef.current = false; }, 750);
      });
    });
  }, []);

  // Auto-advance every 3.5 s
  useEffect(() => {
    const t = setInterval(advance, 3500);
    return () => clearInterval(t);
  }, [advance]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("https://fitness-app-seven-beryl.vercel.app/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
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

  return (
    <div style={{
      width:      "100vw",
      height:     "100vh",
      overflow:   "hidden",
      background: "#000000",
      position:   "relative",
      fontFamily: "Montserrat, Arial, sans-serif",
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

      {/* ── 3D COVERFLOW ── */}
      <div style={{
        position: "absolute",
        inset:    0,
        overflow: "hidden",
      }}>
        {IMAGES.map((src, i) => {
          const delta      = getDelta(i, center);
          const isPreRight = i === preRightIdx;
          return (
            <div
              key={i}
              style={{
                ...slotStyle(delta, isPreRight),
                backgroundImage: `url(${src})`,
              }}
            />
          );
        })}
      </div>

      {/* ── LOGIN CARD ── fixed center, does not move */}
      <div style={{
        position:        "absolute",
        top:             "50%",
        left:            "50%",
        transform:       "translate(-50%, -50%)",
        width:           286,
        background:      "rgba(26,26,26,0.92)",
        borderRadius:    10,
        padding:         "28px 24px 26px",
        zIndex:          10,
        backdropFilter:  "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border:          "1px solid rgba(255,255,255,0.06)",
        boxShadow:       "0 24px 80px rgba(0,0,0,0.7)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1781515780/Layer_x0020_1_1_klnh94.png"
            alt="UPT"
            style={{ height: 40, objectFit: "contain" }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:   "rgba(248,113,113,0.08)",
            border:       "1px solid rgba(248,113,113,0.28)",
            color:        "#f87171",
            padding:      "8px 12px",
            borderRadius: 6,
            fontSize:     12,
            marginBottom: 14,
            lineHeight:   1.5,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div style={{ marginBottom: 13 }}>
            <label style={{
              color:          "#f8e396",
              fontSize:       10,
              fontWeight:     700,
              letterSpacing:  "0.12em",
              textTransform:  "uppercase",
              display:        "block",
              marginBottom:   7,
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
              color:         "#f8e396",
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display:       "block",
              marginBottom:  7,
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
                  width:        13,
                  height:       13,
                  border:       "2px solid rgba(248,227,150,0.2)",
                  borderTop:    "2px solid #f8e396",
                  borderRadius: "50%",
                  animation:    "spin 0.7s linear infinite",
                  display:      "inline-block",
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
