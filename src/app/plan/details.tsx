"use client";

import React, { useState, useEffect } from "react";
import checkUnit from "../generate/download_data/checkUnits";
import uploadUnit from "../generate/download_data/uploadUnit";
import downloadUnit from "../generate/download_data/downloadUnits";

// -----------------------------------------------------------------------
// Data Type Definitions
// -----------------------------------------------------------------------

// An individual course record.
interface Course {
  id: string;
  unitCode: string;       // e.g., "CAB202"
  unitName: string;       // Full name of the unit
  classType: string;      // E.g., "Lecture" or "Tutorial" – used for grouping
  activity: string;       // Specific activity code (e.g., "LEC", "TUT")
  day: string;            // E.g., "MON", "TUE"
  time: string;           // E.g., "11AM - 1PM"
  room: string;           // Room number or location
  teachingStaff: string;  // Name of the teaching staff
}

// CourseData is used per unit.
interface CourseData {
  unitName: string;
  courses: Course[];
}

// -----------------------------------------------------------------------
// Details Component (Client Side)
// -----------------------------------------------------------------------

const Details = () => {
  // Local state to manage course data and input.
  const [courseList, setCourseList] = useState<{ [key: string]: CourseData }>({});
  const [unitCode, setUnitCode] = useState("");
  const [teachingPeriods, setTeachingPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [validPeriods, setValidPeriods] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch teaching periods from the API when the component mounts.
  useEffect(() => {
    const fetchTeachingPeriods = async () => {
      try {
        const response = await fetch("/api/teaching-data");
        const data = await response.json();

        if (!data || data.error) {
          setError("Failed to fetch teaching periods");
        } else {
          setTeachingPeriods(data);
        }
      } catch {
        setError("Failed to fetch teaching periods");
      }
    };

    fetchTeachingPeriods();
  }, []);

  // -----------------------------------------------------------------------
  // Unit Adding Logic
  // -----------------------------------------------------------------------

  // Searches for valid teaching periods for the entered unit code.
  const handleSearch = async () => {
    if (!unitCode) {
      setError("Please enter a unit code");
      return;
    }
    if (courseList[unitCode.toUpperCase()]) {
      setError("Unit already added");
      return;
    }

    setLoading(true);
    setError(null);
    setValidPeriods([]);

    try {
      const formattedUnitCode = unitCode.toUpperCase();
      let validResults: any[] = [];

      // Check every teaching period for valid course data.
      for (let period of teachingPeriods) {
        const response = await fetch(
          `/api/course-data?unitCode=${formattedUnitCode}&teachingPeriod=${period.value}`
        );
        const data = await response.json();

        if (Object.keys(data).length === 0) continue;
        if (data && !data.error) {
          validResults.push({ text: period.text, value: period.value });
        }
      }

      setValidPeriods(validResults);

      if (validResults.length === 0) {
        setError("No valid periods found for this unit.");
      } else {
        setShowDialog(true);
      }
    } catch (err) {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Adds a unit using the selected teaching period.
  const handleAddUnit = async () => {
    if (selectedPeriod) {
      const formattedUnitCode = unitCode.toUpperCase();

      try {
        const dbResponse = await checkUnit(formattedUnitCode);
        if (dbResponse.exists) {
          const courseResponse = await downloadUnit(formattedUnitCode);

          if (courseResponse.success) {
            const unitData: CourseData = {
              unitName: courseResponse.unitName,
              courses: courseResponse.courseData,
            };

            if (unitData.unitName && unitData.courses) {
              setCourseList((prev) => ({
                ...prev,
                [formattedUnitCode]: unitData,
              }));
            } else {
              setError("Invalid unit data received.");
            }
          }

          setShowDialog(false);
          setUnitCode("");
          setSelectedPeriod("");
        } else {
          const response = await fetch(
            `/api/course-data?unitCode=${formattedUnitCode}&teachingPeriod=${selectedPeriod}`
          );
          const data = await response.json();
          const unitData = data[formattedUnitCode];

          setCourseList((prev) => ({
            ...prev,
            [formattedUnitCode]: unitData,
          }));

          // Save the added unit data in the background.
          uploadUnit(formattedUnitCode, unitData.courses, unitData.unitName).catch((err) => {
            console.error("Failed to add unit to the database:", err);
          });

          setShowDialog(false);
          setUnitCode("");
          setSelectedPeriod("");
        }
      } catch {
        setError("Failed to add the unit.");
      }
    } else {
      setError("Please select a valid teaching period.");
    }
  };

  // Removes a unit from the course list.
  const handleRemoveUnit = (unitCodeToRemove: string) => {
    setCourseList((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
  };

  // -----------------------------------------------------------------------
  // Sidebar Data: Grouping timeslots for each unit by activity.
  // For every unit in courseList the code groups the courses by their classType
  // and builds an array of timeslots (using day + time).
  // -----------------------------------------------------------------------
  const sidebarData = Object.keys(courseList).reduce((acc, unit) => {
    const courses = courseList[unit].courses;
    const groups = courses.reduce((groupAcc: Record<string, string[]>, course) => {
      const timeslot = `${course.day} ${course.time}`;
      if (!groupAcc[course.activity]) {
        groupAcc[course.activity] = [];
      }
      groupAcc[course.activity].push(timeslot);
      return groupAcc;
    }, {});
    acc[unit] = groups;
    return acc;
  }, {} as Record<string, Record<string, string[]>>);

  // -----------------------------------------------------------------------
  // Render the Component
  // -----------------------------------------------------------------------
  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar: List of timeslots for each added unit */}
      <aside className="md:w-1/4 p-4 bg-gray-100 border-r border-gray-300">
        <h2 className="text-2xl font-bold mb-4">Timeslots</h2>
        {Object.keys(sidebarData)
          .sort()
          .map((unit) => (
            <div key={unit} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{unit}</h3>
              {Object.keys(sidebarData[unit]).map((activity) => (
                <div key={activity} className="ml-4 mb-2">
                  <p className="font-bold">{activity.toUpperCase()}:</p>
                  <ul className="ml-4 list-disc">
                    {sidebarData[unit][activity].map((slot, idx) => (
                      <li key={idx}>{slot}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
      </aside>

      {/* Main Content: Unit management UI */}
      <main className="md:w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-6">Add Your Units</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Input for entering unit code and a button to trigger search */}
        <div className="flex items-center space-x-4 mb-6">
          <input
            type="text"
            className="px-4 py-2 border rounded"
            placeholder="Enter unit code"
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Searching..." : "Add"}
          </button>
        </div>

        {/* Dialog for selecting a teaching period if valid periods are found */}
        {showDialog && validPeriods.length > 0 && (
          <div className="mb-6 p-4 border rounded">
            <p className="mb-2">Select a Teaching Period:</p>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option value="">Select period</option>
              {validPeriods.map((period, idx) => (
                <option key={idx} value={period.value}>
                  {period.text}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddUnit}
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              Confirm
            </button>
          </div>
        )}

        {/* Display the added units as badges.
            Clicking the "✖" removes the unit from the list.
        */}
        <div className="flex flex-wrap gap-4">
          {Object.keys(courseList)
            .sort()
            .map((unit) => (
              <div
                key={unit}
                className="relative px-6 py-4 bg-blue-600 text-white rounded flex items-center"
              >
                <span className="text-lg">{unit}</span>
                <span
                  className="absolute top-0 right-0 m-1 cursor-pointer"
                  onClick={() => handleRemoveUnit(unit)}
                >
                  ✖
                </span>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Details;
