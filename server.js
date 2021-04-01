require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const port = 3000;
const { initialize, client } = require("./db.js");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.post("/course", (req, res) => {
  const { name, image } = req.body;
  client.query(
    `
        INSERT INTO Course (course_name, num_grades)
        VALUES ("${name}", 0)
    `,
    async (err, result, _) => {
      if (err) {
        return res.send(400);
      }
      let lambdaRes = await axios({
        method: "POST",
        url: process.env.LAMBDA_URL,
        data: {
          name,
          image,
        },
      });
      if (lambdaRes.data) {
        client.query(
          `   
            UPDATE Course
            SET course_image_url = "${lambdaRes.data.url}"
            WHERE course_id = ${result.insertId}
            `,
          (err, results, fields) => {
            if (err) {
              res.send(400);
            }
            res.send({
              course_id: result.insertId,
            });
          }
        );
      }
    }
  );
});
app.get("/course/:course_id", (req, res) => {
  client.query(
    `
      SELECT *
      FROM course
      WHERE course_id=${req.params.course_id}
      `,
    (err, results, fields) => {
      res.send({ course: results[0] });
    }
  );
});
app.post("/grade", (req, res) => {
  client.query(
    `
        INSERT INTO Grade
        VALUES(${req.body.course_id}, ${req.body.grade})
        `,
    (err, results, fields) => {
      client.query(
        `
          UPDATE Course
          SET num_grades = num_grades + 1
          WHERE course_id = ${req.body.course_id}
          `,
        (err, results, fields) => {
          res.send(200);
        }
      );
    }
  );
});
app.get("/course/:course_id/average", (req, res) => {
  client.query(
    `
    SELECT grade
    FROM Grade
    WHERE course_id=${req.params.course_id}`,
    (err, results, fields) => {
      const sum = results.reduce((acc, cur) => acc + cur.grade, 0);
      res.send((sum / results.length).toString());
    }
  );
});
app.listen(port, () => {
  initialize();
  console.log(`Example app listening at http://localhost:${port}`);
});
