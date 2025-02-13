"use server";

import { drizzle } from "drizzle-orm/mysql2";
import { sessions, users } from "../db/schema"; // Include users table
import { eq, gt } from "drizzle-orm";
import { cookies } from "next/headers"; // To access cookies
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

// Function to validate the session using the session token stored in cookies
export async function validateSession() {
  try {
    // Await the cookies() call
    // console.log("Attempting to retrieve cookies...");
    const cookieStore = await cookies(); 
    const sessionToken = cookieStore.get("sessionToken");

    // console.log("Session token retrieved:", sessionToken);

    if (!sessionToken) {
      // console.log("No session token found. Returning user: null.");
      return { user: null }; // No session token found
    }

    // Query the sessions table to check if the session exists and is still valid
    // console.log("Querying the sessions table for sessionToken:", sessionToken);
    const sessionQuery = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionToken))
      .where(gt(sessions.expiresAt, new Date())) // Ensure session is not expired
      .limit(1)
      .execute();

    // console.log("Session query result:", sessionQuery);

    if (sessionQuery.length === 0) {
      // console.log("Session not valid or expired. Returning user: null.");
      return { user: null }; // Session not valid or expired
    }

    // If session is valid, fetch the user's profile
    const userId = sessionQuery[0].userId;
    // console.log("Session is valid. Retrieving user profile for userId:", userId);
    
    const userQuery = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .execute();

    // console.log("User query result:", userQuery);

    if (userQuery.length === 0) {
      // console.log("User not found. Returning user: null.");
      return { user: null }; // User not found
    }

    // Return the user profile
    const user = userQuery[0];
    // console.log("User found:", user);
    return { user };
  } catch (error) {
    // console.error("Session validation error:", error);
    return { user: null }; // Return null if error occurs
  }
}

// Function to log out by removing the session from the database
export async function logout() {
  try {
    // Get session token from cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sessionToken");

    if (!sessionToken) {
      return { success: false, message: "No session token found." };
    }

    // Log the value of session token to help with debugging
    console.log("Attempting to log out. Removing session with token:", sessionToken.value);

    // Remove session from the database using the correct token value
    await db.delete(sessions).where(eq(sessions.id, sessionToken.value)).execute();
    console.log("Session deleted successfully.");

    // Clear session token from cookies
    cookieStore.delete("sessionToken");

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: "Something went wrong." };
  }
}