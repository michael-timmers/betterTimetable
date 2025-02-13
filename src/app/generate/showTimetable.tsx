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

  const mergedCourses: Course[] = [];

  courses.forEach((course) => {
    const existing = mergedCourses.find(
      (c) => c.day === course.day && c.time === course.time && c.activity === course.activity
    );
    if (existing) {
      existing.location += `, ${course.location}`;
    } else {
      mergedCourses.push({ ...course });
    }
  });

  mergedCourses.forEach((course) => {
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
  
  useEffect(() => {
    const fetchCourses = async () => {
      const Course = await getCourses();
      setSelectedCourse(Course);
    };
    fetchCourses();
  }, []);

  const timetable = groupClassesByDay(courses);
  const hasOverlappingClasses = Object.values(timetable).some((day) =>
    Object.values(day).some((classes) => classes.length > 4)
  );

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
                    >
                      <div>
                        <strong>{unitCode}</strong>
                      </div>
                      {course.activity}
                      <br />
                      {course.location}
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
    </div>
  );
};

export default Timetable;
