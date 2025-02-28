import { parseCourseTime } from "./helperFunctions";



// scheduleUnits(unitDomains, scheduledTimesPerDay, finalSchedule)

// ├── **Base Case:** If all units are scheduled:
// │     └── Return true (scheduling successful)
// │
// ├── **Select Next Unit U Using MRV:**
// │     ├── Units are dynamically ordered based on current domains
// │     └── U is the unit with the minimum total number of remaining course options
// │
// ├── **Initialize Unit in Final Schedule:**
// │     └── Add U to finalSchedule with empty courses array
// │
// ├── **Sort Activities in U Using MRV:**
// │     └── Activities in U are ordered based on the number of remaining course options
// │
// ├── **Schedule Activities for Unit U:**
// │     └── **scheduleActivities(U, activityIndex, unitDomains, scheduledTimesPerDay, finalSchedule)**
// │
// │       ├── **Base Case:** If all activities in U are scheduled:
// │       │     └── Recursively call scheduleUnits with remainingUnits
// │       │           ├── If success, return true
// │       │           └── Else, backtrack
// │       │
// │       ├── **For Activity A at activityIndex in U:**
// │       │     ├── **Order Courses in A Using LCV:**
// │       │     │     └── Courses are ordered based on their impact on future options
// │       │     │
// │       │     ├── **For Each Course C in Ordered Courses of A:**
// │       │     │
// │       │     │   ├── **Check for Time Conflicts with Scheduled Courses:**
// │       │     │   │     └── If conflict exists, continue to next C
// │       │     │   │
// │       │     │   ├── **Apply Forward Checking:**
// │       │     │   │     ├── Temporarily prune conflicting courses from future unit domains
// │       │     │   │     ├── If any unit domain becomes empty:
// │       │     │   │     │     └── Undo pruning and continue to next C
// │       │     │   │     └── Proceed if domains are valid
// │       │     │   │
// │       │     │   ├── **Tentatively Assign C to A:**
// │       │     │   │     ├── Add C to finalSchedule[U.unitCode].courses
// │       │     │   │     ├── Add scheduled time to scheduledTimesPerDay
// │       │     │   │
// │       │     │   ├── **Recursively Schedule Next Activity:**
// │       │     │   │     ├── Call scheduleActivities(U, activityIndex + 1, prunedDomains, scheduledTimesPerDay, finalSchedule)
// │       │     │   │     ├── If success, return true
// │       │     │   │     └── Else, backtrack
// │       │     │   │
// │       │     │   ├── **Backtrack:**
// │       │     │   │     ├── Remove C from finalSchedule[U.unitCode].courses
// │       │     │   │     └── Remove scheduled time from scheduledTimesPerDay
// │       │     │
// │       │     └── **If All Courses Tried and Failed:**
// │       │           └── Return false (unable to schedule this activity)
// │       │
// │       └── **Return:** If scheduling activities successful, return true; else, backtrack
// │
// ├── **Conflict-Directed Backjumping:**
// │     └── If unable to schedule U, return false to backtrack to previous unit
// │
// └── **If No Units Can Be Scheduled Without Conflict:**
//       └── Return false (schedule not possible)













/// ----------------------------------------------------------------------------------------------------- ///
/// 
///                                      INTERFACES
///             these are used to provide structure to our data for type safety
///
/// ----------------------------------------------------------------------------------------------------- ///





/**
 * Interface representing an individual course session (e.g., a lecture or tutorial).
 * This structure holds all the details necessary to identify and schedule the course.
 */
interface Course {
  id: string;            // Unique identifier for the course session
  unitCode: string;      // Code of the unit/course (e.g., "CAB202")
  unitName: string;      // Full name of the unit/course
  classType: string;     // Description of the class type and weeks (e.g., "Lecture (Week 1-13) - On Campus Class (Internal Mode)")
  activity: string;      // Specific activity code (e.g., "LEC" for Lecture, "TUT" for Tutorial)
  day: string;           // Day of the week in abbreviated form (e.g., "MON", "TUE", "WED")
  time: string;          // Time range of the session (e.g., "02:00pm - 04:00pm")
  room: string;          // Room or location where the session is held (e.g., "GP Z411")
  teachingStaff: string; // Name(s) of the instructor(s) or teaching staff
}

