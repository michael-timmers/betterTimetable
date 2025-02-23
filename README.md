
# BetterTimetable

The BetterTimetable project, developed for Code Network using **NextJS (TypsScript)**, enhances students' experience by creating a user-friendly timetable. It integrates React elements for effective data display and uses server components to process QUT course data into an organized API, which populates timetables based on student preferences.

<br>

## 📌 Features
**Generate**
- Select Units to be included in generated timetable
- Select your personal needs, including which days to have off, earliest and latest class times, etc
- View a generated timetable that suits your needs
  
**Plan**
- Add Units to the Sidebar for consideration
- Hover over unit activities to see all available timeslots
- Select timeslots to be added to the timetable
- See count of required number of activities to be added to timetable
- Save created timetable plans
- Load previously saved timetable plans
  
**Saved**
- See collection of previously saved timetables
- Rename previously saved timetables
- Delete previously saved timetables

  <br>

## 🚀 Install required software
1. Install Git Bash

> https://git-scm.com/downloads


<br>

2. Install GitHub Desktop
   
> https://desktop.github.com/?ref_cta=download+desktop&ref_loc=installing+github+desktop&ref_page=docs

<br>


3. Install Visual Studio Code

> https://code.visualstudio.com/download

<br>


4. Install mySQL Workbench

> https://dev.mysql.com/downloads/installer/

> [!IMPORTANT]
> Important Notes for MySQL Setup:
> - When it asks you for which version, select ‘Full’ version.
> - DO NOT modify network port during MySQL Setup. Ensure it is set to port 3306. If not, reinstall MySQL
> - YOU MUST create a root user with a password during installation. Do not lose these details! (But if you do then simply reinstall MySQL)

<br>

5. Install Node

> https://nodejs.org/en/download

<br><br>



## 🚀 Setup Project on VS Code (after installing software)
1. Open GitHub Desktop App

   <br>
   
2. Clone the repository
```bash
git clone https://github.com/codenetwork/betterTimetable.git
```

<br>

3. Open the project in VS Code

<br>

4. Install necessary dependencies
```bash
npm install
```

<br>

5. Duplicate `.env.example` to `.env` and update the `DATABASE_URL` to have your username, password, and port.

<br><br>


## 🚀 Setup mySQL Database (after installing software)

Part 1 – Create the Database Schema
1. Open MySQL Command Line client by typing in ‘MySQL 8.0 Command Line Client’ to
Windows Searchbar
2. If you click to open the Command Line client, then you will need to insert the password
you created earlier when setting up MySQL Workbench
3. Type the following commands and press enter
```bash
CREATE USER 'BetterTimetable'@'localhost' IDENTIFIED BY
'BetterTimetable1';
GRANT ALL PRIVILEGES ON * . * TO 'BetterTimetable'@'localhost';
FLUSH PRIVILEGES;
CREATE DATABASE betterTimetable;
```

<br>

Part 2 – Populate the Database Schema
1. Open the front-end repository with Visual Studio Code
2. Run command “npm install” in the terminal

<br><br>

## 🖥️ Usage
Running BetterTimetable
1. Run the development server through VS Code Command Line Interface
```bash
npm run dev
```

2. Open your local server via your web browser to see the result
```bash
 http://localhost:3000
```

<br><br>

## 🛠️ Technologies Used
- **TypeScript**: for type-safe JavaScript development.
- **HTML**: for structuring the web pages.
- **CSS**: for global styling
- **Tailwind CSS**: for utility-first CSS framework.
- **React**: as the library for building user interfaces.
- **Drizzle ORM**: for object-relational mapping.
- **SQL**: for database management.

<br><br>

## 🧪 Methodology
API Data Pipeline
- **Get Course Data**: Fetch QUT Course Data to identify activities for each unit and their timeslots
- **Get Teaching Periods**: Fetch QUT Teaching Periods to identify when courses are offered

<br>

Manage Data and Show Timetable
- **Allocate Timeslots**: Extract one timeslot from each given activity that does not clash. Consider student needs when selecting timeslots
- **Output Timetable**: Show a grid output of the given timeslots for the selected units

<br><br>

## 🌟 If You Are Interested
If you have the following skills or if you are simply looking to learn, here's how you can contribute:
- **Front End Developer**: Focus on building user interfaces with React components and styling with CSS or Tailwind CSS. You can contribute by creating new UI elements, optimizing existing ones, and ensuring a responsive design.
- **Back End Developer**: Work on server-side logic using NextJS server components. Help by setting up APIs, managing databases using Drizzle ORM and SQL, and ensuring efficient data processing.
- **Algorithm Designer**: Develop and optimize algorithms for data manipulation, transformation, and retrieval. You can contribute by enhancing the efficiency of the data pipeline and implementing new features that improve performance.
- **UI/UX Designer**: Design user interfaces that are both visually appealing and intuitive. Focus on improving the user experience by creating mockups, wireframes, and user flows to ensure a seamless interaction.
- **QA Tester**: Run the project, identify any issues, and report them. Contribute by finding and fixing bugs, performing testing, and ensuring the overall quality of the project through thorough testing and debugging.
Feel free to contribute and enhance this project!

<br><br>

## Learn More

To learn more about Next.js, Tailwind, and other technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/get-started-mysql) - learn about DrizzleORM syntax
- [TailwindCSS Components](https://tailwindcss.com/docs/installation/using-vite) - learn about TailwindCSS

<br><br>

![Screenshot of a comment on a GitHub issue showing an image, added in the Markdown, of an Octocat smiling and raising a tentacle.](https://media.licdn.com/dms/image/v2/D4E12AQEIqlkU8NSvJg/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1692105491054?e=2147483647&v=beta&t=TmE4P7hBwEMLC-PROEmExcWzuVy4S4mAvZulxTqr5d4)
