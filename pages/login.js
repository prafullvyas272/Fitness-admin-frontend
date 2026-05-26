import { useState } from "react";
import { useRouter } from "next/router";

const G = {
  bg: "#0d0d0d", card: "#161616", gold: "#d4a017", goldLight: "#f5d76e",
  goldFaint: "rgba(212,160,23,0.08)", divider: "rgba(212,160,23,0.2)",
  text: "#f1f1f1", muted: "#888888", input: "#1e1e1e", error: "#f87171",
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://fitness-app-seven-beryl.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Login failed");
      const accessToken = data?.data?.access_token;
      if (!accessToken) throw new Error("Access token not received");
      localStorage.setItem("adminToken", accessToken);
      localStorage.setItem("refreshToken", data?.data?.refresh_token);
      localStorage.setItem("adminId", data?.data?.user?.id);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: G.bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .login-input { width: 100%; background: ${G.input} !important; border: 1px solid ${G.divider} !important;
          color: ${G.text} !important; padding: 12px 16px; border-radius: 10px; font-size: 14px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
        .login-input::placeholder { color: #444 !important; }
        .login-input:focus { border-color: ${G.gold} !important; box-shadow: 0 0 0 3px rgba(212,160,23,0.12) !important; }
        .login-btn { width: 100%; padding: 13px; border: none; border-radius: 10px; font-size: 15px;
          font-weight: 700; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
          background: linear-gradient(135deg, ${G.gold}, #b8860b);
          color: #111; box-shadow: 0 4px 20px rgba(212,160,23,0.35); }
        .login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(212,160,23,0.5); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .eye-btn { background: transparent; border: none; cursor: pointer; padding: 0 4px;
          color: ${G.muted}; display: flex; align-items: center; transition: color 0.15s; }
        .eye-btn:hover { color: ${G.goldLight}; }
      `}</style>

      {/* Background ambient glows */}
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(212,160,23,0.07) 0%, transparent 70%)",
        animation: "glow 4s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "15%", width: 300, height: 300,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(212,160,23,0.05) 0%, transparent 70%)",
        animation: "glow 4s ease-in-out infinite 2s", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        background: G.card, border: `1px solid ${G.divider}`, borderRadius: 20,
        padding: "48px 44px", width: "100%", maxWidth: 420,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,160,23,0.08)",
        animation: "fadeUp 0.5s ease forwards", position: "relative", zIndex: 1,
      }}>
        {/* Gold top accent line */}
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 2,
          background: `linear-gradient(90deg, transparent, ${G.gold}, transparent)`,
          borderRadius: "0 0 4px 4px",
        }} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1772011826/Upto_logo_1_l2ocqd.png"
            alt="Upto Logo"
            style={{ height: 48, filter: "brightness(1.1)" }}
          />
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ color: G.text, fontWeight: 700, fontSize: 24, margin: 0, marginBottom: 8 }}>
            Admin Login
          </h2>
          <p style={{ color: G.muted, fontSize: 13.5, margin: 0 }}>
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
            color: G.error, padding: "10px 14px", borderRadius: 10, fontSize: 13,
            marginBottom: 20, display: "flex", alignItems: "center", gap: 8,
          }}>
            <i className="fe fe-alert-circle" style={{ fontSize: 15 }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: G.muted, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#444", pointerEvents: "none" }}>
                <i className="fe fe-mail" style={{ fontSize: 15 }}></i>
              </span>
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ color: G.muted, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#444", pointerEvents: "none", zIndex: 1 }}>
                <i className="fe fe-lock" style={{ fontSize: 15 }}></i>
              </span>
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                style={{ paddingLeft: 42, paddingRight: 44 }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}
              >
                <i className={`fe fe-${showPass ? "eye-off" : "eye"}`} style={{ fontSize: 16 }}></i>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{
                  width: 18, height: 18, border: "2px solid rgba(17,17,17,0.3)",
                  borderTop: "2px solid #111", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "inline-block",
                }} />
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: "center", color: "#333", fontSize: 12, marginTop: 28, marginBottom: 0 }}>
          Gym Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