/**
 * Interface representing a scheduled time slot to keep track of occupied periods.
 * Used to detect and prevent scheduling conflicts.
 */
interface ScheduledTime {
  start: Date;        // Start time of the scheduled course session
  end: Date;          // End time of the scheduled course session
  unitCode: string;   // Code of the unit/course associated with this time slot
  activity: string;   // Activity code corresponding to the course session (e.g., "LEC", "TUT")
}

/**
 * Interface for tracking scheduled times per day.
 * Maps each day of the week to an array of ScheduledTime objects representing occupied time slots.
 * This structure helps in efficiently checking for conflicts on any given day.
 */
interface CourseTimes {
  [day: string]: ScheduledTime[]; // e.g., "MON": [{...}, {...}]
}

/**
 * Interface representing the final schedule after filtering and scheduling courses.
 * Maps each unit code to its selected courses, each containing the unit details and chosen timeslot.
 */
interface FilteredCourseList {
  [unitCode: string]: { // Key is the unit code (e.g., "CAB202")
    unitName: string;   // Full name of the unit/course
    courses: Course[];  // Array of selected courses for this unit (ideally one per activity type)
  };
}

/**
 * Interface representing the available courses (domains) for units and their activities.
 * Used in the scheduling algorithm to keep track of remaining options and apply heuristics.
 */
interface UnitDomain {
  unitCode: string;             // Code of the unit/course (e.g., "CAB202")
  unitName: string;             // Full name of the unit/course
  activities: ActivityDomain[]; // Array of activity domains associated with this unit
}

/**
 * Interface representing the available courses (domains) for a specific activity within a unit.
 * Contains the activity type and the list of possible course sessions for scheduling.
 */
interface ActivityDomain {
  activityType: string; // Type of activity (e.g., "LEC" for Lecture, "TUT" for Tutorial)
  courses: Course[];    // Array of available course sessions for this activity type
}



/// -----------------------------------------------------------------------------------------------------
///
///                                      RECURSIVE FUNCTIONS
///         These are used to allocate timeslots without clashes, incorporating optimizations
///
/// -----------------------------------------------------------------------------------------------------

export default function scheduleUnits(
  unitDomains: UnitDomain[],
  scheduledTimesPerDay: CourseTimes,
  finalSchedule: FilteredCourseList
): boolean {
  //// Function to recursively schedule units using MRV heuristic
  ///
  /// inputs:
  ///   unitDomains: UnitDomain[] - Array of units with their current course options
  ///   scheduledTimesPerDay: CourseTimes - Current scheduled times per day
  ///   finalSchedule: FilteredCourseList - Accumulating final schedule
  /// outputs:
  ///   boolean - Returns true if scheduling was successful, false otherwise
  ///

  // Base case: all units have been scheduled
  if (unitDomains.length === 0) {
    return true;
  }

  // Select the next unit U with Minimum Remaining Values (MRV)
  const unitToSchedule = selectNextUnit(unitDomains);

  // Remove the selected unit from the domain list
  const remainingUnits = unitDomains.filter(
    (unit) => unit.unitCode !== unitToSchedule.unitCode
  );

  // Initialize the final schedule entry for the unit
  finalSchedule[unitToSchedule.unitCode] = {
    unitName: unitToSchedule.unitName,
    courses: [],
  };

  // Sort activities to prioritize those with fewer options (MRV within the unit)
  unitToSchedule.activities.sort(
    (a, b) => a.courses.length - b.courses.length
  );

  // Schedule activities for the unit
  if (
    scheduleActivities(
      unitToSchedule,
      0,
      remainingUnits,
      scheduledTimesPerDay,
      finalSchedule
    )
  ) {
    return true;
  } else {
    // Conflict-directed backjumping
    return false;
  }
}



