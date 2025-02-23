"use client";

import { useState, useEffect } from "react";
import Timetable from "./showTimetable";
import filterCourseList from "./allocationAlgorithm";


// Structure the course data
interface Course {
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

const SearchTimetable = () => {

  // Establish the variables that require updating
  const [unitCode, setUnitCode] = useState("");
  const [courseList, setCourseList] = useState<{ [key: string]: CourseData }>({});
  const [teachingPeriods, setTeachingPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"units" | "preferences" | "timetable">("units");
  const [validPeriods, setValidPeriods] = useState([]); // Store valid teaching periods that returned data
  const [showDialog, setShowDialog] = useState(false); // Control the dialog box visibility

  // Reset variables when accessing the page initially
  useEffect(() => {
    // Reset everything when component mounts
    setCourseList({});
    setError(null);
    setLoading(false);
  }, []); // Empty dependency array ensures this effect runs only once when the component is mounted

  // Fetch the teaching periods from the API
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
    setValidPeriods([]); // Reset valid periods on each search
  
    try {
      const formattedUnitCode = unitCode.toUpperCase();
      let validResults = [];
  
      for (let period of teachingPeriods) {
        console.log("Fetching data for period:", period.value);
  
        const response = await fetch(
          `/api/course-data?unitCode=${formattedUnitCode}&teachingPeriod=${period.value}`
        );
        const data = await response.json();
        console.log("Response data:", data);
  
        // Check if the data is empty (i.e., no courses returned)
        if (Object.keys(data).length === 0) {
          console.log("No data found for this teaching period");
          continue; // Skip this period, no valid data for it
        }
  
        // Check if there are no errors in the data
        if (data && !data.error) {
          validResults.push({ text: period.text, value: period.value });
        }
      }
  
      // Set valid periods after all calls
      setValidPeriods(validResults);
  
      if (validResults.length === 0) {
        setError("No valid periods found for this unit.");
      } else {
        setShowDialog(true); // Show dialog with the valid periods
      }
    } catch (error) {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddUnit = async (unitCode: string) => {
    if (selectedPeriod) {
      // Add the unit to the course list

      const formattedUnitCode = unitCode.toUpperCase(); // Capitalize unit code
      const response = await fetch(
        `/api/course-data?unitCode=${formattedUnitCode}&teachingPeriod=${selectedPeriod}`
      );
      const data = await response.json();
      const unitData = data[formattedUnitCode]; // Extract unit data under the key
         // Update the courseList state with the fetched data
         setCourseList((prevCourses) => ({
          ...prevCourses,
          [formattedUnitCode]: unitData, // Add the unit's data to courseList
        }));

      setShowDialog(false);
    } else {
      setError("Please select a valid teaching period.");
    }
  };

  const handleRemoveUnit = (unitCodeToRemove: string) => {
    setCourseList((prevCourses) => {
      const updatedCourses = { ...prevCourses };
      delete updatedCourses[unitCodeToRemove];
      return updatedCourses;
    });
  };


  // Define the same color palette used in Timetable.tsx
  const colorPalette = [
    "bg-blue-1000", "bg-red-1000", "bg-green-1000", "bg-yellow-1000", 
    "bg-purple-1000", "bg-orange-1000", "bg-pink-1000"
  ];

  // Assign colors to each unit
  const unitColors: { [unitCode: string]: string } = {};
  let colorIndex = 0;
  Object.keys(courseList).forEach((unit) => {
    if (!unitColors[unit]) {
      unitColors[unit] = colorPalette[colorIndex % colorPalette.length];
      colorIndex++;
    }
  });

  console.log("Entries!!", courseList);








  // PREFERENCES --- TO DO!!

  const start = "9AM";
  const end = "5PM";
  const days = ["MON", "TUE", "WED"];
  const classesPerDay = 2;
  const backToBack = false

  // ------------------------




  return (
    <div className="min-h-screen flex flex-col items-center p-12 text-white">


      {/* --------- UNITS TAB --------- */}
      {tab === "units" && (
        <>
          <div className="mt-12 mb-4 w-full flex items-center relative">
            <h1 className="text-4xl absolute left-1/2 transform -translate-x-1/2">
              Add your Units
            </h1>
            <button
              onClick={() => {
                if (Object.keys(courseList).length === 0) {
                  setError("Add Unit to generate timetable");
                } else {
                  setTab("preferences");
                }
              }}
              className={`ml-auto px-6 py-2 text-white rounded-full ${
                Object.keys(courseList).length === 0
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-1000 hover:bg-blue-1100"
              }`}
              disabled={Object.keys(courseList).length === 0}
            >
              Next
            </button>
          </div>

          {/* Search feature */}
          <div className="mt-10 mb-16 flex items-center justify-center space-x-4">
            {/* Input field for unit code */}
            <input
              type="text"
              className="w-48 px-6 py-2 rounded-lg bg-gray-1200"
              placeholder="Enter unit code"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
            />

            {/* Search button that triggers the search action */}
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
              disabled={loading}
            >
              {loading ? "Searching..." : "Add"}
            </button>
          </div>

          {/* Error message for search feature */}
          {error && <p className="text-red-500 mb-6">{error}</p>}

          {/* Show unit codes added to courseList */}
          <div className="flex space-x-4 mb-6 flex-wrap">
            {Object.keys(courseList)
              .sort((a, b) => a.localeCompare(b))
              .map((unit) => (
                <div key={unit} className="flex flex-col items-center group">
                  <div
                    className={`relative px-6 py-10 rounded-full flex items-center justify-center text-white ${unitColors[unit]}`}
                  >
                    <span className="text-lg">{unit.toUpperCase()}</span>
                    
                    {/* The 'X' button will show only on hover */}
                    <span
                      className="absolute bottom-2 text-gray-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUnit(unit);
                      }}
                    >
                      ✖
                    </span>
                  </div>
                </div>
              ))}
          </div>


          {showDialog && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
              onClick={() => setShowDialog(false)} // Close dialog when clicking outside
            >
              <div
                className="bg-gray-1100 p-6 rounded-lg relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the dialog
              >
                {/* Cross button to close the dialog */}
                <button
                  onClick={() => setShowDialog(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                  ✖
                </button>

                <h2 className="text-xl mb-4">Select a Teaching Period</h2>
                <select
                  className="mb-4 px-6 py-2 rounded-lg bg-gray-1200 text-white"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="">Select period</option>
                  {validPeriods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.text}
                    </option>
                  ))}
                </select>
                <div>
                  <button
                    onClick={() => handleAddUnit(unitCode)}  // Pass unitCode when button is clicked
                    className="px-6 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
                  >
                    Add Unit
                  </button>
                </div>
              </div>
            </div>
          )}

        </>
      )} 




