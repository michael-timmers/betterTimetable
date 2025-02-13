"use client";

import { useState, useEffect } from "react";
import { getCourses, addCourses, removeCourses } from "./getCourseData";
import { getTeachingPeriods } from "./getTeachingPeriods";
import Timetable from "./showTimetable";

const SearchTimetable = () => {
  // Establish the variables that require updating
  const [unitCode, setUnitCode] = useState("");
  const [courseList, setCourseList] = useState({}); // Keep it as an object to store course data by unitCode
  const [teachingPeriods, setTeachingPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null); // Track the selected unit code
  const [selectedActivity, setSelectedActivity] = useState("All"); // Track the selected activity (default to "All")
  const [selectedUnitCourses, setSelectedUnitCourses] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]); // To store unique activity types

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
        setSelectedUnit(formattedUnitCode); // Use capitalized unit code
        setAvailableActivities(extractUniqueActivities(data[formattedUnitCode].courses)); // Extract unique activities
        setSelectedActivity("All"); // Reset activity to "All" when new unit is selected
        setSelectedUnitCourses(data[formattedUnitCode]?.courses); // Filter courses based on "All" activity
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
      // Remove the unit from the courseList state
      const updatedCourseList = { ...courseList };
      delete updatedCourseList[unitCodeToRemove];
      setCourseList(updatedCourseList);
    } catch (error) {
      setError("Failed to remove unit");
    }
  };

  // Handle the click event on a unit bubble
  const handleUnitClick = (unit) => {
    setSelectedUnit(unit); // Update the selected unit code

    const fetchCourses = async () => {
      const courses = await getCourses();
      setCourseList(courses); // Update the courseList state with resolved data
    };
    fetchCourses(); // Call the async function inside the effect

    setAvailableActivities(extractUniqueActivities(courseList[unit]?.courses)); // Update activities for selected unit
    setSelectedActivity("All"); // Reset activity to "All" when unit is clicked
    setSelectedUnitCourses(courseList[unit]?.courses); // Filter courses for selected unit
  };

  // Extract unique activities from courses for the selected unit
  const extractUniqueActivities = (courses) => {
    const activities = courses?.map((course) => course.activity);
    return [...new Set(activities)]; // Return unique activities
  };

  // Extract unique activities across all units
  const extractUnitActivityCounts = () => {
    const activityCounts = {};

    // Loop through all units and count unique activity occurrences
    Object.keys(courseList).forEach((unitCode) => {
      courseList[unitCode].courses.forEach((course) => {
        const activityKey = `${unitCode}-${course.activity}`;
        activityCounts[activityKey] = (activityCounts[activityKey] || 0) + 1;
      });
    });

    return activityCounts;
  };

  // Get the total unique unit-activity combinations
  const unitActivityCounts = extractUnitActivityCounts();
  const totalUnitActivityCount = Object.keys(unitActivityCounts).length;

  // Handle activity selection (filtering courses based on selected activity)
  const handleActivityFilter = (activity) => {
    setSelectedActivity(activity); // Update selected activity type

    const fetchCourses = async () => {
      const courses = await getCourses();
      setCourseList(courses); // Update the courseList state with resolved data
    };

    fetchCourses(); // Call the async function inside the effect

    if (activity === "All") {
      // When "All" is selected, show all timeslots for the selected unit
      setSelectedUnitCourses(courseList[selectedUnit]?.courses); // Display all courses for the selected unit
    } else {
      // Filter courses by selected activity type (e.g., "TUT", "LEC")
      const filteredCourses = courseList[selectedUnit]?.courses.filter(
        (course) => course.activity === activity
      );
      setSelectedUnitCourses(filteredCourses); // Display filtered courses
    }

    setError(null); // Clear any error messages
  };

  console.log("Entries!!", courseList);

  return (
    <div className="min-h-screen flex flex-col items-center p-12 text-white">
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
        >
          <option value="">Teaching period</option>
          {/* Map through the teaching periods and create options */}
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
                className={`relative px-8 py-2 rounded-full flex items-center space-x-2 cursor-pointer ${
                  selectedUnit === unit
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 text-white"
                }`}
                onClick={() => handleUnitClick(unit)} // Handle bubble click event
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

      {/* Display the total number of activities across all units */}
      {totalUnitActivityCount > 0 && (
        <p className="text-m text-gray-300 mb-2">
          {`1 of ${totalUnitActivityCount} required activities selected`}
        </p>
      )}

      <div className="border-b border-gray-500 w-full my-4"></div>

      {/* Show details of selected unit */}
      {selectedUnit && (
        <>
          <h1 className="text-3xl font-bold mt-8 mb-4 text-center">
            {courseList[selectedUnit]?.unitName}
          </h1>
        </>
      )}

      <div className="flex space-x-4 mb-4">
        {availableActivities.length > 0 && (
          <>
            {/* "All" button for showing all timeslots */}
            <button
              onClick={() => handleActivityFilter("All")}
              className={`px-6 py-2 rounded-full ${
                selectedActivity === "All" ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              All
            </button>

            {/* Render activity buttons for each activity type */}
            {availableActivities.map((activity) => (
              <button
                key={activity}
                onClick={() => handleActivityFilter(activity)}
                className={`px-6 py-2 rounded-full ${
                  selectedActivity === activity ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                {activity}
              </button>
            ))}
          </>
        )}
      </div>

      <Timetable
        courses={selectedUnitCourses}
        unitCode={selectedUnit}
      /> 
    </div>
  );
};

export default SearchTimetable;