function selectNextUnit(units: UnitDomain[]): UnitDomain {
  //// Function to select the next unit to schedule using MRV heuristic
  ///
  /// inputs:
  ///   units: UnitDomain[] - Array of units with their current course options
  /// outputs:
  ///   UnitDomain - The unit selected to schedule next
  ///

  units.sort(
    (a, b) =>
      totalDomainSize(a.activities) - totalDomainSize(b.activities)
  );
  return units[0];
}



function totalDomainSize(activities: ActivityDomain[]): number {
  //// Function to calculate the total number of course options across all activities
  ///
  /// inputs:
  ///   activities: ActivityDomain[] - Array of activities for a unit
  /// outputs:
  ///   number - The total number of course options
  ///

  return activities.reduce((acc, activity) => acc + activity.courses.length, 0);
}



function scheduleActivities(
  unit: UnitDomain,
  activityIndex: number,
  unitDomains: UnitDomain[],
  scheduledTimesPerDay: CourseTimes,
  finalSchedule: FilteredCourseList
): boolean {
  //// Function to recursively schedule activities of a unit
  ///
  /// inputs:
  ///   unit: UnitDomain - The unit being scheduled
  ///   activityIndex: number - The index of the activity to schedule
  ///   unitDomains: UnitDomain[] - Remaining units to schedule
  ///   scheduledTimesPerDay: CourseTimes - Current scheduled times per day
  ///   finalSchedule: FilteredCourseList - Accumulating final schedule
  /// outputs:
  ///   boolean - Returns true if scheduling was successful, false otherwise
  ///

  // Base case: all activities for this unit have been scheduled
  if (activityIndex >= unit.activities.length) {
    // Proceed to schedule the next unit
    return scheduleUnits(unitDomains, scheduledTimesPerDay, finalSchedule);
  }

  const activity = unit.activities[activityIndex];

  // Order courses by Least Constraining Value (LCV)
  const orderedCourses = orderCoursesByLCV(activity.courses, unitDomains);

  // Try each course option for the current activity
  for (const course of orderedCourses) {
    // Parse course times
    const { startTime, endTime } = parseCourseTimes(course.time);

    const scheduledTimes = scheduledTimesPerDay[course.day];

    // Check for time conflicts
    if (!hasTimeConflict(scheduledTimes, startTime, endTime)) {
      // Apply forward checking
      const prunedDomains = applyForwardChecking(
        unitDomains,
        course,
        startTime,
        endTime,
        course.day
      );

      if (domainsAreEmpty(prunedDomains)) {
        // Domains are empty after forward checking; undo and continue
        continue;
      }

      // Tentatively schedule the course
      finalSchedule[unit.unitCode].courses.push(course);
      scheduledTimes.push({
        start: startTime,
        end: endTime,
        unitCode: unit.unitCode,
        activity: course.activity,
      });

      // Recursively schedule the next activity
      if (
        scheduleActivities(
          unit,
          activityIndex + 1,
          prunedDomains,
          scheduledTimesPerDay,
          finalSchedule
        )
      ) {
        return true;
      }

      // Backtrack: remove the tentatively scheduled course and time
      finalSchedule[unit.unitCode].courses.pop();
      scheduledTimes.pop();
    }
  }

  // Unable to schedule this activity without conflicts
  return false;
}



function orderCoursesByLCV(
  courses: Course[],
  unitDomains: UnitDomain[]
): Course[] {
  //// Function to order courses based on Least Constraining Value heuristic
  ///
  /// inputs:
  ///   courses: Course[] - Array of possible courses for an activity
  ///   unitDomains: UnitDomain[] - Remaining units to schedule
  /// outputs:
  ///   Course[] - Ordered array of courses
  ///

  // Order the courses based on the least constraining value
  return courses.sort((a, b) => {
    const impactA = calculateImpact(a, unitDomains);
    const impactB = calculateImpact(b, unitDomains);
    return impactA - impactB;
  });
}



