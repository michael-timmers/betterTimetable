import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./src/db/schema";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 10;

// Create MySQL Connection Pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  connectionLimit: 10,
});

const db = drizzle(pool);

async function main() {
  try {
    console.log("Seeding database...");
    
    // Hash passwords
    const hashedPassword1 = await bcrypt.hash("123", SALT_ROUNDS);
    const hashedPassword2 = await bcrypt.hash("456", SALT_ROUNDS);

    // Insert users with UUIDs
    await db.insert(users).values([
      {
        id: uuidv4(),
        username: "abc",
        passwordHash: hashedPassword1,
        title: "Mr",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        admin: true,
      },
      {
        id: uuidv4(),
        username: "def",
        passwordHash: hashedPassword2,
        title: "Ms",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        admin: false,
      },
    ]);

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
