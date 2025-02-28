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

import { filterByPreference, groupActivitiesWithinUnits, initializeScheduleData } from "./helperFunctions";
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
      studyTimes: { [key: string]: string[] },
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

      console.log("Here is the study times we are not available for:", studyTimes);

      // STAGE 1 --- CONSIDER PREFERENCE
      courseList = filterByPreference(courseList, studyTimes); 

      
      // STAGE 2 --- GROUP ACTIVITIES WITHIN COURSES
      const units = groupActivitiesWithinUnits(courseList); 


      // STAGE 3 --- INITIALISE COURSE TIMES AND FINAL SCHEDULE DATA STRUCTURES
      const { scheduledTimesPerDay, finalSchedule } = initializeScheduleData();;
    

      // STAGE 4 --- SCHEDULE UNITS RECURSIVELY
      const schedulingSuccess = scheduleUnits(
        0,
        units,
        scheduledTimesPerDay,
        finalSchedule
      );

      // Return the final schedule if successful, otherwise return null
      if (schedulingSuccess) {
        // console.log("Here is the final timetable.", finalSchedule);

        return finalSchedule;
      } else {
        // console.warn("Unable to find a conflict-free schedule.");
        return null;
      }
  }