function calculateImpact(course: Course, unitDomains: UnitDomain[]): number {
  //// Function to calculate the impact of selecting a course on future options
  ///
  /// inputs:
  ///   course: Course - The course being considered
  ///   unitDomains: UnitDomain[] - Remaining units to schedule
  /// outputs:
  ///   number - The number of options eliminated by selecting this course
  ///

  // Calculate how many options will be eliminated in other units if this course is selected
  let impact = 0;

  const { startTime, endTime } = parseCourseTimes(course.time);
  const courseDay = course.day;

  for (const unit of unitDomains) {
    for (const activity of unit.activities) {
      for (const otherCourse of activity.courses) {
        if (otherCourse.day !== courseDay) continue;
        const { startTime: otherStart, endTime: otherEnd } = parseCourseTimes(
          otherCourse.time
        );
        if (startTime < otherEnd && endTime > otherStart) {
          impact++;
        }
      }
    }
  }

  return impact;
}



function applyForwardChecking(
  unitDomains: UnitDomain[],
  course: Course,
  startTime: Date,
  endTime: Date,
  day: string
): UnitDomain[] {
  //// Function to apply forward checking by pruning conflicting options in future units
  ///
  /// inputs:
  ///   unitDomains: UnitDomain[] - Remaining units to schedule
  ///   course: Course - The course being tentatively scheduled
  ///   startTime: Date - Start time of the course
  ///   endTime: Date - End time of the course
  ///   day: string - Day of the week for the course
  /// outputs:
  ///   UnitDomain[] - Pruned unit domains after forward checking
  ///

  // Create a deep copy of unitDomains to prune
  const prunedDomains = unitDomains.map((unit) => ({
    ...unit,
    activities: unit.activities.map((activity) => ({
      ...activity,
      courses: activity.courses.filter((c) => {
        if (c.day !== day) return true;
        const { startTime: cStart, endTime: cEnd } = parseCourseTimes(c.time);
        // Exclude courses that conflict with the current course
        return !(startTime < cEnd && endTime > cStart);
      }),
    })),
  }));

  return prunedDomains;
}



function domainsAreEmpty(unitDomains: UnitDomain[]): boolean {
  //// Function to check if any unit has no valid courses remaining
  ///
  /// inputs:
  ///   unitDomains: UnitDomain[] - Units with their current course options
  /// outputs:
  ///   boolean - Returns true if any unit has an empty domain, false otherwise
  ///

  // Check if any unit has no courses left to schedule
  for (const unit of unitDomains) {
    for (const activity of unit.activities) {
      if (activity.courses.length === 0) {
        return true;
      }
    }
  }
  return false;
}



function parseCourseTimes(
  timeRange: string
): { startTime: Date; endTime: Date } {
  //// Function to parse course time strings into start and end Date objects
  ///
  /// inputs:
  ///   timeRange: string - Time range string (e.g., "9:00am - 10:30am")
  /// outputs:
  ///   { startTime: Date; endTime: Date } - Parsed start and end times
  ///

  const [startTimeStr, endTimeStr] = timeRange.split(" - ");
  const startTime = parseCourseTime(startTimeStr);
  const endTime = parseCourseTime(endTimeStr);
  return { startTime, endTime };
}



function hasTimeConflict(
  scheduledTimes: ScheduledTime[],
  startTime: Date,
  endTime: Date
): boolean {
  //// Function to check for time conflicts with already scheduled courses
  ///
  /// inputs:
  ///   scheduledTimes: ScheduledTime[] - Scheduled times for a specific day
  ///   startTime: Date - Start time of the course being considered
  ///   endTime: Date - End time of the course being considered
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
