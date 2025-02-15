"use client";

import { useState, useEffect } from "react";
import { getCourses, addCourses, removeCourses } from "./getCourseData";
import { getTeachingPeriods } from "./getTeachingPeriods";
import Timetable from "./showTimetable";
import filterCourseList from "./allocationAlgorithm";


const SearchTimetable = () => {
  // Establish the variables that require updating
  const [unitCode, setUnitCode] = useState("");
  const [courseList, setCourseList] = useState({}); // Keep it as an object to store course data by unitCode
  const [teachingPeriods, setTeachingPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPeriodDisabled, setIsPeriodDisabled] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false); // To toggle between the sections

  // Reset variables when accessing the page initially
  useEffect(() => {
    // Reset everything when component mounts
    setCourseList({});
    setError(null);
    setLoading(false);
  }, []); // Empty dependency array ensures this effect runs only once when the component is mounted

  // Fetch the teaching periods from the given URL
  useEffect(() => {
    const fetchTeachingPeriods = async () => {
      const periods = await getTeachingPeriods();
      setTeachingPeriods(periods);
    };
    fetchTeachingPeriods();
  }, []);

  // Fetch courses and update courseList state
  useEffect(() => {
    const fetchCourses = async () => {
      const courses = await getCourses();
      setCourseList(courses); // Update the courseList state with resolved data
    };

    fetchCourses(); // Call the async function inside the effect
  }, []); // Runs only once when the component is mounted

  // Handle when searching for a new unit
  const handleSearch = async () => {
    if (!unitCode || !selectedPeriod) {
      setError("Please enter unit code and select a teaching period");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formattedUnitCode = unitCode.toUpperCase(); // Capitalize unit code

      // Fetch the latest courses dictionary after adding the new unit
      const data = await addCourses(formattedUnitCode, selectedPeriod);

      if (!data) {
        setError("No unit found");
      } else {
        // Update the courseList state with the new courses for the added unit code
        setCourseList(data);
        setIsPeriodDisabled(true);
      }
    } catch {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Handle removal of a unit code from the course list
  const handleRemoveUnit = async (unitCodeToRemove) => {
    try {
      await removeCourses(unitCodeToRemove);
      const updatedCourseList = { ...courseList };
      delete updatedCourseList[unitCodeToRemove];
      setCourseList(updatedCourseList);

      if (Object.keys(updatedCourseList).length === 0) {
        setIsPeriodDisabled(false);
        setSelectedPeriod("");
      }
    } catch (error) {
      setError("Failed to remove unit");
    }
  };

  console.log("Entries!!", courseList);
      

  return (
    <div className="min-h-screen flex flex-col items-center p-12 text-white">
      {!showTimetable ? (
        <>
          <h1 className="text-3xl mb-4">Generate Timetable</h1>

          {/* Search feature */}
          <div className="mb-6 flex items-center justify-center space-x-4">
            {/* Input field for unit code */}
            <input
              type="text"
              className="w-48 px-6 py-2 rounded-lg bg-gray-1200"
              placeholder="Enter unit code"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
            />

            {/* Dropdown menu for selecting teaching period */}
            <select
              className="w-48 px-6 py-3 rounded-lg bg-gray-1200"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              disabled={isPeriodDisabled}
            >
              <option value="">Teaching period</option>
              {teachingPeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.text}
                </option>
              ))}
            </select>

            {/* Search button that triggers the search action */}
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Error message for search feature */}
          {error && <p className="text-red-500 mb-6">{error}</p>}

          {/* Show unit codes added to courseList */}
          <div className="flex space-x-4 mb-6 flex-wrap">
            {/* Sort the unit codes in alphabetical order */}
            {Object.keys(courseList)
              .sort((a, b) => a.localeCompare(b)) // Sort unit codes alphabetically
              .map((unit) => (
                <div
                  key={unit}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`relative px-8 py-2 rounded-full flex items-center space-x-2 cursor-pointer bg-gray-600 text-white`}
                  >
                    <span className="mr-2">{unit.toUpperCase()}</span> {/* Move text to the left */}
                    <span
                      className="absolute right-2 text-gray-300 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUnit(unit); // Handle removing unit
                      }}
                    >
                      ✖
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <div className="border-b border-gray-500 w-full my-4"></div>

          {/* Generate button to show timetable */}
          <button
            onClick={() => {
              if (Object.keys(courseList).length === 0) {
                setError("Add Unit to generate timetable");
              } else {
                setShowTimetable(true);
              }
            }}
            className={`px-6 py-2 text-white rounded-full mt-4 ${
              Object.keys(courseList).length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-blue-1000 hover:bg-blue-1100"
            }`}
            disabled={Object.keys(courseList).length === 0} // Disable button when no units are selected
          >
            {Object.keys(courseList).length === 0
              ? "Add Unit to generate timetable"
              : "Generate Timetable"}
          </button>

        </>
      ) : (
        <>
          <div className="flex items-center w-full mb-4">
            <button
              onClick={() => setShowTimetable(false)}
              className="px-6 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
            >
              Back
            </button>
            <h1 className="text-3xl font-bold mx-auto">Your Timetable</h1>
          </div>

          <div className="border-b border-gray-500 w-full my-4"></div>

          <Timetable courses={filterCourseList(courseList)} />

           {/* Display the course list in JSON format */}
           <div className="mt-6 w-full bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl mb-2">Updated Course List (JSON Format):</h2>
            <pre className="text-sm text-gray-300">{JSON.stringify(courseList, null, 2)}</pre>
          </div>

        </>
      )}
    </div>
  );
};

export default SearchTimetable;