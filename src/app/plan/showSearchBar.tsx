"use client";

import { useState, useEffect } from "react";
import { getCourses } from "./getCourses";
import { getTeachingPeriods } from "./getTeachingPeriods";
import Timetable from "./showTimetable";
import { manageSlots } from "./getLockedTimes";

const SearchTimetable = () => {
  const [unitCode, setUnitCode] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [teachingPeriods, setTeachingPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("All");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lockedSlots, setLockedSlots] = useState([]);
  const [showLockedOnly, setShowLockedOnly] = useState(false);

  // Run once when the component mounts, to reset states
  useEffect(() => {
    // Reset everything when component mounts
    setLockedSlots([]);
    setUnits([]);
    setSelectedUnit(null);
    setSelectedActivity("All");
    setFilteredCourses([]);
    setActivityTypes([]);
    setError(null);
    setLoading(false);
  }, []); // Empty dependency array ensures this effect runs only once when the component is mounted

  useEffect(() => {
    const fetchTeachingPeriods = async () => {
      const periods = await getTeachingPeriods();
      setTeachingPeriods(periods);
    };
    fetchTeachingPeriods();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      setLockedSlots(manageSlots("get", null, selectedUnit.code, []));
    }
  }, [selectedUnit]);

  const handleSearch = async () => {
    if (!unitCode || !selectedPeriod) {
      setError("Please enter unit code and select a teaching period");
      return;
    }

    if (units.some((unit) => unit.code === unitCode.toUpperCase())) {
      setError("This unit code has already been added.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { unitName, coursesList } = await getCourses(unitCode, selectedPeriod);
      if (coursesList.length === 0) {
        setError("No unit found");
      } else {
        const newUnit = { code: unitCode.toUpperCase(), name: unitName, courses: coursesList };
        setUnits((prev) => [...prev, newUnit]);
        setSelectedUnit(newUnit);
        setActivityTypes([...new Set(coursesList.map((c) => c.activity))]);
        setFilteredCourses(coursesList);
      }
    } catch {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setActivityTypes([...new Set(unit.courses.map((c) => c.activity))]);
    setFilteredCourses(unit.courses);
    setSelectedActivity("All");
    setShowLockedOnly(false); // Reset locked slots when changing unit
    setError(null); // Hide error message
  };

  const handleRemoveUnit = (code) => {
    // Remove the unit from the units list
    setUnits(units.filter((unit) => unit.code !== code));

    // Remove all locked slots associated with this unit code from the lockedSlots state
    setLockedSlots((prevLockedSlots) =>
      prevLockedSlots.filter((slot) => slot.unitCode !== code) // Filter out the slots of the removed unit code
    );

    // If the selected unit is the one being removed, reset the selected unit state
    if (selectedUnit?.code === code) {
      setSelectedUnit(null);
      setFilteredCourses([]);
      setActivityTypes([]);
      setSelectedActivity("All");
      setShowLockedOnly(false); // Reset locked slots state when unit is removed
    }
  };


  const handleActivityFilter = (activity) => {
    setSelectedActivity(activity);
  
    if (activity === "All") {
      setFilteredCourses(selectedUnit.courses);
    } else {
      setFilteredCourses(
        selectedUnit.courses.filter((c) => c.activity === activity)
      );
    }
    
    setError(null); // Hide error message
  };

  const sortedUnits = [...units].sort((a, b) => a.code.localeCompare(b.code));

  const displayedCourses = showLockedOnly
    ? lockedSlots.filter(
        (slot) =>
          selectedActivity === "All" ||
          slot.activity === selectedActivity
      )
    : filteredCourses.filter(
        (course) =>
          selectedActivity === "All" ||
          course.activity === selectedActivity
      );

  const toggleSchedule = () => {
    setShowLockedOnly(!showLockedOnly); // Toggle locked slots display
  };

  const lockedActivityTypes = showLockedOnly
    ? [...new Set(lockedSlots.map((slot) => slot.activity))]
    : [];

  const handleClearLockedSlots = () => {
    setLockedSlots([]);
  };
  
  const hasLockedSlotsForActivity = (activity, unit) =>
    lockedSlots.some((slot) => slot.activity === activity && slot.unitCode === unit.code);  

  const allActivitiesLocked = selectedUnit 
  ? activityTypes.every((activity) =>
      lockedSlots.some((slot) => slot.activity === activity && slot.unitCode === selectedUnit.code)
    )
  : false;



  const totalActivitiesRequired = units.reduce((acc, unit) => acc + new Set(unit.courses.map((c) => c.activity)).size, 0);
  const lockedActivitiesCount = lockedSlots.reduce((acc, slot) => {
    acc.add(`${slot.unitCode}-${slot.activity}-${slot.slotId}`); // Ensure unique slots are counted
    return acc;
  }, new Set()).size;
  
  
  return (
    <div className="min-h-screen flex flex-col items-center p-12 text-white">
      <h1 className="text-3xl mb-4">Add your Units</h1>

      <div className="mb-6 flex items-center justify-center space-x-4">
        <input
          type="text"
          className="ml-28 w-48 px-6 py-2 rounded-lg"
          placeholder="Enter unit code"
          value={unitCode}
          onChange={(e) => setUnitCode(e.target.value)}
        />
        <select
          className="w-48 px-6 py-3 rounded-lg"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="">Teaching period</option>
          {teachingPeriods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.text}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-6">{error}</p>}

      <div className="flex space-x-4 mb-6">
        {sortedUnits.map((unit) => (
          <button
            key={unit.code}
            onClick={() => handleUnitClick(unit)}
            className={`relative px-6 py-2 rounded-full flex items-center pr-10 ${
              showLockedOnly ? "bg-gray-600" : selectedUnit?.code === unit.code ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {unit.code}
            <span
              className="absolute right-0 mr-2 text-gray-300 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveUnit(unit.code);
              }}
            >
              ✖
            </span>
          </button>
        ))}

        {lockedSlots.length > 0 && (
          <button
            onClick={toggleSchedule}
            className={`relative px-6 py-2 rounded-full flex items-center pr-10 ${
              showLockedOnly ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            Schedule
            {showLockedOnly && (
              <span className="absolute right-0 mr-2 text-gray-300 cursor-pointer" onClick={handleClearLockedSlots}>✖</span>
            )}
          </button>
        )}
      </div>


      <p className="text-m text-gray-300">
      {totalActivitiesRequired > 0 && `${lockedActivitiesCount} of ${totalActivitiesRequired} required activities selected`}
      </p>

      <div className="border-b border-gray-500 w-full my-4"></div>

      {selectedUnit && (
        <h1 className="text-3xl font-bold mt-8 mb-4 text-center">
          {showLockedOnly ? "Timetable" : selectedUnit.name}
        </h1>
      )}

      {selectedUnit && !showLockedOnly && (
        <div className="flex space-x-4 mb-4">
          {activityTypes.length > 1 && (
            <>
              <button
                onClick={() => handleActivityFilter("All")}
                className={`px-6 py-2 rounded-full ${
                  selectedActivity === "All"
                    ? "bg-blue-600"
                    : allActivitiesLocked
                    ? "bg-pink-600"
                    : "bg-gray-600"
                }`}
              >
                All
              </button>

              {activityTypes.map((activity) => (
                <button
                  key={activity}
                  onClick={() => handleActivityFilter(activity)}
                  className={`px-6 py-2 rounded-full ${
                    selectedActivity === activity
                      ? "bg-blue-600"
                      : hasLockedSlotsForActivity(activity, selectedUnit) // Now checks unit too
                      ? "bg-pink-600"
                      : "bg-gray-600"
                  }`}
                >
                  {activity}
                </button>
              ))}


            </>
          )}
        </div>
      )}

      {showLockedOnly && (
        <div className="flex space-x-4 mb-6">
          {lockedActivityTypes.length > 1 && (
            <>
              <button
                onClick={() => handleActivityFilter("All")}
                className={`px-6 py-2 rounded-full ${selectedActivity === "All" ? "bg-blue-600" : "bg-gray-600"}`}
              >
                All
              </button>
              {lockedActivityTypes.map((activity) => (
                <button
                  key={activity}
                  onClick={() => handleActivityFilter(activity)}
                  className={`px-6 py-2 rounded-full ${selectedActivity === activity ? "bg-blue-600" : "bg-gray-600"}`}
                >
                  {activity}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      <Timetable
        courses={displayedCourses}
        unitCode={selectedUnit?.code}
        unitName={selectedUnit?.name}
        lockedSlots={lockedSlots}
        setLockedSlots={setLockedSlots} 
      />

      {/* List View of Available Times */}
      <div className="mt-8 w-full bg-gray-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Available Classes</h2>
        <ul className="space-y-4">
          {displayedCourses.map((course, index) => (
            <li key={index} className="bg-gray-600 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="font-semibold">{course.classType}</span>
                <span>{course.activity}</span>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                <p>Day: {course.day}</p>
                <p>Time: {course.time}</p>
                <p>Location: {course.location}</p>
                <p>Teaching Staff: {course.teachingStaff}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default SearchTimetable;
