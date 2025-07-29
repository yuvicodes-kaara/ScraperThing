// components/DatePicker.jsx
import React, { useState } from "react";
import { format } from "date-fns";

const DatePicker = ({ date, onDateChange, placeholder }) => {
  const [month, setMonth] = useState(date || new Date());
  const [isOpen, setIsOpen] = useState(false);

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 49 + i).filter(
    (year) => year <= new Date().getFullYear(),
  );
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handleYearChange = (year) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(year));
    setMonth(newDate);
  };

  const handleMonthChange = (monthIndex) => {
    const newDate = new Date(month);
    newDate.setMonth(parseInt(monthIndex));
    setMonth(newDate);
  };

  const handleDateSelect = (selectedDate) => {
    if (selectedDate <= new Date()) {
      onDateChange(selectedDate);
      setIsOpen(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days = [];
    const today = new Date();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
      const isSelected = date && date.toDateString() === currentDate.toDateString();
      const isDisabled = currentDate > today;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(currentDate)}
          disabled={isDisabled}
          className={`
            p-2 text-sm rounded hover:bg-gray-600 transition-colors
            ${isSelected ? 'bg-blue-600 text-white' : 'text-white'}
            ${isDisabled ? 'text-gray-500 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-start text-left font-normal bg-gray-700 border border-gray-700 text-white hover:bg-gray-600 px-3 py-2 rounded-md"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        {date ? format(date, "PPP") : <span className="text-gray-400">{placeholder}</span>}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-gray-700 border border-gray-700 rounded-md shadow-lg">
          <div className="p-3 border-b border-gray-600">
            <div className="flex items-center justify-between space-x-2">
              <select
                value={month.getMonth()}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="bg-gray-700 border border-gray-700 text-white px-2 py-1 rounded text-sm"
              >
                {months.map((monthName, index) => (
                  <option key={monthName} value={index}>
                    {monthName}
                  </option>
                ))}
              </select>
              <select
                value={month.getFullYear()}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-gray-700 border border-gray-700 text-white px-2 py-1 rounded text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="p-2 text-xs text-gray-300 text-center font-medium">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;