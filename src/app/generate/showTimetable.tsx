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

// Group classes by day and combine locations for overlapping activities
const groupClassesByDay = (courses: Course[]) => {
  let timetable: { [key: string]: { [hour: number]: Course[] } } = {};

  daysOfWeek.forEach((day) => {
    timetable[day] = {};
    console.log(`Initialized timetable for day: ${day}`);
  });

  courses.forEach((course) => {
    const { start, end } = parseTime(course.time);
    console.log(`Processing course: ${course.id} - ${course.activity} at ${course.time}`);

    if (!timetable[course.day][start]) {
      timetable[course.day][start] = [];
      console.log(`Initialized time slot for ${start}:00 on ${course.day}`);
    }

    // Check if the same activity is already present at the same time slot
    const existingCourse = timetable[course.day][start].find(
      (c) => c.activity === course.activity
    );

    if (!existingCourse) {
      // If the same activity doesn't exist, add it
      timetable[course.day][start].push(course);
      console.log(`Added course: ${course.id} - ${course.activity} to timetable`);
    } else {
      // If the same activity exists, update the existing course to have a unique ID and merge rooms
      if (!existingCourse.id.includes(course.id)) {
        // Only merge if the course ID is not already present in the existing course's ID
        existingCourse.id = `${existingCourse.id}-${course.id}`;
        existingCourse.room = `${existingCourse.room}, ${course.room}`;
        console.log(`Merged course: ${course.id} - ${course.activity} with existing course ${existingCourse.id}`);
      } else {
        // Skip adding this course since it already exists in the group
        console.log(`Course ${course.id} is already added for this timeslot, skipping.`);
      }
    }
  });

  console.log('Final timetable:', timetable);
  return timetable;
};



const Timetable: React.FC<TimetableProps> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Combine all courses from the courses object
  const allCourses = Object.values(courses)
    .flatMap((courseUnit) => courseUnit.courses);

  const timetable = groupClassesByDay(allCourses);
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
                  const courseKey = `${course.id}`;

                  return (
                    <div
                      key={courseKey}
                      className={`absolute text-sm p-2 rounded-md shadow-md cursor-pointer bg-blue-500`}
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
