import React, { useState, useEffect } from "react";

interface DateOfBirthPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const calculateAge = (day: string, month: string, year: string): number => {
  const today = new Date();
  const dob = new Date(`${year}-${month}-${day}`);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const DateOfBirthPicker: React.FC<DateOfBirthPickerProps> = ({ value, onChange, error }) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) =>
    String(currentYear - 5 - i)
  );

  // Sync state with initial value if valid format DD-MM-YYYY
  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        setDay(parts[0]);
        setMonth(parts[1]);
        setYear(parts[2]);
      }
    }
  }, [value]);

  useEffect(() => {
    if (day && month && year) {
      onChange(`${day}-${month}-${year}`);
    }
  }, [day, month, year, onChange]);

  return (
    <div className="dob-wrapper">
      <label>Date of Birth</label>
      <div className="dob-selects">

        {/* Day */}
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="bg-[#0d0d1f] text-white border border-white/10 rounded-lg p-2.5 flex-1 focus:outline-none focus:border-purple-500"
        >
          <option value="">DD</option>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-[#0d0d1f] text-white border border-white/10 rounded-lg p-2.5 flex-1 focus:outline-none focus:border-purple-500"
        >
          <option value="">MM</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="bg-[#0d0d1f] text-white border border-white/10 rounded-lg p-2.5 flex-1 focus:outline-none focus:border-purple-500"
        >
          <option value="">YYYY</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

      </div>

      {/* Error message */}
      {error && (
        <span className="field-error text-red-500 text-xs mt-1">{error}</span>
      )}

      {/* Age display */}
      {day && month && year && (
        <span className="age-display text-cyan-400 text-xs mt-1">
          Age: {calculateAge(day, month, year)} years old
        </span>
      )}
    </div>
  );
};

export default DateOfBirthPicker;
