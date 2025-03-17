export interface Course {
    id: string;
    unitCode: string;
    unitName: string;
    classType: string;
    activity: string;
    day: string;
    time: string;
    room: string;
    teachingStaff: string;
  }
  
  export interface CourseData {
    unitName: string;
    courses: Course[];
  }
  
  export type SelectedCourses = Record<string, Record<string, Course>>;
  


  

export const groupActivitiesByUnit = (
  courseList: Record<string, CourseData>
): Record<string, Record<string, Course[]>> => {
  return Object.entries(courseList).reduce(
    (groupedUnits, [unitCode, unitData]) => {
      // Group courses for the current unit by their activity
      const activities = unitData.courses.reduce(
        (activityGroups: Record<string, Course[]>, course) => {
          // Initialize the activity group if it doesn't exist
          if (!activityGroups[course.activity]) {
            activityGroups[course.activity] = [];
          }
          // Add the current course to the corresponding activity group
          activityGroups[course.activity].push(course);
          return activityGroups;
        },
        {} // Initial accumulator for activity groups
      );

      // Assign the grouped activities to the current unit
      groupedUnits[unitCode] = activities;
      return groupedUnits;
    },
    {}
  );
};



export const getSelectedUnits = (
  selectedCourses: Record<string, Record<string, Course>>,
  courseList: Record<string, CourseData>
): Record<string, { unitName: string; courses: Course[] }> => {
  return Object.entries(selectedCourses).reduce(
    (selectedUnits, [unitCode, coursesForUnit]) => {
      // Convert the selected courses for the current unit into an array
      const selectedCoursesArray = Object.values(coursesForUnit);

      // Only include units with at least one selected course
      if (selectedCoursesArray.length > 0) {
        selectedUnits[unitCode] = {
          unitName: courseList[unitCode].unitName,
          courses: selectedCoursesArray,
        };
      }

      return selectedUnits;
    },
    {}
  );
};


