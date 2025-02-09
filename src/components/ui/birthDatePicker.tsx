"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface BirthDatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  error?: string;
}

export function BirthDatePicker({
  value,
  onChange,
  error,
}: BirthDatePickerProps) {
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      value: month.toString().padStart(2, "0"),
      label: new Date(2000, i, 1).toLocaleString("en-US", { month: "long" }),
    };
  });

  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  useEffect(() => {
    if (value && !isInitialized) {
      // Backend formatından (YYYY-MM-DD) parçalara ayırma
      const [year, month, day] = value.split("-");
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDay(day);
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const handleDayChange = (day: string) => {
    const numDay = parseInt(day);
    if (numDay > 0 && numDay <= getDaysInMonth(selectedYear, selectedMonth)) {
      const paddedDay = numDay.toString().padStart(2, "0");
      setSelectedDay(paddedDay);
      if (selectedYear && selectedMonth) {
        // Backend formatında gönderme (YYYY-MM-DD)
        onChange?.(`${selectedYear}-${selectedMonth}-${paddedDay}`);
      }
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const maxDays = getDaysInMonth(selectedYear, month);
    if (selectedDay && parseInt(selectedDay) > maxDays) {
      setSelectedDay(maxDays.toString().padStart(2, "0"));
    }
    if (selectedYear && selectedDay) {
      // Backend formatında gönderme (YYYY-MM-DD)
      onChange?.(`${selectedYear}-${month}-${selectedDay}`);
    }
  };

  const handleYearChange = (year: string) => {
    if (year === "") {
      setSelectedYear("");
      return;
    }

    const numYear = parseInt(year);
    if (!isNaN(numYear)) {
      setSelectedYear(year);

      if (selectedMonth && selectedDay && year.length === 4) {
        const maxDays = getDaysInMonth(year, selectedMonth);
        const validDay =
          parseInt(selectedDay) > maxDays
            ? maxDays.toString().padStart(2, "0")
            : selectedDay;

        // Backend formatında gönderme (YYYY-MM-DD)
        onChange?.(`${year}-${selectedMonth}-${validDay}`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-0 h-10">
        <input
          type="number"
          min="1"
          max={getDaysInMonth(selectedYear, selectedMonth)}
          value={selectedDay ? parseInt(selectedDay) : ""}
          onChange={(e) => handleDayChange(e.target.value)}
          placeholder="DD"
          className="w-[80px] border border-border rounded-l-sm p-2 text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[140px] h-full py-2.5 rounded-none border-l-0 border-r-0 shadow-none focus:ring-0">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={selectedYear}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            handleYearChange(value);
          }}
          placeholder="YYYY"
          className="w-[100px] border border-border rounded-r-sm p-2 text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
