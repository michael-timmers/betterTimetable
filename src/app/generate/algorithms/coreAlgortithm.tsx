/*

Hello there! Below is the algorithm used to select 1 of each activity for each unit
Note - The output does need to be returned in the format shown underneath the printed timetable:

{ 
  IFB104: { 
    unitName: "IFB104 Building IT Systems",
    courses: {
        "id": "fb51748f-709c-4d45-b7ec-2d9023460118",
        "unitCode": "IFB104",
        "unitName": "IFB104 Building IT Systems",
        "classType": "Lecture (Week 1-13) - On Campus Class (Internal Mode)",
        "activity": "LEC",
        "day": "MON",
        "time": "02:00pm - 04:00pm",
        "room": "GP Z411",
        "teachingStaff": "Laurianne Sitbon"
    }
  },
  IFB105: { 
    unitName: "IFB105 Database Management",
    courses: {
    ...
  },

*/

import { transformCourseList, sortUnitsByOptions } from "./helperFunctions";
import { filterByStartTime, filterByEndTime, filterByDays, filterByClassesPerDay, filterByBackToBack } from "./preferenceFunctions";
import scheduleUnits from "./recursiveFunctions";


/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                                      INTERFACES
///             these are used to provide structure to our data for type safety
///
/// ----------------------------------------------------------------------------------------------------- ///






// Define the structure for an individual course
interface Course {
  id: string;
  unitCode: string;
  unitName: string;
  classType: string;
  activity: string; // e.g., "LEC", "TUT", etc.
  day: string;      // e.g., "MON", "TUE", etc.
  time: string;     // e.g., "02:00pm - 04:00pm"
  room: string;
  teachingStaff: string;
}

// Define the structure for unit data, including the unit name and its courses
interface UnitData {
  unitName: string;
  courses: Course[]; // List of courses under this unit
}

// Define the course list as a mapping from unit codes to unit data
interface CourseList {
  [unitCode: string]: UnitData;
}

// Define the structure for scheduled times to keep track of occupied time slots
interface ScheduledTime {
  start: Date;
  end: Date;
  unitCode: string;
  activity: string;
}

// Define the structure for tracking scheduled times per day
interface CourseTimes {
  [day: string]: ScheduledTime[]; // e.g., MON: [{...}, {...}]
}

// Define the structure for the filtered course list (the final schedule)
interface FilteredCourseList {
  [unitCode: string]: {
    unitName: string;
    courses: Course[];
  };
}






/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                                      CORE FUNCTIONS
///                  these are used to directly run the filtering algorithm
///
/// ----------------------------------------------------------------------------------------------------- ///


export default function filterCourseList(
      courseList: CourseList,
      start: string,
      end: string,
      days: string[],
      classesPerDay: number,
      backToBack: boolean
    ): FilteredCourseList | null {
      ///
      /// This function takes in the list of selected courses as well as preferences and outputs a filtered list of
      /// the given courses but only with a single timeslot for each activity selected based on preferences 
      ///
      /// inputs:
      ///   courseList - A dictionary element containing the added unit codes and their timeslots
      /// outputs:
      ///   filteredCourseList - A dictionary element with the same structure as courseList but containing only filtered elements
      ///

      // Filter by start time
      courseList = filterByStartTime(courseList, start);
    
      // Filter by end time
      courseList = filterByEndTime(courseList, end);
    
      // Filter by days
      courseList = filterByDays(courseList, days);
    
      // Filter by classes per day (placeholder)
      courseList = filterByClassesPerDay(courseList, classesPerDay);
    
      // Filter by back-to-back preference (placeholder)
      courseList = filterByBackToBack(courseList, backToBack);

      // Transform the course list using the transformCourseList function
      const units = transformCourseList(courseList);

      // Alternative sorting: Schedule units with more options first
      sortUnitsByOptions(units);

      // Initialize course times to keep track of scheduled times per day
      const scheduledTimesPerDay: CourseTimes = {
        MON: [],
        TUE: [],
        WED: [],
        THU: [],
        FRI: [],
      };

      // Initialize the result object to store the final schedule
      const finalSchedule: FilteredCourseList = {};

      // Start scheduling units recursively
      const schedulingSuccess = scheduleUnits(
        0,
        units,
        scheduledTimesPerDay,
        finalSchedule
      );

      // Return the final schedule if successful, otherwise return null
      if (schedulingSuccess) {
        console.log("Here is the final timetable.", finalSchedule);

        return finalSchedule;
      } else {
        console.warn("Unable to find a conflict-free schedule.");
        return null;
      }
  }




