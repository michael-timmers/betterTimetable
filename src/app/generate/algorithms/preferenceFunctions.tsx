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
///                                      PREFERENCE FUNCTIONS
///          these are used to support our personal needs as students for the filtering algorithm
///
/// ----------------------------------------------------------------------------------------------------- ///



export function filterByStartTime(courseList: CourseList, start: string): FilteredCourseList {
  //// Function to filter courses based on start time preference
  ///
  /// inputs:
  ///   courseList: CourseList - The list of courses to filter
  ///   start: string - The preferred earliest start time (e.g., "9:00am")
  /// outputs:
  ///   FilteredCourseList - The filtered list of courses
  ///

  return courseList;
}


export function filterByEndTime(courseList: CourseList, end: string): FilteredCourseList {

    
  //// Function to filter courses based on end time preference
  ///
  /// inputs:
  ///   courseList: CourseList - The list of courses to filter
  ///   end: string - The preferred latest end time (e.g., "5:00pm")
  /// outputs:
  ///   FilteredCourseList - The filtered list of courses
  ///

  return courseList;
}


export function filterByDays(courseList: CourseList, days: string[]): FilteredCourseList {
  //// Function to filter courses based on preferred days
  ///
  /// inputs:
  ///   courseList: CourseList - The list of courses to filter
  ///   days: string[] - An array of preferred days (e.g., ["MON", "WED"])
  /// outputs:
  ///   FilteredCourseList - The filtered list of courses
  ///

  // Implement filtering logic here

  return courseList;
}



export function filterByClassesPerDay(courseList: CourseList, classesPerDay: number): FilteredCourseList {
  //// Function to filter courses based on the maximum number of classes per day
  ///
  /// inputs:
  ///   courseList: CourseList - The list of courses to filter
  ///   classesPerDay: number - The maximum number of classes allowed per day
  /// outputs:
  ///   FilteredCourseList - The filtered list of courses
  ///

  // Implement filtering logic here

  return courseList;
}


export function filterByBackToBack(courseList: CourseList, backToBack: boolean): FilteredCourseList {
  //// Function to filter courses based on back-to-back preference
  ///
  /// inputs:
  ///   courseList: CourseList - The list of courses to filter
  ///   backToBack: boolean - Preference for back-to-back classes
  /// outputs:
  ///   FilteredCourseList - The filtered list of courses
  ///



  // Implement filtering logic here

  return courseList;
}


