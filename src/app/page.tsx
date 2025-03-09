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
      <div className="min-h-screen flex text-white">
        {/* Left Sidebar */}
        <div className="w-1/4 bg-gray-1100 px-8 py-6">
          <a className="text-xl font-semibold">Home Page</a>
        </div>

        {/* Main Content */}
        <div className="w-3/4 p-12 bg-gray-800">
          <h1 className="text-3xl font-bold mb-4">Course Timetable</h1>

          <h2>📅 Welcome to BetterTimetable</h2>
          <p>
            Welcome to BetterTimetable from Code Network! Whether you’re looking
            to generate a custom schedule, plan out your week, or compare
            different timetables, we’ve got you covered. Let’s dive into the
            features:
          </p>

          <h3 className="pt-8">Generate</h3>
          <p>
            Our <strong>Generate</strong> feature creates a timetable that fits
            your specific needs. Whether you're managing classes, study time, or
            other activities, this tool automatically arranges your schedule for
            you, saving you time and effort. Visit{" "}
            <a href="/generate">/generate</a> to get started with your
            customized timetable.
          </p>

          <h3 className="pt-8">Plan</h3>
          <p>
            With the <strong>Plan</strong> feature, you can take control of your
            schedule! Select your preferred times and build your own timetable
            from scratch, or improve upon a generated one. It's perfect for
            fine-tuning your ideal week! Check it out at{" "}
            <a href="/plan">/plan</a>.
          </p>

          <h3 className="pt-8">Saved</h3>
          <p>
            Have multiple timetables? The <strong>Saved</strong> feature allows
            you to oversee, rename, and delete different schedules to see which
            one works best for you. You can compare factors like days on campus,
            time between classes, and more to ensure you're making the best use
            of your time. Head over to <a href="/saved">/saved</a> to compare
            your saved timetables.
          </p>

          <p className="mt-8">
            We’re here to help you organize your time efficiently! If you need
            any assistance or have questions,{" "}
            <a href="https://discord.gg/4wB924F2Fs">
              join our community on Discord
            </a>{" "}
            for support.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-red-600 text-2xl">
          Failed to fetch course timetable.
        </h1>
      </div>
    );
  }
}
