"use client";

import { useState } from "react";
import Units from "./unitsTab";
import Preferences from "./preferencesTab";
import TimetableView from "./timetableTab";

// Define the structure for a Course
interface Course {
  id: string;
  unitCode: string;     // Code of the unit/course (e.g., "CAB202")
  unitName: string;     // Full name of the unit
  classType: string;    // Type of class (e.g., "Lecture", "Tutorial")
  activity: string;     // Specific activity (e.g., "LEC", "TUT")
  day: string;          // Day of the week (e.g., "MON", "TUE")
  time: string;         // Time slot (e.g., "9AM - 11AM")
  room: string;         // Room location
  teachingStaff: string;// Instructor's name
}

// Define the structure for CourseData, which includes the unit name and its courses
interface CourseData {
  unitName: string;     // Full name of the unit
  courses: Course[];    // List of courses under this unit
}

// Define the structure for user preferences
interface PreferencesData {
  studyTimes: { [key: string]: string[] }; // Study times for each day
}

// Main component that manages the application tabs and state
export default function ManageTabs() {

  // State to store the list of courses added by the user
  const [courseList, setCourseList] = useState<{ [key: string]: CourseData }>({});

  // State to store user preferences
  const [preferences, setPreferences] = useState<PreferencesData>({
    studyTimes: {},  // Initially empty
  });

  // State to manage the currently active tab ("units", "preferences", or "timetable")
  const [tab, setTab] = useState<"units" | "preferences" | "timetable">("units");

  // State to handle error messages
  const [error, setError] = useState<string | null>(null);

  // Define a color palette to assign colors to units dynamically
  const colorPalette = [
    "bg-blue-1000",
    "bg-red-1000",
    "bg-green-1000",
    "bg-yellow-1000",
    "bg-purple-1000",
    "bg-orange-1000",
    "bg-pink-1000",
  ];

  // Object to map each unit code to a specific color for consistency
  const unitColors: { [unitCode: string]: string } = {};
  let colorIndex = 0;

  // Assign colors to each unit code
  Object.keys(courseList).forEach((unit) => {
    if (unit.toUpperCase() === "CAB202") {
      // Special case: Assign "bg-brown-1000" to "CAB202"
      unitColors[unit] = "bg-brown-1000";
    } else {
      // Assign colors from the palette in order
      if (!unitColors[unit]) {
        unitColors[unit] = colorPalette[colorIndex % colorPalette.length];
        colorIndex++;
      }
    }
  });

  return (
    // Main container div with styling
    <div className="min-h-screen flex flex-col items-center p-12 text-white">
      {/* Render the Units component when on the "units" tab */}
      {tab === "units" && (
        <Units
          courseList={courseList}
          setCourseList={setCourseList}
          setTab={setTab}
          setError={setError}
          error={error}
          unitColors={unitColors}
        />
      )}

      {/* Render the Preferences component when on the "preferences" tab */}
      {tab === "preferences" && (
        <Preferences
          preferences={preferences}      // Pass the entire preferences object
          setPreferences={setPreferences}
          setTab={setTab}
        />
      )}

      {/* Render the TimetableView component when on the "timetable" tab */}
      {tab === "timetable" && (
        <TimetableView
          courseList={courseList}
          preferences={preferences}     // Pass the entire preferences object
          setTab={setTab}
          unitColors={unitColors}
        />
      )}
    </div>
  );
}
