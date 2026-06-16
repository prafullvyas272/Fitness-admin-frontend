import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const G = {
  bg:         "#0a0a0a",
  card:       "#0d0d0d",
  cardBorder: "1px solid #1e1e1e",
  gold:       "#f8e396",
  goldLight:  "#f8e396",
  goldFaint:  "rgba(248,227,150,0.07)",
  text:       "#ffffff",
  muted:      "#888888",
  divider:    "#1e1e1e",
};

const STATS = [
  { label: "Total Members",   value: "120",     icon: "fe-users",       change: "+8%",  up: true,  progress: 75, accent: "#f8e396" },
  { label: "Active Members",  value: "95",      icon: "fe-user-check",  change: "+5%",  up: true,  progress: 80, accent: "#4ade80" },
  { label: "Total Trainers",  value: "12",      icon: "fe-briefcase",   change: "+2",   up: true,  progress: 60, accent: "#f8e396" },
  { label: "Monthly Revenue", value: "$30,569", icon: "fe-dollar-sign", change: "+12%", up: true,  progress: 65, accent: "#4ade80" },
];

const RECENT = [
  { name: "Arjun Sharma",   plan: "Premium",  date: "26 May 2025", status: true  },
  { name: "Priya Verma",    plan: "Basic",    date: "25 May 2025", status: true  },
  { name: "Rohan Mehta",    plan: "Premium",  date: "24 May 2025", status: false },
  { name: "Sneha Kapoor",   plan: "Basic",    date: "23 May 2025", status: true  },
  { name: "Vikram Nair",    plan: "Premium",  date: "22 May 2025", status: false },
];

