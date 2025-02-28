// preferences.tsx

"use client";

import React from "react";
import { TimetableViewProps } from "../algorithms/interfaces";

const Preferences: React.FC<TimetableViewProps> = ({
  preferences,
  setPreferences,
  setTab,
  // You can omit `courseList` and `unitColors` if they are not used in this component
}) => {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Generate times from 8:00 AM to 8:30 PM in 30-minute intervals (26 slots)
  const times = Array.from({ length: 26 }, (_, i) => {
    const totalMinutes = 8 * 60 + i * 30; // Start at 8:00 AM
    const hour24 = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const period = hour24 >= 12 ? "PM" : "AM";
    const minuteStr = minute === 0 ? "00" : "30";
    const timeLabel = minute === 0 ? `${hour12} ${period}` : ""; // Label on the hour
    const timeValue = `${hour24}:${minuteStr}`; // Internal value

    return {
      label: timeLabel,
      value: timeValue,
    };
  });

  // Function to handle selection of a study time slot
  const handleTimeSelection = (day: string, timeValue: string) => {
    setPreferences((prevPreferences) => {
      const updatedStudyTimes = { ...prevPreferences.studyTimes };
  
      // Check if the day already exists in studyTimes
      if (!updatedStudyTimes[day]) {
        updatedStudyTimes[day] = [];
      }
  
      // Toggle selection of the time slot
      if (updatedStudyTimes[day].includes(timeValue)) {
        updatedStudyTimes[day] = updatedStudyTimes[day].filter((t) => t !== timeValue);
  
        // If no times remain for the day, delete the day from studyTimes
        if (updatedStudyTimes[day].length === 0) {
          delete updatedStudyTimes[day];
        }
      } else {
        updatedStudyTimes[day] = [...updatedStudyTimes[day], timeValue];
      }
  
      // Only sort the array if it exists and is not empty
      if (updatedStudyTimes[day] && updatedStudyTimes[day].length > 0) {
        updatedStudyTimes[day].sort((a, b) => {
          const [hourA, minuteA] = a.split(":").map(Number);
          const [hourB, minuteB] = b.split(":").map(Number);
          const totalMinutesA = hourA * 60 + minuteA;
          const totalMinutesB = hourB * 60 + minuteB;
          return totalMinutesA - totalMinutesB;
        });
      }
  
      // Return the updated preferences
      return { ...prevPreferences, studyTimes: updatedStudyTimes };
    });
  };
  

  // Determine if at least one timeslot is selected
  const hasSelectedTimeslots = Object.values(preferences.studyTimes).some(
    (times) => times.length > 0
  );

  return (
    <>
      {/* Navigation and Title */}
      <div className="mt-6 flex items-center justify-between w-full">
        {/* Back Button */}
        <button
          onClick={() => setTab("units")}
          className="px-6 py-2 text-white rounded-full bg-blue-600 hover:bg-blue-700"
        >
          Back
        </button>

        {/* Page Title */}
        <h2 className="text-3xl text-white text-center flex-grow">
          Set Your Study Preferences
        </h2>

        {/* Next Button */}
        <button
          onClick={() => setTab("timetable")}
          className={`px-6 py-2 text-white rounded-full ${
            hasSelectedTimeslots
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-500 cursor-not-allowed"
          }`}
          disabled={!hasSelectedTimeslots}
        >
          Next
        </button>
      </div>

      {/* Time Selection Grid */}
      <div className="w-full overflow-x-auto mt-6">
        <div className="grid grid-cols-[0.5fr_repeat(5,1fr)] gap-0.5">
          {/* Empty top-left corner */}
          <div className="bg-gray-900 p-2"></div>

          {/* Day Headers */}
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="bg-gray-900 p-4 text-white text-center font-semibold"
            >
              {day}
            </div>
          ))}

          {/* Time Rows */}
          {times.map(({ label, value }) => (
            <React.Fragment key={value}>
              {/* Time Label */}
              <div
                className="bg-gray-900 text-white text-center flex items-center justify-center"
                style={{ height: "30px" }}
              >
                {label}
              </div>

              {/* Day Columns */}
              {daysOfWeek.map((day) => (
                <div
                  key={`${day}-${value}`}
                  className={`p-2 cursor-pointer ${
                    preferences.studyTimes[day]?.includes(value)
                      ? "bg-blue-600" // Highlight selected time slots
                      : "bg-gray-700 hover:bg-gray-600" // Default and hover styles
                  }`}
                  style={{ height: "30px" }}
                  onClick={() => handleTimeSelection(day, value)}
                ></div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default Preferences;
