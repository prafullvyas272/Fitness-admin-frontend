import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const pad = (n) => String(n).padStart(2, "0");

export const isoToDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const dateToIso = (date) => {
  if (!date) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function GoldDatePicker({ value, onChange, placeholder = "mm/dd/yyyy", disabled, width = 150 }) {
  return (
    <>
      <style>{`
        .gold-datepicker-input {
          background: #111111 !important;
          border: 1px solid #1e1e1e !important;
          color: #cccccc !important;
          border-radius: 7px !important;
          padding: 6px 32px 6px 12px !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          width: 100%;
          display: block;
          box-sizing: border-box;
          cursor: pointer;
          vertical-align: top;
        }
        .gold-datepicker-input::placeholder { color: #555; }
        .gold-datepicker-input:focus { outline: none; border-color: rgba(248,227,150,0.4) !important; }
        .gold-datepicker-wrapper { display: block !important; width: 100%; }
        .react-datepicker-popper { z-index: 3000; }
        .react-datepicker { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 10px; font-family: inherit; }
        .react-datepicker__triangle { display: none; }
        .react-datepicker__header { background: #111111; border-bottom: 1px solid #1e1e1e; border-top-left-radius: 10px; border-top-right-radius: 10px; }
        .react-datepicker__current-month, .react-datepicker-year-header { color: #f8e396; font-weight: 700; }
        .react-datepicker__day-name { color: #888888; }
        .react-datepicker__day { color: #cccccc; }
        .react-datepicker__day:hover { background: rgba(248,227,150,0.15); border-radius: 6px; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background: #f8e396 !important; color: #111 !important; border-radius: 6px; font-weight: 700; }
        .react-datepicker__day--outside-month { color: #3a3a3a; }
        .react-datepicker__day--disabled { color: #333 !important; cursor: not-allowed; }
        .react-datepicker__navigation-icon::before { border-color: #f8e396; }
      `}</style>
      <div style={{ position: "relative", width, display: "flex", alignItems: "center" }}>
        <DatePicker
          selected={isoToDate(value)}
          onChange={(date) => onChange(dateToIso(date))}
          dateFormat="MM/dd/yyyy"
          placeholderText={placeholder}
          className="gold-datepicker-input"
          wrapperClassName="gold-datepicker-wrapper"
          popperPlacement="bottom-start"
          disabled={disabled}
          autoComplete="off"
        />
        <i className="fe fe-calendar" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#f8e396", fontSize: 13, pointerEvents: "none", lineHeight: 1 }} />
      </div>
    </>
  );
}
