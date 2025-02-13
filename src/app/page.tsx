import { validateSession } from "../auth/sessionManager";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {

  // const { user } = await validateSession();
  // if (!user) {
  //   return redirect("/login");
  // }

  try {
    // const courseList = await getCourses();

    // console.log("Here is the courseList: ", courseList);

    return (
      <div className="min-h-screen flex">
        {/* Left Sidebar */}
        <div className="w-1/4 bg-gray-1100 px-8 py-6 text-white">
          <a className="text-xl font-semibold">Home Page</a>
        </div>

        {/* Main Content */}
        <div className="w-3/4 p-12 bg-gray-800">
          <h1 className="text-3xl font-bold mb-4">Course Timetable</h1>

          {/* {courseList.length > 0 ? (
            <div>
              {courseList.map((course, index) => (
                <div key={index} className="mb-6 p-6 border border-gray-300 rounded-lg">
                  <h2 className="text-xl font-semibold">{course.day} - {course.time}</h2>
                  <ul className="list-disc pl-5 mt-2">
                    <li><strong>Class Type:</strong> {course.classType}</li>
                    <li><strong>Activity:</strong> {course.activity}</li>
                    <li><strong>Location:</strong> {course.location}</li>
                    <li><strong>Teaching Staff:</strong> {course.teachingStaff || "N/A"}</li>
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-600">No course timetable available.</p>
          )} */}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-red-600 text-2xl">Failed to fetch course timetable.</h1>
      </div>
    );
  }
}