export default function Dashboard() {
  const chartOptions = {
    chart: {
      id: "gym-revenue",
      toolbar: { show: false },
      background: "transparent",
      foreColor: "#888888",
    },
    theme: { mode: "dark" },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#f8e396"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 100],
        colorStops: [
          { offset: 0,   color: "#f8e396", opacity: 0.25 },
          { offset: 100, color: "#f8e396", opacity: 0.02 },
        ],
      },
    },
    grid: {
      borderColor: "#1e1e1e",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      axisBorder: { show: false },
      axisTicks:  { show: false },
      labels: { style: { colors: "#888888", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#888888", fontSize: "12px" },
        formatter: (v) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (v) => `$${v.toLocaleString()}` },
    },
    markers: { size: 4, colors: ["#f8e396"], strokeColors: "#0a0a0a", strokeWidth: 2 },
  };

  const chartSeries = [{ name: "Revenue", data: [2000, 3500, 4000, 3000, 5000, 6000] }];

  const donutOptions = {
    chart: { type: "donut", background: "transparent" },
    theme: { mode: "dark" },
    colors: ["#f8e396", "#faf2b8", "#c9b54a", "#1e1e1e"],
    labels: ["Premium", "Basic", "Trial", "Expired"],
    legend: { position: "bottom", labels: { colors: "#888888" } },
    dataLabels: { enabled: false },
    stroke: { colors: ["#0d0d0d"], width: 2 },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Members",
              color: "#888888",
              fontSize: "12px",
              formatter: () => "120",
            },
          },
        },
      },
    },
    tooltip: { theme: "dark" },
  };

  const donutSeries = [52, 38, 20, 10];

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: "28px" }}>
      <style>{`
        .progress-gold { height: 4px !important; background: rgba(248,227,150,0.1) !important; border-radius: 4px !important; margin-top: 12px; }
        .progress-gold .progress-bar { background: #f8e396 !important; border-radius: 4px !important; }
        .tr-dash td { background: ${G.card} !important; border-bottom: 1px solid ${G.divider} !important; color: ${G.text} !important; padding: 12px 16px !important; font-size: 13px; }
        .tr-dash:hover td { background: #111111 !important; }
        .th-dash { background: #111111 !important; color: rgba(248,227,150,0.6) !important; border-bottom: 1px solid ${G.divider} !important; font-size: 10px !important; letter-spacing: 1.2px !important; padding: 12px 16px !important; font-weight: 700 !important; }
        .apexcharts-tooltip { border: 1px solid #2a2a2a !important; }
      `}</style>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>Dashboard</h3>
        <small style={{ color: G.muted }}>Welcome back — here&apos;s what&apos;s happening today</small>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
        {STATS.map((stat, i) => (
          <div
            key={i}
            style={{
              background: G.card,
              border: G.cardBorder,
              borderLeft: `3px solid ${stat.accent}`,
              borderRadius: 12,
              padding: "22px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle gold corner glow */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 80, height: 80,
              background: "radial-gradient(circle at top right, rgba(248,227,150,0.08), transparent 70%)",
              borderRadius: "0 12px 0 0",
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: G.goldFaint, border: `1px solid ${G.divider}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={`fe ${stat.icon}`} style={{ color: G.gold, fontSize: 16 }}></i>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                background: stat.up ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                color: stat.up ? "#4ade80" : "#f87171",
              }}>
                {stat.up ? "▲" : "▼"} {stat.change}
              </span>
            </div>

            <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: 0 }}>
              {stat.label}
            </p>
            <h3 style={{ color: G.text, fontWeight: 700, fontSize: 26, margin: "6px 0 0" }}>{stat.value}</h3>

            {/* Gold progress bar */}
            <div className="progress progress-gold">
              <div className="progress-bar" style={{ width: `${stat.progress}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* CHART ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 24 }}>

        {/* Revenue Chart */}
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: 0 }}>
                Revenue Overview
              </p>
              <h5 style={{ color: G.text, fontWeight: 700, margin: "4px 0 0" }}>Jan – Jun 2025</h5>
            </div>
            <div style={{
              background: G.goldFaint, border: `1px solid ${G.divider}`,
              borderRadius: 8, padding: "6px 14px",
              color: G.goldLight, fontSize: 12, fontWeight: 600,
            }}>
              Monthly
            </div>
          </div>
          <div style={{ height: 2, background: `linear-gradient(90deg, ${G.gold}, transparent)`, borderRadius: 4, marginBottom: 8 }} />
          <Chart options={chartOptions} series={chartSeries} type="area" height={270} />
        </div>

        {/* Membership Donut */}
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "22px 24px" }}>
          <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: 0 }}>
            Membership Split
          </p>
          <h5 style={{ color: G.text, fontWeight: 700, margin: "4px 0 12px" }}>120 Total</h5>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, transparent)`, borderRadius: 4, marginBottom: 8 }} />
          <Chart options={donutOptions} series={donutSeries} type="donut" height={240} />
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Recent Members Table */}
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 0" }}>
            <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: 0 }}>
              Recent Members
            </p>
            <h5 style={{ color: G.text, fontWeight: 700, margin: "4px 0 14px" }}>Latest Enrollments</h5>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, transparent)`, borderRadius: 4, marginBottom: 0 }} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="th-dash">NAME</th>
                <th className="th-dash">PLAN</th>
                <th className="th-dash">DATE</th>
                <th className="th-dash text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map((m, i) => (
                <tr key={i} className="tr-dash">
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: m.plan === "Premium" ? G.goldFaint : "rgba(255,255,255,0.05)",
                      color: m.plan === "Premium" ? G.goldLight : G.muted,
                      border: `1px solid ${m.plan === "Premium" ? G.divider : "rgba(255,255,255,0.08)"}`,
                    }}>
                      {m.plan}
                    </span>
                  </td>
                  <td style={{ color: G.muted }}>{m.date}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                      background: m.status ? "#4ade80" : "#f87171",
                      boxShadow: `0 0 6px ${m.status ? "rgba(74,222,128,0.5)" : "rgba(248,113,113,0.5)"}`,
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Revenue Summary Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Total Revenue */}
          <div style={{
            background: `linear-gradient(135deg, #0d0d00, #0d0d0d)`,
            border: G.cardBorder,
            borderRadius: 12,
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            flex: 1,
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at top left, rgba(248,227,150,0.07), transparent 65%)",
            }} />
            <div style={{ position: "relative" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: G.gold,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14, boxShadow: "0 6px 16px rgba(248,227,150,0.2)",
              }}>
                <i className="fe fe-trending-up" style={{ color: "#000", fontSize: 18 }}></i>
              </div>
              <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: 0 }}>
                Total Revenue
              </p>
              <h2 style={{ color: G.goldLight, fontWeight: 800, margin: "6px 0 4px" }}>$30,569</h2>
              <span style={{
                fontSize: 12, fontWeight: 600, color: "#4ade80",
                background: "rgba(34,197,94,0.12)", padding: "3px 10px", borderRadius: 20,
              }}>
                ▲ +12% this month
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          {[
            { label: "Sessions Today",    value: "24",  icon: "fe-calendar" },
            { label: "Pending Requests",  value: "7",   icon: "fe-inbox"    },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: G.card, border: G.cardBorder, borderRadius: 12,
                padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: G.goldFaint, border: `1px solid ${G.divider}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fe ${item.icon}`} style={{ color: G.gold, fontSize: 15 }}></i>
                </div>
                <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>{item.label}</p>
              </div>
              <span style={{ color: G.text, fontWeight: 700, fontSize: 20 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
