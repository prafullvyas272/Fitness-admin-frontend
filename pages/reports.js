import { useState } from "react";

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
  input:      "#111111",
  rowHover:   "#111111",
};

const STATS = [
  { label: "Open Tickets",  value: "24",    icon: "fe-headphones",    tag: "+15% vs last week",        tagColor: G.muted,   iconBg: G.goldFaint,         iconColor: G.gold },
  { label: "Resolved",      value: "156",   icon: "fe-check-circle",  tag: "Total lifetime",            tagColor: G.muted,   iconBg: G.goldFaint,         iconColor: G.gold },
  { label: "High Priority", value: "08",    icon: "fe-alert-triangle",tag: "Critical Attention Required", tagColor: "#f87171", iconBg: "rgba(239,68,68,0.15)", iconColor: "#f87171", valueColor: "#f87171" },
  { label: "Total Logs",    value: "1,204", icon: "fe-clipboard",     tag: "Active Database",           tagColor: G.muted,   iconBg: G.goldFaint,         iconColor: G.gold },
];

const REPORTS = [
  { id: "TR-4029", trainer: "Marcus Thorne", reporter: "L. Kensington", category: "CONDUCT",     priority: "CRITICAL", status: "OPEN",     date: "Oct 24, 2024" },
  { id: "TR-3991", trainer: "Elena Vance",   reporter: "S. Hashimoto",  category: "TECHNICAL",   priority: "ROUTINE",  status: "PENDING",  date: "Oct 23, 2024" },
  { id: "TR-3985", trainer: "Dorian Gray",   reporter: "Admin Sync",    category: "PERFORMANCE", priority: "HIGH",     status: "RESOLVED", date: "Oct 21, 2024" },
];

const ACTIVITY = [
  { text: "System automatically upgraded TR-4029 to Critical.", time: "2 minutes ago" },
  { text: "Lead Admin Cmdr. Vael assigned to TR-3991.",          time: "14 minutes ago" },
  { text: "New report submitted for Trainer Marcus Thorne.",     time: "1 hour ago" },
];

