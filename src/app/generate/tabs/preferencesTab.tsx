"use client";

import React, { useState, useEffect } from "react";

// Define the structure for user preferences data
interface PreferencesData {
  start: string; // Preferred start time (e.g., "9AM")
  end: string; // Preferred end time (e.g., "5PM")
  days: string[]; // Preferred days of the week (e.g., ["MON", "TUE", "WED"])
  classesPerDay: number; // Maximum number of classes per day
  backToBack: boolean; // Preference for back-to-back classes
  studyTimes: { [key: string]: string[] }; // Selected study times for each day
}

// Define the props for the Preferences component
interface PreferencesProps {
  preferences: PreferencesData; // Current preferences data
  setPreferences: React.Dispatch<React.SetStateAction<PreferencesData>>; // Function to update preferences
  setTab: React.Dispatch<React.SetStateAction<"units" | "preferences" | "timetable">>; // Function to change the current tab
}

const Preferences: React.FC<PreferencesProps> = ({
  preferences,
  setPreferences,
  setTab,
}) => {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`); // Times from 8:00 AM to 7:00 PM

  // Initialize studyTimes state with preferences.studyTimes or empty object
  const [studyTimes, setStudyTimes] = useState<{ [key: string]: string[] }>(
    preferences.studyTimes || {}
  );

  // Log studyTimes to check initial state
  useEffect(() => {
    console.log("Initial studyTimes: ", studyTimes);
  }, [studyTimes]);

  // Function to handle selection of a study time slot
  const handleTimeSelection = (day: string, time: string) => {
    setStudyTimes((prev) => {
      const updatedTimes = { ...prev };
      if (!updatedTimes[day]) {
        updatedTimes[day] = [];
      }

      // Toggle selection of the time slot
      if (updatedTimes[day].includes(time)) {
        updatedTimes[day] = updatedTimes[day].filter((t) => t !== time); // Deselect if already selected
      } else {
        updatedTimes[day] = [...updatedTimes[day], time]; // Select the time slot and maintain previous selections
      }

      console.log(`Updated studyTimes for ${day}: `, updatedTimes);

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
        <div className="grid grid-cols-6 gap-0.5">
          {/* Empty top-left corner */}
          <div className="bg-gray-800 p-2"></div>

          {/* Day Headers */}
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="bg-gray-800 p-2 text-white text-center font-semibold"
            >
              {day}
            </div>
          ))}

          {/* Time Rows */}
          {times.map((time) => (
            <React.Fragment key={time}>
              {/* Time Label */}
              <div className="bg-gray-800 p-2 text-white text-center flex items-center justify-center">
                {time}
              </div>

              {/* Day Columns */}
              {daysOfWeek.map((day) => (
                <div
                  key={`${day}-${time}`}
                  className={`p-2 cursor-pointer ${
                    studyTimes[day]?.includes(time)
                      ? "bg-indigo-600" // Highlight selected time slots
                      : "bg-gray-700 hover:bg-gray-600" // Default and hover styles
                  }`}
                  onClick={() => handleTimeSelection(day, time)}
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
