"use server";

import { drizzle } from "drizzle-orm/mysql2";
import { units, courses } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

export default async function checkUnits() {
    const db = drizzle(process.env.DATABASE_URL!);

     // Fetch classType and activity for the unit
     const classTimesQuery = await db
     .select({
         classType: courses.classType,
         activity: courses.activity,
     })
     .from(courses)
     .where(eq(courses.unitCode, "CAB202"))
     .execute();

    console.log(`Class times query result: ${JSON.stringify(classTimesQuery)}`);
    
    return(classTimesQuery);
}
