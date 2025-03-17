import checkUnit from "../generate/download_data/checkUnits";
import uploadUnit from "../generate/download_data/uploadUnit";
import downloadUnit from "../generate/download_data/downloadUnits";
import { CourseData } from "./courseTypes";

export const fetchAvailablePeriods = async (unitCode: string): Promise<{ validPeriods: any[], teachingPeriods: any[] }> => {
  try {
    // Fetch teaching periods
    const teachingPeriodsResponse = await fetch("/api/teaching-data");
    const teachingPeriods = await teachingPeriodsResponse.json();

    if (!teachingPeriods || teachingPeriods.error) {
      throw new Error("Failed to fetch teaching periods");
    }

    // Fetch valid periods based on teaching periods
    let validResults: any[] = [];
    for (let period of teachingPeriods) {
      const response = await fetch(`/api/course-data?unitCode=${unitCode}&teachingPeriod=${period.value}`);
      const data = await response.json();
      if (Object.keys(data).length !== 0 && !data.error) {
        validResults.push({ text: period.text, value: period.value });
      }
    }

    return { validPeriods: validResults, teachingPeriods };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch teaching or valid periods");
  }
};



export const fetchCourseData = async (unitCode: string, selectedPeriod: string): Promise<CourseData> => {
  const formattedUnitCode = unitCode.toUpperCase();
  const dbResponse = await checkUnit(formattedUnitCode);

  if (dbResponse.exists) {
    const courseResponse = await downloadUnit(formattedUnitCode);
    if (courseResponse.success) {
      return { unitName: courseResponse.unitName, courses: courseResponse.courseData };
    }
    throw new Error("Invalid unit data received.");
  }

  const response = await fetch(`/api/course-data?unitCode=${formattedUnitCode}&teachingPeriod=${selectedPeriod}`);
  const data = await response.json();
  uploadUnit(formattedUnitCode, data[formattedUnitCode].courses, data[formattedUnitCode].unitName).catch(console.error);
  
  return data[formattedUnitCode];
};
