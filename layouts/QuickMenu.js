import { useRouter } from "next/router";
import { Fragment } from "react";

const QuickMenu = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("adminId");
    router.push("/login");
  };

  return (
    <Fragment>
      <style>{`
        .qm-bell {
          background: none;
          border: none;
          color: #F8E396;
          cursor: pointer;
          padding: 6px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .qm-logout {
          background: none;
          border: 1px solid rgba(248, 227, 150, 0.25);
          color: #F8E396;
          cursor: pointer;
          padding: 7px 16px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.3px;
          transition: all 0.2s;
          font-family: inherit;
        }
        .qm-logout:hover { border-color: #F8E396; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        <button className="qm-bell">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#F8E396" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        <button className="qm-logout" onClick={handleLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#F8E396" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>

      </div>
    </Fragment>
  );
};

export default QuickMenu;
