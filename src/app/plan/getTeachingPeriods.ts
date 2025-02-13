
// ------------------------------------------------
// The complex code below is made in an effort to improve the user experience
// While we give all the options the QUT App does, we will prioritise our results to show
// semester 1 and 2 first (on the QUT App you have to dig for it)

"use server";

import axios from 'axios';
import * as cheerio from "cheerio"; // Use named import

export async function getTeachingPeriods() {
  try {
    const response = await axios.get("https://qutvirtual3.qut.edu.au/qvpublic/ttab_unit_search_p.show_search_adv");
    const $ = cheerio.load(response.data);

    // console.log("Test 1");

    // Select all option elements within the teaching period dropdown
    const options: { text: string, value: string }[] = [];
    $('select[name="p_time_period_id"] option').each((i, element) => {
      const text = $(element).text().trim();
      const value = $(element).attr('value');
      if (text && value) {
        options.push({ text, value });
      }
    });

    // Sort the options:
    // 1. SEM-1 and SEM-2 periods first, sorted by latest year first.
    // 2. Other periods after SEM-1 and SEM-2, sorted alphabetically.
    const sortedOptions = options.sort((a, b) => {
      const aText = a.text.toUpperCase();
      const bText = b.text.toUpperCase();

      // Helper function to extract the year from the text
      const getYear = (text: string) => {
        const match = text.match(/\d{4}/); // Match the year (e.g., 2025)
        return match ? parseInt(match[0], 10) : 0; // Extract the year or 0 if not found
      };

      const aYear = getYear(aText);
      const bYear = getYear(bText);

      // 1. First prioritize SEM-1 and SEM-2 periods (put them first)
      if (aText.startsWith("SEM-1") && !bText.startsWith("SEM-1") && !bText.startsWith("SEM-2")) {
        return -1; // SEM-1 comes first
      }
      if (aText.startsWith("SEM-2") && !bText.startsWith("SEM-1") && !bText.startsWith("SEM-2")) {
        return -1; // SEM-2 comes before others
      }
      if (bText.startsWith("SEM-1") && !aText.startsWith("SEM-1") && !aText.startsWith("SEM-2")) {
        return 1; // SEM-1 comes after others
      }
      if (bText.startsWith("SEM-2") && !aText.startsWith("SEM-1") && !aText.startsWith("SEM-2")) {
        return 1; // SEM-2 comes after others
      }

      // 2. Among SEM-1 and SEM-2, sort by year (latest year first)
      if (aText.startsWith("SEM-1") || aText.startsWith("SEM-2")) {
        return bYear - aYear; // Sort by year in descending order (latest year first)
      }

      // 3. Finally, sort other periods alphabetically
      return aText.localeCompare(bText);
    });

    // console.log("Here are the options:", sortedOptions);

    return sortedOptions;
  } catch (error) {
    console.error("Error fetching teaching periods:", error);
    return [];
  }
}
