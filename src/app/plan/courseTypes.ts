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
  