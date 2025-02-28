
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
export interface Course {
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


// Define the course list as a mapping from unit codes to unit data
export interface CourseList {
    [unitCode: string]: UnitData;
  }

// Define the structure for unit data, including the unit name and its courses
export interface UnitData {
    unitName: string;
    courses: Course[]; // List of courses under this unit
}
  
// Define the structure for user preferences
export interface PreferencesData {
    studyTimes: { [key: string]: string[] }; // Maps days to arrays of preferred time slots
    // Add any additional preference properties here
  }
  

/**
 * Interface representing a scheduled time slot to keep track of occupied periods.
 * Used to detect and prevent scheduling conflicts.
 */
  export interface ScheduledTime {
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
  export interface CourseTimes {
    [day: string]: ScheduledTime[]; // e.g., "MON": [{...}, {...}]
  }
  
  /**
   * Interface representing the final schedule after filtering and scheduling courses.
   * Maps each unit code to its selected courses, each containing the unit details and chosen timeslot.
   */
  export interface FilteredCourseList {
    [unitCode: string]: { // Key is the unit code (e.g., "CAB202")
      unitName: string;   // Full name of the unit/course
      courses: Course[];  // Array of selected courses for this unit (ideally one per activity type)
    };
  }
  
  /**
   * Interface representing the available courses (domains) for units and their activities.
   * Used in the scheduling algorithm to keep track of remaining options and apply heuristics.
   */
  export interface UnitDomain {
    unitCode: string;             // Code of the unit/course (e.g., "CAB202")
    unitName: string;             // Full name of the unit/course
    activities: ActivityDomain[]; // Array of activity domains associated with this unit
  }
  
  /**
   * Interface representing the available courses (domains) for a specific activity within a unit.
   * Contains the activity type and the list of possible course sessions for scheduling.
   */
  export interface ActivityDomain {
    activityType: string; // Type of activity (e.g., "LEC" for Lecture, "TUT" for Tutorial)
    courses: Course[];    // Array of available course sessions for this activity type
  }
  
  