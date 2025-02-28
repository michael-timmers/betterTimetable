"use client";

import React, { useState } from "react";

// Define the structure for user preferences data
interface PreferencesData {
  studyTimes: { [key: string]: string[] }; // Selected study times for each day
}

// Define the props for the Preferences component
interface PreferencesProps {
  preferences: PreferencesData;
  setPreferences: React.Dispatch<React.SetStateAction<PreferencesData>>;
  setTab: React.Dispatch<React.SetStateAction<"units" | "preferences" | "timetable">>;
}

const Preferences: React.FC<PreferencesProps> = ({
  preferences,
  setPreferences,
  setTab,
}) => {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Generate times from 8 AM to 9 PM (14 hours)
  const times = Array.from({ length: 14 }, (_, i) => {
    const hour24 = i + 8; // 8 to 21 inclusive
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12; // Convert to 12-hour format
    const period = hour24 < 12 || hour24 === 24 ? "AM" : "PM";
    const timeLabel = `${hour12} ${period}`; // No ":00" and no leading zero
    const timeValue = `${hour24}:00`; // For internal tracking
    return {
      label: timeLabel,
      value: timeValue,
    };
  });

  // Initialize studyTimes state with preferences.studyTimes or empty object
  const [studyTimes, setStudyTimes] = useState<{ [key: string]: string[] }>(
    preferences.studyTimes || {}
  );

  // Function to handle selection of a study time slot
  const handleTimeSelection = (day: string, timeValue: string) => {
    setStudyTimes((prev) => {
      const updatedTimes = { ...prev };
      if (!updatedTimes[day]) {
        updatedTimes[day] = [];
      }

      // Toggle selection of the time slot
      if (updatedTimes[day].includes(timeValue)) {
        updatedTimes[day] = updatedTimes[day].filter((t) => t !== timeValue); // Deselect if already selected
      } else {
        updatedTimes[day] = [...updatedTimes[day], timeValue]; // Select the time slot
      }

      return updatedTimes;
    });
  };

  // Function to handle saving the preferences and navigating to the timetable tab
  const handleSavePreferences = () => {
    setPreferences((prev) => ({
      ...prev,
      studyTimes, // Save the selected study times
    }));
    setTab("timetable"); // Navigate to the timetable tab
  };

  return (
    <>
      {/* Page Title */}
      <h2 className="text-3xl mb-4 text-white">Set Your Study Preferences</h2>

      {/* Graph-like UI for Day and Time Selection */}
      <div className="w-full overflow-x-auto">
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
              <div className="bg-gray-900 p-3 text-white text-center flex items-center justify-center">
                {label}
              </div>

              {/* Day Columns */}
              {daysOfWeek.map((day) => (
                <div
                  key={`${day}-${value}`}
                  className={`p-2 cursor-pointer ${
                    studyTimes[day]?.includes(value)
                      ? "bg-blue-600" // Highlight selected time slots
                      : "bg-gray-700 hover:bg-gray-600" // Default and hover styles
                  }`}
                  onClick={() => handleTimeSelection(day, value)}
                ></div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex space-x-4">
        {/* Back Button to return to the Units tab */}
        <button
          onClick={() => setTab("units")}
          className="px-6 py-2 text-white rounded-full bg-blue-600 hover:bg-blue-700"
        >
          Back
        </button>

        {/* Next Button to save preferences and proceed to the Timetable tab */}
        <button
          onClick={handleSavePreferences}
          className="px-6 py-2 text-white rounded-full bg-blue-600 hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </>
  );
};

export default Preferences;
