
const filterCourseList = (courseList) => {
    let filteredCourses = {};
  
    Object.keys(courseList).forEach((unitCode) => {
      filteredCourses[unitCode] = {
        unitName: courseList[unitCode].unitName,
        courses: []
      };
      
      let selectedActivities = new Set();
  
      courseList[unitCode].courses.forEach((course) => {
        const activityType = course.activity;
  
        // Only add the first occurrence of each activity type
        if (!selectedActivities.has(activityType)) {
          selectedActivities.add(activityType);
          filteredCourses[unitCode].courses.push(course);
        }
      });
    });
  
    return filteredCourses;
  };
  
  export default filterCourseList;
  