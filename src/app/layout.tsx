import type { Metadata } from "next";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import "../../styling/globals.css";
import { validateSession } from "../auth/sessionManager"; // Import the validateSession function

export const metadata: Metadata = {
  title: "BetterTimetable",
  description: "BetterTimetable for Code Network",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  const { user } = await validateSession(); // Check the session on the server side
  
  return (
    <html lang="en">
    <body>
      <Navbar user={user} />
      <main>
          {children}
      </main>
      <Footer />
    </body>
  </html>
  );
}
