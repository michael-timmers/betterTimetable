"use client";

import React, { useState } from "react";

type Course = {
  id: string;
  unitCode: string;
  unitName: string;
  classType: string;
  activity: string;
  day: string;
  time: string;
  room: string;
  teachingStaff: string;
};

type TimetableProps = {
  courses: Record<string, { unitName: string; courses: Course[] }>;
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

// Group classes by day without merging overlapping activities
const groupClassesByDay = (courses: Course[]) => {
  let timetable: { [key: string]: { [hour: number]: Course[] } } = {};

  daysOfWeek.forEach((day) => {
    timetable[day] = {};
  });

  courses.forEach((course) => {
    const { start, end } = parseTime(course.time);

    if (!timetable[course.day][start]) {
      timetable[course.day][start] = [];
    }

    timetable[course.day][start].push(course);
  });

  return timetable;
};

// Define the color palette to cycle through
const colorPalette = [
  "bg-blue-1000", "bg-red-1000", "bg-green-1000", "bg-yellow-1000", 
  "bg-purple-1000", "bg-orange-1000", "bg-pink-1000"
];

const Timetable: React.FC<TimetableProps> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Combine all courses from the courses object
  const allCourses = Object.values(courses)
    .flatMap((courseUnit) => courseUnit.courses);

  // Group courses by day
  const timetable = groupClassesByDay(allCourses);

  // To assign colors to each unit, we will map them to colors
  const unitColors: { [unitCode: string]: string } = {};

  // Loop through the courses and assign a color to each unit
  let colorIndex = 0;
  allCourses.forEach((course) => {
    if (!unitColors[course.unitCode]) {
      unitColors[course.unitCode] = colorPalette[colorIndex % colorPalette.length];
      colorIndex++;
    }
  });

  return (
    <div className="w-full overflow-x-auto">
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

                  const courseColor = unitColors[course.unitCode]; // Get the color for the unit

                  return (
                    <div
                      key={course.id}
                      className={`absolute text-sm p-2 rounded-md shadow-md cursor-pointer ${courseColor}`}
                      style={{
                        top: 0,
                        left: `${leftPosition}%`,
                        width: `${width}%`,
                        height: `${height}rem`,
                      }}
                    >
                      <div>
                        <strong>{course.unitCode}</strong>
                      </div>
                      {course.activity}<br />
                      {course.room}<br />
                      {course.time}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timetable;
