// Import the ManageTabs component from the current directory
import ManageTabs from "./tabs/manageAllTabs";

// Default export function for the Home page
export default function Home() {
  return (
    // Main container div with styling classes
    <div className="min-h-screen w-full items-center px-12 bg-gray-1000 text-white">
      {/* Render the main application component */}
      <ManageTabs />
    </div>
  );
}
