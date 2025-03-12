"use client";

import React, { useState, useEffect } from "react";
import checkUnit from "../generate/download_data/checkUnits";
import uploadUnit from "../generate/download_data/uploadUnit";
import downloadUnit from "../generate/download_data/downloadUnits";
import TimetableView from "./timetableView"; // Adjust the import path as needed

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

// -----------------------------------------------------------------------
// Data type definitions
// -----------------------------------------------------------------------

export interface Course {
  id: string;
  unitCode: string;
  unitName: string;
  classType: string;
  activity: string;
  day: string;
  time: string;
  room: string;
  teachingStaff: string;
}

interface CourseData {
  unitName: string;
  courses: Course[];
}

// -----------------------------------------------------------------------
// Details Component
// -----------------------------------------------------------------------
const Details = () => {
  const [courseList, setCourseList] = useState<{ [key: string]: CourseData }>({});
  const [unitCode, setUnitCode] = useState("");
  const [teachingPeriods, setTeachingPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [validPeriods, setValidPeriods] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Record<string, Record<string, Course>>>({});
  const [unitColors, setUnitColors] = useState<{ [unitCode: string]: string }>({});
  
  // Track which units' timeslots are visible
  const [visibleUnits, setVisibleUnits] = useState<{ [unitCode: string]: boolean }>({});

  // Fetch teaching periods on component mount
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

  // Handlers for adding a unit
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

  const handleAddUnit = async () => {
    if (selectedPeriod) {
      const formattedUnitCode = unitCode.toUpperCase();
      try {
        const dbResponse = await checkUnit(formattedUnitCode);
        let unitData: CourseData;
        if (dbResponse.exists) {
          const courseResponse = await downloadUnit(formattedUnitCode);
          if (courseResponse.success) {
            unitData = {
              unitName: courseResponse.unitName,
              courses: courseResponse.courseData,
            };
          } else {
            setError("Invalid unit data received.");
            setShowDialog(false);
            setUnitCode("");
            setSelectedPeriod("");
            return;
          }
        } else {
          const response = await fetch(
            `/api/course-data?unitCode=${formattedUnitCode}&teachingPeriod=${selectedPeriod}`
          );
          const data = await response.json();
          unitData = data[formattedUnitCode];
          uploadUnit(formattedUnitCode, unitData.courses, unitData.unitName).catch((err) => {
            console.error("Failed to add unit to the database:", err);
          });
        }
        setCourseList((prev) => ({
          ...prev,
          [formattedUnitCode]: unitData,
        }));

        // Assign a color from the color palette to the new unit
        const colorIndex = Object.keys(courseList).length % colorPalette.length;
        setUnitColors((prev) => ({
          ...prev,
          [formattedUnitCode]: colorPalette[colorIndex],
        }));

        // Set the unit's timeslots to be visible by default
        setVisibleUnits((prev) => ({
          ...prev,
          [formattedUnitCode]: true,
        }));

        setShowDialog(false);
        setUnitCode("");
        setSelectedPeriod("");
      } catch {
        setError("Failed to add the unit.");
      }
    } else {
      setError("Please select a valid teaching period.");
    }
  };

  const handleRemoveUnit = (unitCodeToRemove: string) => {
    setCourseList((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
    setSelectedCourses((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
    setUnitColors((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
    setVisibleUnits((prev) => {
      const updated = { ...prev };
      delete updated[unitCodeToRemove];
      return updated;
    });
  };

  // Toggle the visibility of timeslots for a given unit
  const toggleUnitVisibility = (unitCode: string) => {
    setVisibleUnits((prev) => ({
      ...prev,
      [unitCode]: !prev[unitCode],
    }));
  };

  // Group courses by unit and activity
  const sidebarData: Record<string, Record<string, Course[]>> = Object.keys(courseList).reduce(
    (acc, unit) => {
      const courses = courseList[unit].courses;
      const groups = courses.reduce((groupAcc: Record<string, Course[]>, course) => {
        if (!groupAcc[course.activity]) {
          groupAcc[course.activity] = [];
        }
        groupAcc[course.activity].push(course);
        return groupAcc;
      }, {} as Record<string, Course[]>);
      acc[unit] = groups;
      return acc;
    },
    {} as Record<string, Record<string, Course[]>>
  );

  const selectedCourseList = Object.keys(selectedCourses).reduce(
    (acc, unit) => {
      const selectedForUnit = Object.values(selectedCourses[unit]);
      if (selectedForUnit.length > 0) {
        acc[unit] = { unitName: courseList[unit].unitName, courses: selectedForUnit };
      }
      return acc;
    },
    {} as { [key: string]: { unitName: string; courses: Course[] } }
  );

  // Render the unit/timeslot selection UI
  return (
    <div className="flex flex-col md:flex-row">
      <section className="w-full md:w-1/4 p-6 bg-gray-100 border-r border-gray-300">
        <h2 className="text-2xl font-bold mb-4">Add Unit</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-6">
          <input
            type="text"
            className="px-4 py-2 border rounded w-full"
            placeholder="Enter unit code"
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
          />
        </div>

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {showDialog && validPeriods.length > 0 && (
          <div className="mt-4 p-4 border rounded bg-white">
            <p className="mb-2">Select a Teaching Period:</p>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-2 py-1 border rounded w-full"
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
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded w-full"
            >
              Confirm
            </button>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Timeslots</h2>
        <div>
          {Object.keys(sidebarData)
            .sort()
            .map((unit) => (
              <div key={unit} className="mb-6">
                <h3
                  className={`text-xl font-semibold ${unitColors[unit]} cursor-pointer`}
                  onClick={() => toggleUnitVisibility(unit)} // Toggle on click
                >
                  {unit}{" "}
                  <span
                    className="cursor-pointer text-red-500"
                    onClick={() => handleRemoveUnit(unit)}
                  >
                    ✖
                  </span>
                </h3>
                {visibleUnits[unit] && (
                  <div>
                    {Object.keys(sidebarData[unit]).map((activity) => (
                      <div key={activity} className="ml-4 mb-4">
                        <p className="font-bold">{activity.toUpperCase()}:</p>
                        <ul className="ml-4 list-disc">
                          {sidebarData[unit][activity].map((course) => {
                            const isSelected =
                              selectedCourses[unit] &&
                              selectedCourses[unit][activity] &&
                              selectedCourses[unit][activity].id === course.id;
                            return (
                              <li
                                key={course.id}
                                onClick={() => {
                                  setSelectedCourses((prev) => ({
                                    ...prev,
                                    [unit]: {
                                      ...prev[unit],
                                      [activity]: course,
                                    },
                                  }));
                                }}
                                className={`cursor-pointer ${isSelected ? "font-bold underline text-blue-600" : ""}`}
                              >
                                {course.day} {course.time}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>

      <section className="w-full md:w-3/4 p-6">
        <TimetableView
          courseList={selectedCourseList}
          unitColors={unitColors}
          preferences={{ studyTimes: [] }} // Pass any preference settings here
        />
      </section>
    </div>
  );
};

export default Details;
