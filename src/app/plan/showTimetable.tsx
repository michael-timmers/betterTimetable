"use client";

import React, { useState } from "react";
import { manageSlots } from './getLockedTimes'; // Import manageSlots.ts to handle the slot data

type Course = {
  classType: string;
  activity: string;
  day: string;
  time: string;
  location: string;
  teachingStaff: string;
  unitCode: string; // Added unitCode to uniquely identify units
};

type TimetableProps = {
  courses: Course[];
  unitCode: string;
  unitName: string;
  lockedSlots: string[];
  setLockedSlots: (lockedSlots: string[]) => void;
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

// Group classes by day and unitCode
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

// Color cycle for different units
const colorCycle = [
  "bg-blue-1000", "bg-red-1000", "bg-green-1000", "bg-yellow-1000",
  "bg-purple-1000", "bg-orange-1000", "bg-pink-1000"
];

const Timetable: React.FC<TimetableProps> = ({ courses, unitCode, unitName, lockedSlots, setLockedSlots }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Group classes by day and time
  const timetable = groupClassesByDay(courses);
  const hasOverlappingClasses = Object.values(timetable).some((day) =>
    Object.values(day).some((classes) => classes.length > 4)
  );

  // Get unique unit codes from the courses
  const uniqueUnits = Array.from(new Set(courses.map((course) => course.unitCode)));

  const openDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCourse(null);
  };

  const toggleLock = (course: Course) => {
    let updatedLockedSlots;
    if (lockedSlots.some(
        slot => slot.activity === course.activity && 
        slot.day === course.day && 
        slot.time === course.time && 
        slot.location === course.location
    )) {
        updatedLockedSlots = manageSlots("remove", course, unitCode);
    } else {
        updatedLockedSlots = manageSlots("add", course, unitCode);
    }

    setLockedSlots(updatedLockedSlots); 
    closeDialog();
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
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

      <div className="mt-6 grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr] gap-2 text-white bg-gray-900 p-4 rounded-lg">
        <div></div>
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-bold">
            {daysFullNames[day]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr] gap-2 relative">
        <div className="flex flex-col text-white relative">
          {hours.map((hour) => (
            <div key={hour} className="h-16 text-center border-b border-gray-700 bg-gray-900 relative">
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

                  // Get the unit index to assign the color
                  const unitIndex = uniqueUnits.indexOf(course.unitCode);
                  const colorClass = colorCycle[unitIndex % colorCycle.length]; // Cycle through colors

                  return (
                    <div
                      key={index}
                      className={`absolute text-sm p-2 rounded-md shadow-md cursor-pointer ${colorClass}`}
                      style={{
                        top: 0,
                        left: `${leftPosition}%`,
                        width: `${width}%`,
                        height: `${height}rem`,
                      }}
                      onClick={() => openDialog(course)}
                    >
                      <div>
                        <strong>{course.unitCode}</strong>
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
                  <td className="break-words">{unitName}</td>
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
              <button
                onClick={() => toggleLock(selectedCourse)}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg"
              >
                {lockedSlots.some(
                  (slot) =>
                    slot.day === selectedCourse.day &&
                    slot.time === selectedCourse.time &&
                    slot.location === selectedCourse.location
                ) 
                  ? "Unlock" 
                  : "Lock"
                }
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
