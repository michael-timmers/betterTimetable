const filterCourseList = (courseList) => {
  let filteredCourses = {};
  let courseTimes = {}; // Tracks selected course times by day

  // Initialize courseTimes
  ["MON", "TUE", "WED", "THU", "FRI"].forEach(day => {
    courseTimes[day] = [];
  });

  Object.keys(courseList).forEach((unitCode) => {
    filteredCourses[unitCode] = {
      unitName: courseList[unitCode].unitName,
      courses: []
    };

    let selectedActivities = new Set(); // Keeps track of selected activity types for the unit
    let unitCourses = courseList[unitCode].courses;

    // Group courses by activity type (e.g., "LEC", "TUT", etc.)
    let activityGroups = {};
    unitCourses.forEach((course) => {
      if (!activityGroups[course.activity]) {
        activityGroups[course.activity] = [];
      }
      activityGroups[course.activity].push(course);
    });

    // Process each activity type
    Object.keys(activityGroups).forEach((activityType) => {
      let chosenCourse = null;

      // Step 1: Try to find a course that doesn't clash
      for (let course of activityGroups[activityType]) {
        const [startTime, endTime] = course.time.split(" - ");
        const courseStart = new Date(`1970-01-01T${startTime}`);
        const courseEnd = new Date(`1970-01-01T${endTime}`);

        let hasConflict = courseTimes[course.day].some((selected) => {
          return (
            (courseStart < selected.end && courseEnd > selected.start) // Time overlap
          );
        });

        if (!hasConflict) {
          chosenCourse = course;
          break;
        }
      }

      // Step 2: If all options conflict, pick the first one (must have at least one)
      if (!chosenCourse) {
        chosenCourse = activityGroups[activityType][0];
      }

      // Add selected course to filtered list
      filteredCourses[unitCode].courses.push(chosenCourse);
      selectedActivities.add(activityType);

      // Register this course's time in the global tracker
      const [finalStartTime, finalEndTime] = chosenCourse.time.split(" - ");
      const selectedStart = new Date(`1970-01-01T${finalStartTime}`);
      const selectedEnd = new Date(`1970-01-01T${finalEndTime}`);

      courseTimes[chosenCourse.day].push({
        start: selectedStart,
        end: selectedEnd,
        unitCode: unitCode,
        activityType: activityType
      });

      // Step 3: If conflicts exist, try to swap the conflicting class
      courseTimes[chosenCourse.day] = courseTimes[chosenCourse.day].sort((a, b) => a.start - b.start); // Keep times ordered
    });
  });

  return filteredCourses;
};

export default filterCourseList;
