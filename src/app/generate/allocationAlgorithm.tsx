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
///                                      HELPER FUNCTIONS
///                  these are used to support the main functions of our algorithm
///
/// ----------------------------------------------------------------------------------------------------- ///


function convertTo24Hour(time12h: string): string {
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




function transformCourseList(courseList: Record<string, 
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




function sortUnitsByOptions(units: 
  Array<{ 
    unitCode: string; 
    unitName: string; 
    activities: Array<{ 
      activityType: string; 
      courses: Course[]
    }> }>): void {
  //// Function to sort units based on the number of scheduling options
  ///
  /// inputs:
  ///   units: Array<{ unitCode: string; unitName: string; activities: Array<{ activityType: string; courses: Course[] }> }>
  /// outputs:
  ///   void - The input array is sorted in place
  ///

  units.sort((unitA, unitB) => {
    const optionsA = unitA.activities.reduce(
      (acc, activity) => acc * activity.courses.length,
      1
    );
    const optionsB = unitB.activities.reduce(
      (acc, activity) => acc * activity.courses.length,
      1
    );
    return optionsB - optionsA; // Note the reversal here
  });
}




function parseCourseTime(timeStr: string): Date {
  //// Function to parse course time strings into Date objects
  ///
  /// inputs:
  ///   timeStr: string - A string representing the time in 12-hour format (e.g., "2:30pm")
  /// outputs:
  ///   Date - A Date object corresponding to the time on a fixed date (e.g., January 1, 1970)
  ///

  return new Date(`1970-01-01T${convertTo24Hour(timeStr)}`);
}





/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                                      RECURSIVE FUNCTIONS
///                     these are used to allocate timeslots without clashes
///
/// ----------------------------------------------------------------------------------------------------- ///


function scheduleUnits(
  unitIndex: number,
  units: Array<{
    unitCode: string;
    unitName: string;
    activities: {
      activityType: string;
      courses: Course[];
    }[];
  }>,
  scheduledTimesPerDay: CourseTimes,
  finalSchedule: FilteredCourseList
): boolean {
  //// Recursive function to schedule units and their activities
  ///
  /// inputs:
  ///   unitIndex: number - The index of the unit to schedule
  ///   units: Array<Unit> - The array of units to schedule
  ///   scheduledTimesPerDay: CourseTimes - The times already scheduled
  ///   finalSchedule: FilteredCourseList - The accumulating final schedule
  /// outputs:
  ///   boolean - Returns true if scheduling was successful, false otherwise
  ///

  // Base case: all units have been scheduled
  if (unitIndex >= units.length) {
    return true;
  }

  // Get the current unit to schedule
  const currentUnit = units[unitIndex];

  // Initialize the schedule for the current unit
  initializeUnitSchedule(currentUnit, finalSchedule);

  // Sort activities to prioritize those with fewer options
  sortActivitiesByCourseOptions(currentUnit.activities);

  // Start scheduling activities for the current unit
  return scheduleActivities(
    0,
    currentUnit,
    units,
    unitIndex,
    scheduledTimesPerDay,
    finalSchedule
  );
}




function initializeUnitSchedule(
  currentUnit: {
    unitCode: string;
    unitName: string;
    activities: {
      activityType: string;
      courses: Course[];
    }[];
  },
  finalSchedule: FilteredCourseList
): void {
  //// Function to initialize the schedule for a unit
  ///
  /// inputs:
  ///   currentUnit: Unit - The current unit being scheduled
  ///   finalSchedule: FilteredCourseList - The accumulating final schedule
  /// outputs:
  ///   void
  ///

  finalSchedule[currentUnit.unitCode] = {
    unitName: currentUnit.unitName,
    courses: [],
  };
}


function sortActivitiesByCourseOptions(
  activities: Array<{
    activityType: string;
    courses: Course[];
  }>
): void {
  //// Function to sort activities by the number of available course options
  ///
  /// inputs:
  ///   activities: Array<Activity> - The list of activities to sort
  /// outputs:
  ///   void (the activities array is sorted in place)
  ///

  activities.sort(
    (activityA, activityB) => activityA.courses.length - activityB.courses.length
  );
}



function scheduleActivities(
  activityIndex: number,
  currentUnit: {
    unitCode: string;
    unitName: string;
    activities: {
      activityType: string;
      courses: Course[];
    }[];
  },
  units: Array<{
    unitCode: string;
    unitName: string;
    activities: {
      activityType: string;
      courses: Course[];
    }[];
  }>,
  unitIndex: number,
  scheduledTimesPerDay: CourseTimes,
  finalSchedule: FilteredCourseList
): boolean {
  // Base case: all activities for this unit have been scheduled
  if (activityIndex >= currentUnit.activities.length) {
    // Move on to schedule the next unit
    return scheduleUnits(
      unitIndex + 1,
      units,
      scheduledTimesPerDay,
      finalSchedule
    );
  }
  //// Recursive function to schedule activities within a unit
  ///
  /// inputs:
  ///   activityIndex: number - The index of the activity to schedule
  ///   currentUnit: Unit - The current unit being scheduled
  ///   units: Array<Unit> - The array of all units
  ///   unitIndex: number - The index of the current unit
  ///   scheduledTimesPerDay: CourseTimes - The times already scheduled
  ///   finalSchedule: FilteredCourseList - The accumulating final schedule
  /// outputs:
  ///   boolean - Returns true if scheduling was successful, false otherwise
  ///


  const activity = currentUnit.activities[activityIndex];

  // Try each course option for the current activity
  for (const course of activity.courses) {
    // Parse course times
    const { startTime, endTime } = parseCourseTimes(course.time);

    const scheduledTimes = scheduledTimesPerDay[course.day];

    // Check for time conflicts
    if (!hasTimeConflict(scheduledTimes, startTime, endTime)) {
      // Tentatively schedule the course
      scheduleCourse(
        currentUnit.unitCode,
        course,
        startTime,
        endTime,
        scheduledTimes,
        finalSchedule
      );

      // Attempt to schedule the next activity
      if (
        scheduleActivities(
          activityIndex + 1,
          currentUnit,
          units,
          unitIndex,
          scheduledTimesPerDay,
          finalSchedule
        )
      ) {
        return true;
      }

      // Backtracking: remove the tentatively scheduled course and time
      unscheduleCourse(
        currentUnit.unitCode,
        scheduledTimes,
        finalSchedule
      );
    }
  }

  // Unable to schedule this activity without conflicts
  return false;
}



function parseCourseTimes(
  timeRange: string
): { startTime: Date; endTime: Date } {
  //// Function to parse start and end times from a time string
  ///
  /// inputs:
  ///   timeRange: string - A string representing the time range (e.g., "9:00am - 10:30am")
  /// outputs:
  ///   { startTime: Date; endTime: Date } - The parsed start and end times as Date objects
  ///

  const [startTimeStr, endTimeStr] = timeRange.split(" - ");
  const startTime = parseCourseTime(startTimeStr);
  const endTime = parseCourseTime(endTimeStr);
  return { startTime, endTime };
}



function hasTimeConflict(
  scheduledTimes: Array<{
    start: Date;
    end: Date;
    unitCode: string;
    activity: string;
  }>,
  startTime: Date,
  endTime: Date
): boolean {
  //// Function to check for time conflicts on a given day
  ///
  /// inputs:
  ///   scheduledTimes: Array<{ start: Date; end: Date; unitCode: string; activity: string }>
  ///   startTime: Date - The start time of the course to schedule
  ///   endTime: Date - The end time of the course to schedule
  /// outputs:
  ///   boolean - Returns true if there is a conflict, false otherwise
  ///

  for (const scheduled of scheduledTimes) {
    if (startTime < scheduled.end && endTime > scheduled.start) {
      return true;
    }
  }
  return false;
}



function scheduleCourse(
  unitCode: string,
  course: Course,
  startTime: Date,
  endTime: Date,
  scheduledTimes: Array<{
    start: Date;
    end: Date;
    unitCode: string;
    activity: string;
  }>,
  finalSchedule: FilteredCourseList
): void {
  //// Function to tentatively schedule a course
  ///
  /// inputs:
  ///   unitCode: string - The code of the unit
  ///   course: Course - The course to schedule
  ///   startTime: Date - The start time of the course
  ///   endTime: Date - The end time of the course
  ///   scheduledTimes: Array<ScheduledTime> - The array of scheduled times for the day
  ///   finalSchedule: FilteredCourseList - The accumulating final schedule
  /// outputs:
  ///   void
  ///

  finalSchedule[unitCode].courses.push(course);
  scheduledTimes.push({
    start: startTime,
    end: endTime,
    unitCode: unitCode,
    activity: course.activity,
  });
}



function unscheduleCourse(
  unitCode: string,
  scheduledTimes: Array<{
    start: Date;
    end: Date;
    unitCode: string;
    activity: string;
  }>,
  finalSchedule: FilteredCourseList
): void {
  //// Function to remove a tentatively scheduled course during backtracking
  ///
  /// inputs:
  ///   unitCode: string - The code of the unit
  ///   scheduledTimes: Array<ScheduledTime> - The array of scheduled times for the day
  ///   finalSchedule: FilteredCourseList - The accumulating final schedule
  /// outputs:
  ///   void
  ///

  finalSchedule[unitCode].courses.pop();
  scheduledTimes.pop();
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




