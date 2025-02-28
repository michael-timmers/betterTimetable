/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                                      INTERFACES
///             these are used to provide structure to our data for type safety
///
/// ----------------------------------------------------------------------------------------------------- ///




// Define an interface for course times
interface CourseTimes {
  [day: string]: ScheduledTime[]; // e.g., MON: [{...}, {...}]
}

// Define the structure for scheduled times to keep track of occupied time slots
interface ScheduledTime {
  start: Date;
  end: Date;
  unitCode: string;
  activity: string;
}

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
///                                      PREFERENCE FUNCTIONS
///          these are used to support our personal needs as students for the filtering algorithm
///
/// ----------------------------------------------------------------------------------------------------- ///



export function filterByPreference(
  courseList: CourseList,
  studyTimes: { [key: string]: string[] }
): FilteredCourseList {
  ///
  /// Function to filter courses based on preferred study times.
  ///
  /// inputs:
  ///   courseList - The list of courses to filter.
  ///   studyTimes - A dictionary mapping days to preferred study times.
  /// outputs:
  ///   FilteredCourseList - The filtered list of courses based on study times.
  ///

  // Implement filtering logic based on studyTimes
  // Placeholder: Return the courseList unchanged for now
  return courseList;
}




  
  /// ----------------------------------------------------------------------------------------------------- ///
  /// 
  ///                                      HELPER FUNCTIONS
  ///                  these are used to support the main functions of our algorithm
  ///
  /// ----------------------------------------------------------------------------------------------------- ///
  
  
  export function convertTo24Hour(time12h: string): string {
      //// Helper function to convert 12-hour time to 24-hour time format
      ///
      /// inputs:
      ///   time12h: string - A string representing the time in 12-hour format (e.g., "2:30pm")
      /// outputs:
      ///   string - The corresponding time in 24-hour format (e.g., "14:30:00")
      ///
  
      const match = time12h.trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
      if (!match) {
        throw new Error(`Invalid time format: ${time12h}`);
      }
  
      let [, hourStr, minuteStr, modifier] = match;
      let hours = parseInt(hourStr, 10);
      const minutes = parseInt(minuteStr, 10);
  
      if (modifier.toLowerCase() === "pm" && hours !== 12) {
        hours += 12;
      } else if (modifier.toLowerCase() === "am" && hours === 12) {
        hours = 0;
      }
  
      const hoursStr = hours.toString().padStart(2, "0");
      const minutesStr = minutes.toString().padStart(2, "0");
  
      return `${hoursStr}:${minutesStr}:00`;
  }
  
  
  
  
 export function groupActivitiesWithinUnits(courseList: Record<string, 
    { unitName: string; 
      courses: Course[] 
    }>): Array<{ 
      unitCode: string; 
      unitName: string; 
      activities: Array<{ 
        activityType: string; 
        courses: Course[] }> 
    }> {
    //// Function to transform the course list into an array of units with their activities and courses
    ///
    /// inputs:
    ///   courseList: Record<string, { unitName: string; courses: Course[] }>
    /// outputs:
    ///   Array<{ unitCode: string; unitName: string; activities: Array<{ activityType: string; courses: Course[] }> }>
    ///
  
    return Object.entries(courseList).map(([unitCode, unitData]) => {
      // Group courses by activity type (e.g., group all lectures together)
      const activityGroups = unitData.courses.reduce((groups, course) => {
        // Initialize the group if it doesn't exist, then add the course to it
        (groups[course.activity] ||= []).push(course);
        return groups;
      }, {} as Record<string, Course[]>);
  
      // Return the unit with its activities and corresponding courses
      return {
        unitCode,
        unitName: unitData.unitName,
        activities: Object.entries(activityGroups).map(
          ([activityType, courses]) => ({
            activityType,
            courses,
          })
        ),
      };
    });
  }




  export function initializeScheduleData(): { 
    scheduledTimesPerDay: CourseTimes; 
    finalSchedule: FilteredCourseList } {
  ///
  /// Inputs:
  ///   None
  /// Outputs:
  ///   An object containing:
  ///     - scheduledTimesPerDay: A record of arrays representing scheduled times for each weekday.
  ///     - finalSchedule: An object to store the final schedule.
  ///

    return {
      scheduledTimesPerDay: {
        MON: [],
        TUE: [],
        WED: [],
        THU: [],
        FRI: [],
      },
      finalSchedule: {},
    };
  }

  



  
  
  
  
  
  export function parseCourseTime(timeStr: string): Date {
    //// Function to parse course time strings into Date objects
    ///
    /// inputs:
    ///   timeStr: string - A string representing the time in 12-hour format (e.g., "2:30pm")
    /// outputs:
    ///   Date - A Date object corresponding to the time on a fixed date (e.g., January 1, 1970)
    ///
  
    return new Date(`1970-01-01T${convertTo24Hour(timeStr)}`);
  }
  
  
  