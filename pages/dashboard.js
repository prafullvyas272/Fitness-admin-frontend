import { useEffect, useState } from "react";
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

const CARD_META = {
  totalMembers:   { label: "Total Members",   icon: "fe-users",       accent: "#f8e396" },
  activeMembers:  { label: "Active Members",  icon: "fe-user-check",  accent: "#4ade80" },
  totalTrainers:  { label: "Total Trainers",  icon: "fe-briefcase",   accent: "#f8e396" },
  monthlyRevenue: { label: "Monthly Revenue", icon: "fe-dollar-sign", accent: "#4ade80" },
};

const DONUT_COLORS = ["#f8e396", "#faf2b8", "#c9b54a", "#8a7a2c", "#4ade80", "#3a7a4a", "#1e1e1e"];

const formatCurrency = (value, currency) => {
  const n = Number(value) || 0;
  return `${currency ? currency + " " : ""}${n.toLocaleString()}`;
};

const formatChange = (card) => {
  if (card.changePercent !== undefined && card.changePercent !== null) return `${card.changePercent}%`;
  if (card.change !== undefined && card.change !== null) return `${card.change}`;
  return null;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}/${day}/${d.getFullYear()}`;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [revenuePeriod, setRevenuePeriod] = useState("monthly");
  const [revenueStartDate, setRevenueStartDate] = useState("");
  const [revenueEndDate, setRevenueEndDate] = useState("");
  const [revenueChartLoading, setRevenueChartLoading] = useState(false);
  const [revenueChartError, setRevenueChartError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(
          "https://fitness-app-seven-beryl.vercel.app/api/admin/dashboard/stats?period=monthly",
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.data);
        } else {
          setError(data.message || "Failed to load dashboard stats");
        }
      } catch (err) {
        setError("Failed to load dashboard stats: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fetchRevenueChart = async (period, startDate, endDate) => {
    setRevenueChartLoading(true);
    setRevenueChartError("");
    try {
      const token = localStorage.getItem("adminToken");
      let url = `https://fitness-app-seven-beryl.vercel.app/api/admin/dashboard/stats?period=${period}`;
      if (period === "custom" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.revenueChart) {
        setStats((prev) => (prev ? { ...prev, revenueChart: data.data.revenueChart } : data.data));
      } else {
        setRevenueChartError(data.message || "Failed to load revenue data for this period");
      }
    } catch (err) {
      setRevenueChartError("Failed to load revenue data: " + err.message);
    } finally {
      setRevenueChartLoading(false);
    }
  };

  const handleRevenuePeriodChange = (period) => {
    setRevenuePeriod(period);
    setRevenueChartError("");
    if (period !== "custom") {
      fetchRevenueChart(period, "", "");
    }
  };

  const handleApplyCustomRange = () => {
    if (!revenueStartDate || !revenueEndDate) return;
    if (revenueStartDate > revenueEndDate) {
      setRevenueChartError("Start date must be before end date");
      return;
    }
    fetchRevenueChart("custom", revenueStartDate, revenueEndDate);
  };

  const cardsData = stats?.cards || {};
  const cardEntries = Object.keys(CARD_META)
    .filter((key) => cardsData[key])
    .map((key) => {
      const card = cardsData[key];
      return {
        key,
        label: CARD_META[key].label,
        icon: CARD_META[key].icon,
        accent: CARD_META[key].accent,
        value: key === "monthlyRevenue" ? formatCurrency(card.value, card.currency) : (card.value ?? 0).toLocaleString(),
        changeLabel: formatChange(card),
        up: card.trend !== "down",
        progress: Math.min(Math.abs(card.changePercent ?? card.change ?? 0), 100),
      };
    });

  const revenueChart = stats?.revenueChart || { categories: [], series: [] };
  const membershipSplit = stats?.membershipSplit || { total: 0, breakdown: [] };
  const recentMembers = stats?.recentMembers || [];
  const totalRevenue = stats?.totalRevenue;
  const quickStats = stats?.quickStats || {};

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
      categories: revenueChart.categories,
      axisBorder: { show: false },
      axisTicks:  { show: false },
      labels: { style: { colors: "#888888", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#888888", fontSize: "12px" },
        formatter: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`),
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (v) => v.toLocaleString() },
    },
    markers: { size: 4, colors: ["#f8e396"], strokeColors: "#0a0a0a", strokeWidth: 2 },
  };

  const chartSeries = [{ name: "Revenue", data: revenueChart.series }];

  const donutOptions = {
    chart: { type: "donut", background: "transparent" },
    theme: { mode: "dark" },
    colors: DONUT_COLORS,
    labels: membershipSplit.breakdown.map((b) => b.label),
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
              formatter: () => `${membershipSplit.total}`,
            },
          },
        },
      },
    },
    tooltip: { theme: "dark" },
  };

  const donutSeries = membershipSplit.breakdown.map((b) => b.count);

  if (loading) {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: G.muted, fontSize: 15 }}>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#ff6b6b", fontSize: 15 }}>{error}</span>
      </div>
    );
  }

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
        {cardEntries.map((stat) => (
          <div
            key={stat.key}
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
              {stat.changeLabel !== null && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                  background: stat.up ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  color: stat.up ? "#4ade80" : "#f87171",
                }}>
                  {stat.up ? "▲" : "▼"} {stat.changeLabel}
                </span>
              )}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: 0 }}>
                Revenue Overview
              </p>
              <h5 style={{ color: G.text, fontWeight: 700, margin: "4px 0 0" }}>
                {revenueChart.categories.length > 0
                  ? `${revenueChart.categories[0]} – ${revenueChart.categories[revenueChart.categories.length - 1]}`
                  : "Revenue trend"}
              </h5>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["monthly", "yearly", "custom"].map((p) => (
                <button
                  key={p}
                  onClick={() => handleRevenuePeriodChange(p)}
                  style={{
                    background: revenuePeriod === p ? G.gold : "transparent",
                    border: `1px solid ${revenuePeriod === p ? G.gold : G.divider}`,
                    color: revenuePeriod === p ? "#000" : G.goldLight,
                    fontWeight: 600, borderRadius: 8, padding: "6px 14px",
                    fontSize: 12, cursor: "pointer",
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {revenuePeriod === "custom" && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
              <input
                type="date" lang="en-US" className="vw-inp"
                style={{ padding: "5px 10px", background: "#111111", border: `1px solid ${G.divider}`, color: "#cccccc", borderRadius: 7 }}
                value={revenueStartDate}
                onChange={(e) => setRevenueStartDate(e.target.value)}
              />
              <input
                type="date" lang="en-US" className="vw-inp"
                style={{ padding: "5px 10px", background: "#111111", border: `1px solid ${G.divider}`, color: "#cccccc", borderRadius: 7 }}
                value={revenueEndDate}
                onChange={(e) => setRevenueEndDate(e.target.value)}
              />
              <button
                disabled={!revenueStartDate || !revenueEndDate}
                onClick={handleApplyCustomRange}
                style={{
                  background: G.gold, border: "none", color: "#000", fontWeight: 700,
                  borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 12,
                  opacity: !revenueStartDate || !revenueEndDate ? 0.5 : 1,
                }}
              >
                Apply
              </button>
            </div>
          )}
          <div style={{ height: 2, background: `linear-gradient(90deg, ${G.gold}, transparent)`, borderRadius: 4, marginBottom: 8 }} />
          {revenueChartError ? (
            <div style={{ height: 270, display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b", fontSize: 13, textAlign: "center", padding: "0 20px" }}>
              {revenueChartError}
            </div>
          ) : revenueChartLoading ? (
            <div style={{ height: 270, display: "flex", alignItems: "center", justifyContent: "center", color: G.muted, fontSize: 13 }}>
              Loading revenue data...
            </div>
          ) : (
            <Chart options={chartOptions} series={chartSeries} type="area" height={270} />
          )}
        </div>

        {/* Membership Donut */}
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "22px 24px" }}>
          <p style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: 0 }}>
            Membership Split
          </p>
          <h5 style={{ color: G.text, fontWeight: 700, margin: "4px 0 12px" }}>{membershipSplit.total} Total</h5>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, transparent)`, borderRadius: 4, marginBottom: 8 }} />
          {donutSeries.length > 0 ? (
            <Chart options={donutOptions} series={donutSeries} type="donut" height={240} />
          ) : (
            <p style={{ color: G.muted, textAlign: "center", padding: "40px 0" }}>No membership data</p>
          )}
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
              {recentMembers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4" style={{ background: G.card, color: G.muted }}>No recent members</td></tr>
              ) : recentMembers.map((m) => (
                <tr key={m.id} className="tr-dash">
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>
                    {m.plan ? (
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: G.goldFaint, color: G.goldLight, border: `1px solid ${G.divider}`,
                      }}>
                        {m.plan}
                      </span>
                    ) : (
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: "rgba(255,255,255,0.05)", color: G.muted, border: "1px solid rgba(255,255,255,0.08)",
                      }}>
                        No Plan
                      </span>
                    )}
                  </td>
                  <td style={{ color: G.muted }}>{formatDate(m.enrolledAt)}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                      background: m.isActive ? "#4ade80" : "#f87171",
                      boxShadow: `0 0 6px ${m.isActive ? "rgba(74,222,128,0.5)" : "rgba(248,113,113,0.5)"}`,
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
              <h2 style={{ color: G.goldLight, fontWeight: 800, margin: "6px 0 4px" }}>
                {totalRevenue ? formatCurrency(totalRevenue.value, totalRevenue.currency) : "—"}
              </h2>
              {totalRevenue && (
                <span style={{
                  fontSize: 12, fontWeight: 600, color: "#4ade80",
                  background: "rgba(34,197,94,0.12)", padding: "3px 10px", borderRadius: 20,
                }}>
                  ▲ +{totalRevenue.changePercent}% {totalRevenue.label}
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {[
            { label: "Sessions Today",    value: quickStats.sessionsToday ?? 0,   icon: "fe-calendar" },
            { label: "Pending Requests",  value: quickStats.pendingRequests ?? 0, icon: "fe-inbox"    },
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
