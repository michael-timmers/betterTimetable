"use server";

import axios from 'axios';
import * as cheerio from "cheerio"; // Use named import

export async function getCourses(unitCode: string, selectedPeriod: string) {
  try {
    // Dynamically update the URL using the unitCode and selectedPeriod
    const url = `https://qutvirtual3.qut.edu.au/qvpublic/ttab_unit_search_p.process_search?p_unit=${unitCode}&p_unit_description=&p_time_period_id=${selectedPeriod}&p_arg_names=Class+timetable+search&p_arg_values=%2Fttab_unit_search_p.show_search_adv%3F`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const coursesList = [];

    // Extract the unit name (from the second <h2> tag after the description)
    const unitName = $('h2').eq(1).text().trim(); // `.eq(1)` targets the second <h2> element. The first one is the semester it on
    // console.log("Unit Name: ", unitName); // For debugging

    // Correcting the selector for the timetable table (use the correct class 'qv_table')
    $('table.qv_table tr').each((index, element) => {
      if (index === 0) return; // Skip header row

      const course = {
        classType: $(element).find('td').eq(0).text().trim(),
        activity: $(element).find('td').eq(1).text().trim(),
        day: $(element).find('td').eq(2).text().trim(),
        time: $(element).find('td').eq(3).text().trim(),
        location: $(element).find('td').eq(4).text().trim(),
        teachingStaff: $(element).find('td').eq(5).text().trim(),
      };

      coursesList.push(course);
    });

    // Returning both the unit name and courses
    return { unitName, coursesList };
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error('Failed to fetch courses');
  }
}
