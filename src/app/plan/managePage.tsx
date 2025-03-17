"use client"

import React, { useState } from "react";
import TimetableView from "./timetableView";
import UnitSelection from "./sidebarView";
import { SelectedCourses } from "./manageTimeslots";

const Details = () => {
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourses>({});
  const [unitColors, setUnitColors] = useState<{ [unitCode: string]: string }>({});

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
  
  
  return (
    <div className="flex flex-col md:flex-row bg-white">
      <UnitSelection
        selectedCourses={selectedCourses}
        unitColors={unitColors}
      />
      <section className="w-full md:w-3/4 pr-6 pb-6">
        <TimetableView
          courseList={selectedCourses}
          unitColors={unitColors}
          preferences={{ studyTimes: [] }}
        />
      </section>
    </div>
  );
};

export default Details;