      {/* --------- PREFERENCES TAB --------- */}

      {tab === "preferences" && (
        <>
          

          {/* Display the course list in JSON format */}
          <p> Preferences go here! </p>


            <div className="inline">
              <button
                onClick={() => {
                    setTab("units");
                }}
                className={`ml-auto px-6 py-2 text-white rounded-full bg-blue-1000 hover:bg-blue-1100`}
              >
                Back
              </button>

              <button
                onClick={() => {
                    setTab("timetable");
                }}
                className={`ml-auto px-6 py-2 text-white rounded-full bg-blue-1000 hover:bg-blue-1100`}
              >
                Next
              </button>
            </div>
        </> 
      )}



      
      
      {/* --------- TIMETABLE TAB --------- */}

      {tab === "timetable" && (
        <>
          <div className="flex items-center w-full mb-4">
            <button
              onClick={() => setTab("preferences")}
              className="px-6 py-2 bg-blue-1000 text-white hover:bg-blue-1100 rounded-full"
            >
              Back
            </button>
            <h1 className="text-3xl font-bold mx-auto">Your Timetable</h1>
          </div>

          <div className="border-b border-gray-500 w-full my-4"></div>

          <Timetable courses={filterCourseList(courseList, start, end, days, classesPerDay, backToBack)} />

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
