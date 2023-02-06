const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
// const cookieParser = require('cookie-parser');
const store = new session.MemoryStore();
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(session({
    secret: 'some secret',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
    store
}));

app.use(cors());
app.use(express.json());
// app.use(cookieParser());

app.post("/login", async (req, res) => {
    console.log(req.sessionID);
    try{
       const { id , pwd } = req.body;
       const password_query = await pool.query("SELECT hashed_password FROM user_password WHERE id = $1", [id]);
       if(password_query.rows.length == 0){
            return res.status(401).json({ message: "Login failed." });
       }
       
       const password = password_query.rows[0]['hashed_password'];
        
       if(!bcrypt.compareSync(pwd, password)){
         return res.status(401).json({ message: "Login failed." });
       }
       
       req.session.user = { id: id, pwd: pwd}
       req.session.authenticated = true;
       req.session.withCredentials = true;
       res.send(req.session);

    }catch (err){
        console.error(err.message);
    }
})

app.post("/home", async (req, res) => {

    try{
        const { id } = req.body;
        const student_query = await pool.query("SELECT * FROM student WHERE id = $1", [id]);
        
        const course_query = await pool.query(`
                                                WITH sem_courses AS (
                                                    SELECT r.student_id, c.name AS Course, r.semester, r.year
                                                    FROM registrations r
                                                    LEFT JOIN courses c ON r.course_id = c.id
                                                ), sem_sort AS (
                                                    SELECT student_id, Course, semester, year, 
                                                        ROW_NUMBER() OVER (PARTITION BY student_id, semester ORDER BY year DESC, semester DESC) AS sem_rn
                                                    FROM sem_courses
                                                )
                                                SELECT Course, semester, year
                                                FROM sem_sort
                                                WHERE student_id = $1 AND sem_rn = 1
                                                ORDER BY year DESC, semester DESC;
                                                `, [id]);
        
        const current_course = await pool.query(`SELECT c.name AS Course
                                                 FROM courses c
                                                 LEFT JOIN registrations r ON c.id = r.course_id
                                                 WHERE r.student_id = $1 AND r.semester = 'Spring' AND r.year = '2022';                                           
                                                 `, [id]);                                        

        const data = {
            id: student_query.rows[0]['id'],
            name: student_query.rows[0]['name'],
            dept_name: student_query.rows[0]['dept_name'],
            tot_cred: student_query.rows[0]['tot_cred'],
            courses: course_query.rows,
            current_course: current_course.rows
        }

 
        console.log(student_query.rows[0]);
        res.send(data);
 
     }catch (err){
         console.error(err.message);
     }

});

app.listen(5000, () => {
    console.log("server has started on port 5000")
})