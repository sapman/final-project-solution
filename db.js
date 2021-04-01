const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DATABASE_PASSWORD,
  database: "courses",
});

connection.connect();

createDatabase = async () => {
  try {
    connection.query(`CREATE TABLE Course ( 
        course_id   int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        course_name varchar(255) NOT NULL UNIQUE,
        course_image_url varchar(255),
        num_grades int
        )`).addListener('error', ()=>{});
    connection.query(
      `CREATE TABLE Grade (
        course_id int NOT NULL,
        grade int NOT NULL,
        FOREIGN KEY (course_id) REFERENCES course(course_id)
        )`
    ).addListener('error', ()=>{});;
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  initialize: createDatabase,
  client: connection,
};
