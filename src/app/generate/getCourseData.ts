"use server";

import axios from "axios";
import * as cheerio from "cheerio"; // Use named import
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

// Global storage for all courses in a nested dictionary format
let coursesDict = {};

// Get all stored courses
export async function getCourses() {
  console.log("Here is the courses data:", coursesDict);
  return coursesDict;
}

// Add courses to global storage in nested dictionary format
export async function addCourses(unitCode, selectedPeriod) {
  try {
    const url = `https://qutvirtual3.qut.edu.au/qvpublic/ttab_unit_search_p.process_search?p_unit=${unitCode}&p_unit_description=&p_time_period_id=${selectedPeriod}&p_arg_names=Class+timetable+search&p_arg_values=%2Fttab_unit_search_p.show_search_adv%3F`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract the unit name
    const unitName = $("h2").eq(1).text().trim();

    if (!unitName) {
      // If unit name is not found, return null to indicate failure
      return null;
    }

    // Initialize unit if not present
    if (!coursesDict[unitCode]) {
      console.log(`Initializing new unit for code: ${unitCode}`);
      coursesDict[unitCode] = {
        unitName: unitName,
        courses: [],
      };
    }

    // Extract timetable data
    $("table.qv_table tr").each((index, element) => {
      if (index === 0) return; // Skip header row

      const course = {
        id: uuidv4(), // Generate unique ID
        classType: $(element).find("td").eq(0).text().trim(),
        activity: $(element).find("td").eq(1).text().trim(),
        day: $(element).find("td").eq(2).text().trim(),
        time: $(element).find("td").eq(3).text().trim(),
        location: $(element).find("td").eq(4).text().trim(),
        teachingStaff: $(element).find("td").eq(5).text().trim(),
        locked: false, // Default to unlocked
      };

      coursesDict[unitCode].courses.push(course);
    });

    // If no courses are found, return null
    if (coursesDict[unitCode].courses.length === 0) {
      console.log("No data found")
      return null;
    }

    return coursesDict;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error("Failed to fetch courses");
  }
}


// Remove all timeslots with a matching unit code
export async function removeCourses(unitCode) {
  delete coursesDict[unitCode]; // Remove the entire unit from coursesDict
  return coursesDict;
}


export async function removeTimeslot(unitCode, timeslotId) {
  if (!coursesDict[unitCode]) {
    throw new Error(`Unit code ${unitCode} not found`);
  }

  // Find the index of the timeslot with the given ID
  const indexToRemove = coursesDict[unitCode].courses.findIndex(
    (course) => course.id === timeslotId
  );

  if (indexToRemove === -1) {
    throw new Error(`Timeslot with ID ${timeslotId} not found`);
  }

  // Remove the course from the array using splice
  coursesDict[unitCode].courses.splice(indexToRemove, 1);

  // Return the updated coursesDict (optional, as it updates the global state)
  return coursesDict;
}


// Lock a timeslot by ID
export async function lockCourse(id) {
  for (const unitCode in coursesDict) {
    coursesDict[unitCode].courses.forEach((course) => {
      if (course.id === id) {
        // Unlock other slots of the same activity within the same unit. where c is course
        coursesDict[unitCode].courses.forEach((c) => {
          if (c.activity === course.activity) {
            c.locked = false;
          }
        });

        // Lock the selected timeslot
        course.locked = true;
      }
    });
  }
  return coursesDict;
}


// Unlock a timeslot by ID
export async function unlockCourse(id) {
  for (const unitCode in coursesDict) {
    coursesDict[unitCode].courses.forEach((course) => {
      if (course.id === id) {
        course.locked = false;
      }
    });
  }
  return coursesDict;
}
