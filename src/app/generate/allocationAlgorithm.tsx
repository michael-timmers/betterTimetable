const filterCourseList = (courseList) => {
  let filteredCourses = {};
  let courseTimes = []; // Tracks globally selected courses' times to avoid duplicates

  Object.keys(courseList).forEach((unitCode) => {
    filteredCourses[unitCode] = {
      unitName: courseList[unitCode].unitName,
      courses: []
    };

    let selectedActivities = new Set(); // Keeps track of selected activity types for the unit
    let selectedCourses = []; // Stores selected courses for time conflict checking within the unit

    courseList[unitCode].courses.forEach((course) => {
      const activityType = course.activity;
      const courseStart = new Date(`1970-01-01T${course.startTime}`); // Convert time to comparable Date object
      const courseEnd = new Date(`1970-01-01T${course.endTime}`);

      // Skip this course if we already selected a course for this activity type
      if (!selectedActivities.has(activityType)) {
        // Check for time conflicts with other courses in the same unit
        let hasConflict = selectedCourses.some((selectedCourse) => {
          const selectedStart = new Date(`1970-01-01T${selectedCourse.startTime}`);
          const selectedEnd = new Date(`1970-01-01T${selectedCourse.endTime}`);

          return (courseStart < selectedEnd && courseEnd > selectedStart); // Time overlap
        });

        // If no conflict within the unit, add the course and mark the activity as selected
        if (!hasConflict) {
          selectedCourses.push(course);
          selectedActivities.add(activityType); // Ensure only one course of each activity type is selected
          filteredCourses[unitCode].courses.push(course);

          // Add this course's time slot to global time tracking to prevent duplicates across all units
          courseTimes.push({
            start: courseStart,
            end: courseEnd,
            unitCode: unitCode,
            activityType: activityType
          });
        }
      }
    });
  });

  return filteredCourses;
};

export default filterCourseList;