function PriorityBadge({ priority }) {
  const map = {
    CRITICAL: "#f87171",
    ROUTINE:  G.gold,
    HIGH:     "#cccccc",
  };
  const color = map[priority] || G.muted;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    OPEN:     { bg: "rgba(239,68,68,0.15)",  color: "#f87171" },
    PENDING:  { bg: "rgba(255,255,255,0.07)", color: "#cccccc" },
    RESOLVED: { bg: "rgba(34,197,94,0.12)",  color: "#4ade80" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.05)", color: "#aaaaaa", border: `1px solid ${G.divider}` }}>
      {category}
    </span>
  );
}

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("All Reports");

  const filtered = REPORTS.filter((r) =>
    r.trainer.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: G.bg, minHeight: "100vh", padding: "28px" }}>
      <style>{`
        .rp-tr td { background: ${G.card} !important; border-bottom: 1px solid #141414 !important; color: ${G.text} !important; padding: 14px 16px !important; font-size: 12px !important; vertical-align: middle; font-weight: 700 !important; }
        .rp-tr:hover td { background: ${G.rowHover} !important; }
        .rp-th { background: #111111 !important; color: rgba(248,227,150,0.6) !important; border-bottom: 1px solid ${G.divider} !important; font-size: 10px !important; letter-spacing: 1.2px !important; padding: 12px 16px !important; font-weight: 700 !important; }
        .rp-inp { background: ${G.input} !important; border: 1px solid ${G.divider} !important; color: #cccccc !important; border-radius: 7px !important; }
        .rp-inp::placeholder { color: #4a4a4a !important; }
        .rp-inp:focus { border-color: rgba(248,227,150,0.25) !important; outline: none !important; }
        .rp-avatar { width: 30px; height: 30px; border-radius: 50%; background: rgba(248,227,150,0.07); border: 1px solid ${G.divider}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: ${G.goldLight}; flex-shrink: 0; }
        .progress-rp { height: 5px !important; background: rgba(255,255,255,0.06) !important; border-radius: 4px !important; }
        .progress-rp .progress-bar { background: ${G.gold} !important; border-radius: 4px !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: G.text, fontWeight: 700, marginBottom: 4 }}>Support Reports</h3>
        <small style={{ color: G.muted }}>Manage and resolve user support requests across the Aethelgard platform.</small>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
        {STATS.map((stat, i) => (
          <div key={i} style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "20px 22px" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8,
              background: stat.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <i className={`fe ${stat.icon}`} style={{ color: stat.iconColor, fontSize: 16 }}></i>
            </div>
            <p style={{ color: G.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08rem", margin: "0 0 6px" }}>
              {stat.label}
            </p>
            <h2 style={{ color: stat.valueColor || G.text, fontWeight: 800, margin: "0 0 10px", fontSize: 28 }}>{stat.value}</h2>
            <span style={{
              fontSize: 11, fontWeight: 600, color: stat.tagColor,
              background: stat.tagColor === "#f87171" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
              padding: "3px 10px", borderRadius: 20, display: "inline-block",
            }}>
              {stat.tag}
            </span>
          </div>
        ))}
      </div>

      {/* TABLE CARD */}
      <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>

        {/* TOOLBAR */}
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 240 }}>
            <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
              <i className="fe fe-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 13 }} />
              <input
                className="rp-inp"
                placeholder="Filter by Trainer or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "9px 12px 9px 34px", fontSize: 13 }}
              />
            </div>
            <button style={{ width: 38, height: 38, borderRadius: 7, background: "#111111", border: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <i className="fe fe-sliders" style={{ color: G.goldLight, fontSize: 14 }} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", background: "#111111", border: `1px solid ${G.divider}`, borderRadius: 7, padding: 3, gap: 2 }}>
              {["All Reports", "Priority", "Archive"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "6px 14px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: "none", background: view === v ? G.gold : "transparent",
                    color: view === v ? "#000" : G.muted, whiteSpace: "nowrap",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="rp-th">TICKET ID</th>
                <th className="rp-th">TRAINER</th>
                <th className="rp-th">REPORTER</th>
                <th className="rp-th">CATEGORY</th>
                <th className="rp-th">PRIORITY</th>
                <th className="rp-th">STATUS</th>
                <th className="rp-th">DATE</th>
                <th className="rp-th" style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="rp-tr">
                  <td colSpan={8} style={{ textAlign: "center", padding: 40, color: G.muted }}>No reports found</td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="rp-tr">
                  <td style={{ color: G.goldLight }}>{r.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="rp-avatar">{r.trainer.charAt(0)}</div>
                      {r.trainer}
                    </div>
                  </td>
                  <td style={{ color: G.muted }}>{r.reporter}</td>
                  <td><CategoryBadge category={r.category} /></td>
                  <td><PriorityBadge priority={r.priority} /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ color: G.muted }}>{r.date}</td>
                  <td style={{ textAlign: "right" }}>
                    <button style={{ width: 30, height: 30, borderRadius: 6, cursor: "pointer", background: "transparent", border: `1px solid ${G.divider}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="fe fe-more-vertical" style={{ color: G.muted, fontSize: 13 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${G.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: G.muted, fontSize: 13 }}>Showing 1-25 of 1,204 records</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {["1", "2", "3", "…", "48", "›"].map((label, i) => {
              const isActive = label === "1";
              return (
                <button key={i}
                  style={{
                    width: 30, height: 30, borderRadius: 6, fontSize: 12, cursor: "pointer",
                    fontWeight: isActive ? 700 : 400, border: "1px solid #2a2a2a",
                    background: isActive ? G.gold : "transparent",
                    color: isActive ? "#000" : "#888888",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* RECENT ACTIVITY */}
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h5 style={{ color: G.text, fontWeight: 700, margin: 0 }}>Recent Activity Stream</h5>
            <span style={{ color: G.gold, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>REAL-TIME SYNC</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.gold, marginTop: 6, flexShrink: 0 }} />
                <div>
                  <p style={{ color: G.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{a.text}</p>
                  <span style={{ color: G.muted, fontSize: 12 }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM HEALTH */}
        <div style={{ background: G.card, border: G.cardBorder, borderRadius: 12, padding: "20px 24px" }}>
          <h5 style={{ color: G.text, fontWeight: 700, margin: "0 0 18px" }}>System Health</h5>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: G.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Database Latency</span>
              <span style={{ color: G.text, fontSize: 12, fontWeight: 700 }}>12ms</span>
            </div>
            <div className="progress progress-rp"><div className="progress-bar" style={{ width: "20%" }} /></div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: G.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ticket Load</span>
              <span style={{ color: G.text, fontSize: 12, fontWeight: 700 }}>Optimal</span>
            </div>
            <div className="progress progress-rp"><div className="progress-bar" style={{ width: "55%" }} /></div>
          </div>

          <p style={{ color: G.muted, fontSize: 12, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
            All auxiliary systems are operating within nominal parameters for Sector 7 Admin Control.
          </p>
        </div>
      </div>
    </div>
  );
}
