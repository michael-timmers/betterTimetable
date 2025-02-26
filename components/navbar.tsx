"use client"; // Required for usePathname()

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react"; // Import useState for dropdown toggle
import { logout as logoutSession } from "../src/auth/sessionManager"; // Import the logout function
import "../styling/globals.css";

export default function Navbar({ user }) {
  const pathname = usePathname(); // Get current route
  const router = useRouter(); // Use router to redirect after logout
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

  // Function to toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const result = await logoutSession();
      if (result.success) {
        router.push("/login");
      } else {
        console.error("Logout failed:", result.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="navbar bg-gray-900 text-white">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost sm:hidden"
            onClick={toggleDropdown} // Toggle dropdown on click
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>

          {/* Links when app is condensed */}
          {isDropdownOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content rounded-box z-[1] mt-3 w-52 p-2 shadow bg-gray-1200"
            >
              <li><a className="text-lg">Home</a></li>
              <li><a className="text-lg">Generate</a></li>
              <li><a className="text-lg">Plan</a></li>
              <li><a className="text-lg">Saved</a></li>
            </ul>
          )}
        </div>

        <Link href="/" className="btn btn-ghost rounded-full text-xl px-6">
          <div className="inline">
            <span className="text-white font-normal">Better</span><span className="text-blue-1000 font-normal inline">Timetable</span>
          </div>
        </Link>
      </div>

      <div className="navbar-center hidden sm:flex">
        <ul className="menu menu-horizontal text-white">
          {[
            { name: "Home", href: "/" },
            { name: "Generate", href: "/generate" },
            { name: "Plan", href: "/plan" },
            { name: "Saved", href: "/saved" },
          ].map(({ name, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`mx-2 px-5 py-2 rounded-full text-lg ${pathname === href ? "active-link" : "hover:bg-gray-700"}`}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end">
        <ul className="menu menu-horizontal pl-1 pr-4">
          {user ? (
            <li>
              <details>
                <summary className="hover:bg-gray-700 rounded-full text-lg">{user.firstName} {user.lastName}</summary>
                <ul className="p-2 text-lg">
                  <li><a>Account</a></li>
                  <li><a>Settings</a></li>
                  <li>
                    <button onClick={handleLogout} className="w-full text-left p-2 rounded-lg">
                      <p className="pl-2 text-lg">Logout</p>
                    </button>
                  </li>
                </ul>
              </details>
            </li>
          ) : (
            <li><a href="/login" className="text-lg">Login</a></li>
          )}
        </ul>
      </div>
    </div>
  );
}
