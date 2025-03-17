"use server";
import checkUnit from "../generate/download_data/checkUnits";
import uploadUnit from "../generate/download_data/uploadUnit";
import downloadUnit from "../generate/download_data/downloadUnits";
import { CourseData } from "./manageTimeslots";
import { units, teachingPeriods, timeslots } from "../../db/schema"; // Import table schemas (including timeslots)
import { drizzle } from "drizzle-orm/mysql2";
import { eq, sql } from "drizzle-orm";

// Define your base URL, either from an environment variable or fallback to localhost.
const baseUrl = process.env.HOST_URL || "http://localhost:3000";

export const fetchAvailablePeriods = async (
  unitCode: string,
  failed: string // If "true", force the API fallback.
): Promise<{ validPeriods: any[]; teachingPeriods: any[] }> => {
  const db = drizzle(process.env.DATABASE_URL!);

  try {
    // Attempt to retrieve the teaching period via a join between units and teachingPeriods.
    const joinedPeriods = await db
      .select({
        id: teachingPeriods.id,
        periodName: teachingPeriods.periodName,
      })
      .from(units)
      .innerJoin(teachingPeriods, eq(units.periodId, teachingPeriods.id))
      .where(eq(units.unitCode, unitCode));

    // If not forcing fallback ("failed" is not "true") and we found a match in the DB, return that.
    if (failed !== "true" && joinedPeriods.length > 0) {
      const formattedPeriods = joinedPeriods.map((period) => ({
        text: period.periodName, // periodName becomes text
        value: period.id,        // period id becomes value
      }));
      return { validPeriods: formattedPeriods, teachingPeriods: formattedPeriods };
    }

    // Otherwise, use the API to fetch teaching periods.
    const teachingPeriodsResponse = await fetch(`${baseUrl}/api/teaching-data`);
    const teachingPeriodsData = await teachingPeriodsResponse.json();

    if (!teachingPeriodsData || teachingPeriodsData.error) {
      throw new Error("Failed to fetch teaching periods");
    }

    // Iterate over the API-fetched teaching periods to find valid periods using course data.
    let validResults: any[] = [];
    let chosenCourseData: any = null; // We'll store the first valid coursedata we get.
    for (let period of teachingPeriodsData) {
      const response = await fetch(
        `${baseUrl}/api/course-data?unitCode=${unitCode}&teachingPeriod=${period.value}`
      );
      const data = await response.json();
      // Check if valid course data is returned.
      if (Object.keys(data).length !== 0 && !data.error) {
        validResults.push({ text: period.text, value: period.value });
        if (!chosenCourseData) {
          // Assuming the API returns an object keyed by the uppercased unit code.
          chosenCourseData = data[unitCode.toUpperCase()];
        }
      }
    }

    // If valid API course data was found, insert it into the database.
    if (validResults.length > 0 && chosenCourseData) {
      // Use the first valid period from our results for insertion.
      const chosenPeriod = validResults[0];
      const formattedUnitCode = unitCode.toUpperCase();

      // 1. Insert the teaching period if it doesn't exist.
      const existingTP = await db
        .select()
        .from(teachingPeriods)
        .where(eq(teachingPeriods.id, chosenPeriod.value));
      if (existingTP.length === 0) {
        await db.insert(teachingPeriods).values({
          id: chosenPeriod.value,
          periodName: chosenPeriod.text,
        });
      }

      // 2. Insert the unit record if it doesn't exist.
      const existingUnit = await db
        .select()
        .from(units)
        .where(eq(units.unitCode, formattedUnitCode));
      if (existingUnit.length === 0) {
        await db.insert(units).values({
          unitCode: formattedUnitCode,
          unitName: chosenCourseData.unitName,
          periodId: chosenPeriod.value,
        });
      }

      // 3. Ensure we have the unit record for timeslot insertion.
      const unitRecordArray = await db
        .select()
        .from(units)
        .where(eq(units.unitCode, formattedUnitCode));
      const insertedUnit = unitRecordArray[0];

      // 4. Insert timeslot entries for the fetched course data.
      for (let course of chosenCourseData.courses) {
        await db.insert(timeslots).values({
          unitId: insertedUnit.id, // Link to the unit record
          classType: course.classType,
          activity: course.activity,
          day: course.day,
          classTime: course.time,
          room: course.room,
          teachingStaff: course.teachingStaff,
        });
      }
    }

    // Return the API-derived teaching periods.
    return { validPeriods: validResults, teachingPeriods: teachingPeriodsData };
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch teaching or valid periods");
  }
};



export const fetchCourseData = async (unitCode: string): Promise<CourseData> => {
  // Initialize the database connection.
  const db = drizzle(process.env.DATABASE_URL!);

  // Format the unit code to uppercase
  const formattedUnitCode = unitCode.toUpperCase();

  // Query the units table for the given unit code.
  const unitRecords = await db
    .select()
    .from(units)
    .where(eq(units.unitCode, formattedUnitCode));

  if (unitRecords.length === 0) {
    throw new Error(`Unit ${formattedUnitCode} not found in the database.`);
  }

  const unit = unitRecords[0];

  // Query the timeslots table to get all timeslot entries for this unit.
  const timeslotRecords = await db
    .select()
    .from(timeslots)
    .where(eq(timeslots.unitId, unit.id));

  // Map timeslot records to the expected Course format.
  const courses = timeslotRecords.map((record) => ({
    id: record.id,
    unitCode: unit.unitCode,
    unitName: unit.unitName,
    classType: record.classType,
    activity: record.activity,
    day: record.day,
    time: record.classTime,  // Map the `classTime` field from DB to `time`
    room: record.room,
    teachingStaff: record.teachingStaff,
  }));

  // Return the CourseData in the expected format.
  return { unitName: unit.unitName, courses };
};