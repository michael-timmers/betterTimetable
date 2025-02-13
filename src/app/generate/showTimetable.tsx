"use client";

import React, { useState, useEffect } from "react";
import { lockCourse, unlockCourse, removeTimeslot, getCourses } from './getCourseData'; // Import manageSlots.ts to handle the slot data

type Course = {
  id: string;
  classType: string;
  activity: string;
  day: string;
  time: string;
  location: string;
  teachingStaff: string;
};

type TimetableProps = {
  courses: Course[];
  unitCode: string;
};

const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI"];
const daysFullNames: { [key: string]: string } = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};
const hours = Array.from({ length: 13 }, (_, i) => i + 8);

const format12Hour = (hour: number) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour > 12 ? hour - 12 : hour;
  return `${formattedHour} ${suffix}`;
};

const parseTime = (timeStr: string) => {
  const [start, end] = timeStr.split(" - ");
  const to24Hour = (t: string) => {
    const [hour, min] = t.slice(0, -2).split(":").map(Number);
    return t.includes("pm") && hour !== 12 ? hour + 12 : hour;
  };
  return { start: to24Hour(start), end: to24Hour(end) };
};

const groupClassesByDay = (courses: Course[]) => {
  let timetable: { [key: string]: { [hour: number]: Course[] } } = {};

  daysOfWeek.forEach((day) => {
    timetable[day] = {};
  });

  courses.forEach((course) => {
    const { start } = parseTime(course.time);
    if (!timetable[course.day][start]) {
      timetable[course.day][start] = [];
    }
    timetable[course.day][start].push(course);
  });

  return timetable;
};



const Timetable: React.FC<TimetableProps> = ({ courses, unitCode }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch courses and update courseList state
    useEffect(() => {
      const fetchCourses = async () => {
        const Course = await getCourses();
        setSelectedCourse(Course); // Update the courseList state with resolved data
      };
  
      fetchCourses(); // Call the async function inside the effect
    }, []); // Runs only once when the component is mounted

  const timetable = groupClassesByDay(courses);
  const hasOverlappingClasses = Object.values(timetable).some((day) =>
    Object.values(day).some((classes) => classes.length > 4)
  );

  const openDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeDialog();
    }
  };

  // Handle when searching for a new unit
  const handleRemoveTimeslot = async () => {
    console.log("Here is the unitCode:", unitCode);
    console.log("Here is the selectedCourse:", selectedCourse);

    if (selectedCourse) {
      // Await the removal of the timeslot
      await removeTimeslot(unitCode, selectedCourse.id);

      // Fetch the updated courses after the removal
      const updatedCourses = await getCourses();
      
      // Update the state with the new courses after removal
      setSelectedCourse(updatedCourses[unitCode]?.courses || []);
      closeDialog();
    }
  };


  // Handle when searching for a new unit
  const handleLockCourse = async () => {
    if (selectedCourse) {
      const newLockedStatus = !selectedCourse.locked; // Toggle lock status
      if (newLockedStatus) {
        await lockCourse(selectedCourse.ID); // Call lock function
      } else {
        await unlockCourse(selectedCourse.ID); // Call unlock function
      }

      // Update selected course with new locked status
      setSelectedCourse({ ...selectedCourse, locked: newLockedStatus });

      // Fetch the updated courses after locking/unlocking
      const updatedCourses = await getCourses();
      setSelectedCourse(updatedCourses[unitCode]?.courses.find(course => course.ID === selectedCourse.ID) || null);
      closeDialog();
    }
  };

  

  return (
    <div className="w-full overflow-x-auto">
      {hasOverlappingClasses && (
        <div className="text-red-500 text-center font-bold mb-8">
          Warning: Too many classes running at the same time. Please filter to view specific offerings.
        </div>
      )}

      <div className="mt-6 grid grid-cols-6 gap-2 text-white bg-gray-900 p-4 rounded-lg">
        <div className="border-r border-gray-700"></div>
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-bold border-gray-700">
            {daysFullNames[day]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-2 relative">
        <div className="flex flex-col text-white relative">
          {hours.map((hour) => (
            <div key={hour} className="h-16 text-center border-b border-gray-700 relative">
              {format12Hour(hour)}
              <div className="absolute bottom-0 left-0 w-full border-b border-gray-600"></div>
            </div>
          ))}
        </div>

        {daysOfWeek.map((day) => (
          <div key={day} className="relative border-l border-gray-700 h-[48rem]">
            {hours.map((hour) => (
              <div key={hour} className="relative h-16 border-b border-gray-600">
                {timetable[day][hour]?.map((course, index, arr) => {
                  const { start, end } = parseTime(course.time);
                  const height = (end - start) * 4;
                  const width = 100 / arr.length;
                  const leftPosition = index * width;

                  return (
                    <div
                      key={index}
                      className={`absolute text-sm p-2 rounded-md shadow-md cursor-pointer ${course.locked ? 'bg-pink-500' : 'bg-blue-500'}`}
                      style={{
                        top: 0,
                        left: `${leftPosition}%`,
                        width: `${width}%`,
                        height: `${height}rem`,
                      }}
                      onClick={() => openDialog(course)}
                    >
                      <div>
                        <strong>{unitCode}</strong>
                      </div>
                      {course.activity} - {course.location}
                      <br />
                      {course.time}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {isDialogOpen && selectedCourse && (
        <div
          onClick={handleOutsideClick}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div className="bg-gray-1000 p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Class Details</h2>

            <table className="w-full text-white">
              <tbody>
                <tr className="custom-row-padding border-b border-gray-400">
                  <td className="font-bold pr-4 custom-width align-top">Unit:</td>
                  <td className="break-words">{unitCode}</td>
                </tr>
                <tr className="custom-row-padding border-b border-gray-400">
                  <td className="font-bold pr-4 custom-width align-top">Activity:</td>
                  <td className="break-words">{selectedCourse.activity}</td>
                </tr>
                <tr className="custom-row-padding border-b border-gray-400">
                  <td className="font-bold pr-4 custom-width align-top">Class Type:</td>
                  <td className="break-words">{selectedCourse.classType}</td>
                </tr>
                <tr className="custom-row-padding border-b border-gray-400">
                  <td className="font-bold pr-4 custom-width align-top">Location:</td>
                  <td className="break-words">{selectedCourse.location}</td>
                </tr>
                <tr className="custom-row-padding border-b border-gray-400">
                  <td className="font-bold pr-4 custom-width align-top">Time:</td>
                  <td className="break-words">{selectedCourse.time}</td>
                </tr>
                <tr className="custom-row-padding border-b border-gray-400">
                  <td className="font-bold pr-4 custom-width align-top">Staff:</td>
                  <td className="break-words">{selectedCourse.teachingStaff || "N/A - To be confirmed"}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 flex justify-end space-x-4">
              <button onClick={handleLockCourse} className="px-6 py-2 bg-pink-600 text-white rounded-lg">
                {selectedCourse.locked ? "Unlock" : "Lock"}
              </button>
              <button onClick={handleRemoveTimeslot} className="px-6 py-2 bg-gray-600 text-white rounded-lg">
                Remove
              </button>
              <button onClick={closeDialog} className="px-6 py-2 bg-blue-500 text-white rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;