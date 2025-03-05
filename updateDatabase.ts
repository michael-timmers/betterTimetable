import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./src/db/schema";

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL!,
    connectionLimit: 10,
});

const db = drizzle(pool);

async function main() {
    try {
        console.log("Starting database update...");
        const response = await db.select().from(users);
        console.log("result:");
        console.log(response);
    } catch {
        console.log("something went wrong");
    } finally {
        await pool.end();
    }
}

main().catch(console.error);