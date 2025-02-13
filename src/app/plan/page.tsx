import SearchTimetable from "./showSearchBar";

export default function Home() {
  return (
    <div className="min-h-screen w-full items-center px-12 bg-gray-1000 text-white">
      {/* Display the search functionality component */}
      <SearchTimetable />
    </div>
  );
}
