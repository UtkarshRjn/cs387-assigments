const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
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
    try{
       const { id , pwd } = req.body;
       const password_query = await pool.query("SELECT hashed_password FROM user_password WHERE id = $1", [id]);
       if(password_query.rows.length == 0){
            return res.status(401).json({ message: "Login failed." });
       }
       
       const timestamp_query = await pool.query(`SELECT year, semester
                                                FROM reg_dates
                                                WHERE end_time < NOW()
                                                ORDER BY end_time DESC
                                                LIMIT 1;`)

       const isStudent = await pool.query(`SELECT id FROM student WHERE id = $1`, [id]);
       const isInstructor = await pool.query(`SELECT id FROM instructor WHERE id = $1`, [id]);

       const password = password_query.rows[0]['hashed_password'];
        
       if(!bcrypt.compareSync(pwd, password)){
         return res.status(401).json({ message: "Login failed." });
       }

       console.log(timestamp_query.rows[0]);
       
       if (isStudent.rows.length > 0) {
            req.session.user = { id: id, identity: 'student', year: timestamp_query.rows[0]['year'], semester: timestamp_query.rows[0]['semester']};
       } else if (isInstructor.rows.length > 0) {
            req.session.user = { id: id, identity: 'instructor', year: timestamp_query.rows[0]['year'], semester: timestamp_query.rows[0]['semester']};
       }

       req.session.authenticated = true;
       req.session.withCredentials = true;
       res.send(req.session);

    }catch (err){
        console.error(err.message);
    }
})

app.post("/home", async (req, res) => {

    try{
        const { id , year ,semester} = req.body;
        const student_query = await pool.query("SELECT * FROM student WHERE id = $1", [id]);
        
        const course_query = await pool.query(`SELECT c.course_id as course_id, c.title AS title , r.semester as semester, r.year as year,c.credits AS credits, r.grade as grade
                                                FROM course c
                                                LEFT JOIN takes r ON c.course_id = r.course_id
                                                WHERE r.ID = $1 and (r.semester <> $2 OR r.year <> $3)
                                                ORDER BY year DESC, semester DESC;
                                                `, [id, semester, year]);
        
        const current_course = await pool.query(`SELECT c.course_id, c.title AS title ,$2::varchar AS semester, $3::integer AS year, c.credits AS credits, r.grade AS grade, r.sec_id as sec_id
                                                 FROM course c
                                                 LEFT JOIN takes r ON c.course_id = r.course_id
                                                 WHERE r.ID = $1 AND r.semester = $2 AND r.year = $3;                                           
                                                 `, [id ,semester ,year]);                                        

        const data = {
            id: student_query.rows[0]['id'],
            name: student_query.rows[0]['name'],
            dept_name: student_query.rows[0]['dept_name'],
            tot_cred: student_query.rows[0]['tot_cred'],
            courses: course_query.rows,
            current_course: current_course.rows
        }

 
        console.log(data);
        res.send(data);
 
     }catch (err){
         console.error(err.message);
     }

});

app.post("/drop", async (req, res) => {

    try{
        const { id , course_id , year, semester} = req.body;

        const drop_query = await pool.query(`DELETE FROM takes WHERE id=$1 and course_id=$2 and semester=$3 and year=$4`, [id, course_id, semester, year]);
 
        const student_query = await pool.query("SELECT * FROM student WHERE id = $1", [id]);
        
        const course_query = await pool.query(`SELECT c.course_id as course_id, c.title AS title , r.semester as semester, r.year as year,c.credits AS credits, r.grade as grade
                                                FROM course c
                                                LEFT JOIN takes r ON c.course_id = r.course_id
                                                WHERE r.ID = $1 and (r.semester <> $2 OR r.year <> $3)
                                                ORDER BY year DESC, semester DESC;
                                                `, [id, semester, year]);
        
        const current_course = await pool.query(`SELECT c.course_id, c.title AS title ,$2::varchar AS semester, $3::integer AS year, c.credits AS credits, r.grade AS grade
                                                 FROM course c
                                                 LEFT JOIN takes r ON c.course_id = r.course_id
                                                 WHERE r.ID = $1 AND r.semester = $2 AND r.year = $3;                                           
                                                 `, [id, semester, year]);                                        

        const data = {
            id: student_query.rows[0]['id'],
            name: student_query.rows[0]['name'],
            dept_name: student_query.rows[0]['dept_name'],
            tot_cred: student_query.rows[0]['tot_cred'],
            courses: course_query.rows,
            current_course: current_course.rows
        }
 
        console.log(data);
        res.send(data);

     }catch (err){
         console.error(err.message);
     }

});

app.post("/instructor", async (req, res) => {

    try{
        const { id , year , semester} = req.body;
        console.log(id);
        const student_query = await pool.query("SELECT * FROM instructor WHERE id = $1", [id]);
        
        const course_query = await pool.query(`
                                                SELECT c.course_id as course_id, title , semester, year
                                                FROM course c
                                                LEFT JOIN teaches ON c.course_id = teaches.course_id
                                                WHERE teaches.ID = $1 and (teaches.semester <> $2 OR teaches.year <> $3)
                                                ORDER BY year DESC, semester DESC;
                                                `, [id, semester, year]);
        

        const current_course = await pool.query(`SELECT c.course_id as course_id, title ,semester, year
                                                FROM course c
                                                LEFT JOIN teaches ON c.course_id = teaches.course_id
                                                WHERE teaches.ID = $1 and semester = $2 and year = $3
                                                ORDER BY course_id;`, [id, semester, year]);                                        

        console.log(current_course.rows);

        const data = {
            name: student_query.rows[0]['name'],
            dept_name: student_query.rows[0]['dept_name'],
            courses: course_query.rows,
            current_course: current_course.rows
        }

        console.log(data);
        res.send(data);
 
     }catch (err){
         console.error(err.message);
     }

});


app.post("/course", async (req, res) => {

    try{
        const { id } = req.body;
        console.log(id);

        const course_query = await pool.query(`WITH course_with_prereq as (SELECT course.course_id, title, dept_name, credits, prereq_id
                                                FROM course
                                                LEFT JOIN prereq
                                                ON course.course_id = prereq.course_id)
                                                SELECT C.course_id, C.title, C.dept_name, C.credits, C.prereq_id, T.id as instructor_id, I.name as instructor_name
                                                FROM course_with_prereq as C 
                                                LEFT JOIN teaches as T
                                                ON C.course_id = T.course_id                            
                                                LEFT JOIN instructor as I
                                                on I.id = T.id
                                                WHERE C.course_id = $1;`, [id]);


        // This part of code takes multiple instructor teaching the same course into consideration

        function isEqual(array1, array2) {
             return JSON.stringify(array1) === JSON.stringify(array2);
        }

        function addToSet(set, array) {
            for (let element of set) {
                if (isEqual(element, array)) {
                return;
                }
            }
            set.add(array);
        }
        
        const instructors = new Set();
        const prereq = new Set();

        for (const elem of course_query.rows) {
            const instr = [elem.instructor_id ,elem.instructor_name ];
            addToSet(instructors , instr);
            prereq.add(elem.prereq_id);
        }

        console.log(instructors)

        const instructorArray = Array.from(instructors);
        const prereqArray = Array.from(prereq);

        console.log(instructorArray)
        
        const data = {
            course_id: course_query.rows[0]['course_id'],
            title: course_query.rows[0]['title'],
            credits: course_query.rows[0]['credits'],
            prereq_id: prereqArray,
            instructors: instructorArray,
        }

        console.log(data);
        res.send(data);
 
     }catch (err){
         console.error(err.message);
     }

});


app.post("/running", async (req, res) => {

    
    try{
        const { year , semester } = req.body;
        const dept_query = await pool.query(`SELECT DISTINCT dept_name
                                                FROM course natural JOIN section
                                                WHERE semester=$1 and year=$2`, [semester, year]);                                      
        

        console.log(dept_query.rows);
        
        res.send(dept_query.rows);
 
     }catch (err){
         console.error(err.message);
     }

});

app.post("/deptName", async (req, res) => {

    try{
        const { dept_name , year, semester } = req.body;
        console.log( dept_name );
        const course_query = await pool.query(`SELECT DISTINCT course_id , title
                                            FROM course natural JOIN section
                                            WHERE semester=$2 and year=$3 and dept_name = $1;`, [dept_name, semester, year]);                                      
        

        console.log(course_query.rows)
        
        res.send(course_query.rows);
 
     }catch (err){
         console.error(err.message);
     }

});

app.post("/search", async (req, res) => {
    try {
      const { courseVal , year, semester } = req.body;
  
      console.log(courseVal)

      const course_query = await pool.query(
        `WITH curr_course AS (
          SELECT *
          FROM section
          NATURAL JOIN course
          WHERE year='${year}' AND semester='${semester}'
        )
        SELECT distinct course_id, sec_id, title
        FROM curr_course
        WHERE course_id ILIKE '%${courseVal}%' OR title ILIKE '%${courseVal}%'`
      );

        console.log(course_query.rows)

        const result = [];
        const courseMap = new Map();
        
        for(const course of course_query.rows){
            if (!courseMap.has(course.course_id)) {
                courseMap.set(course.course_id, {
                  course_id: course.course_id,
                  title: course.title,
                  section_slot: []
                });
            }
            courseMap.get(course.course_id).section_slot.push(course.sec_id);
        }

        for (const course of courseMap.values()) {
            result.push(course);
        }

      console.log(result);
      res.json(result);
    } catch (err) {
      console.error(err.message);
    }
});

app.post("/registration", async (req, res) => {
    
    try {

        const { id , course_id , sec_id , year, semester } = req.body;

        console.log(id, course_id, sec_id);

        const all_course_query = await pool.query(
            `WITH curr_course AS (
                SELECT c.course_id, r.sec_id
                FROM course c
                LEFT JOIN takes r
                ON c.course_id = r.course_id
                WHERE r.id = $1 AND (r.semester <> $2 or r.year <> $3)
            )
            SELECT course_id
            FROM curr_course
            NATURAL JOIN section;`, [id, semester, year]
        );

        const current_course_query = await pool.query(
            `WITH curr_course AS (
                SELECT c.course_id, r.sec_id
                FROM course c
                LEFT JOIN takes r
                ON c.course_id = r.course_id
                WHERE r.id = $1 AND r.semester = $2 AND r.year = $3
            )
            SELECT course_id, time_slot_id
            FROM curr_course
            NATURAL JOIN section;`, [id, semester, year]
        );


        // console.log(current_course_query.rows);
        // console.log(all_course_query.rows);

        const slot_prereq_query = await pool.query(
            `WITH curr_course AS (
                SELECT *
                FROM section
                NATURAL JOIN course
                WHERE year=$3 AND semester=$4
            )
            SELECT curr_course.time_slot_id, prereq.prereq_id
            FROM curr_course LEFT JOIN prereq ON curr_course.course_id = prereq.course_id
            WHERE curr_course.course_id = $1 AND curr_course.sec_id = $2;`, [course_id, sec_id, year, semester]
        );

        console.log(slot_prereq_query.rows);

        var alreadyRegistered = false;
        var time_slot_clash = false;
        var prereq_done = false;

        if(slot_prereq_query.rows[0].prereq_id === null){
            prereq_done = true;
        }

        for(const course of all_course_query.rows){
            if(course.course_id === slot_prereq_query.rows[0].prereq_id){
                prereq_done = true;
            }
        }

        for(const course of current_course_query.rows){
            if(course.course_id === course_id){
                alreadyRegistered = true;
            }

            if(course.time_slot_id === slot_prereq_query.rows[0].time_slot_id){
                time_slot_clash = true;
            }
        }

        if(alreadyRegistered){
            return res.json({message: "Already Registered"});
        }
        else if(time_slot_clash){
            return res.json({message: "Time Slot Clash"});
        }
        else if(!prereq_done){
            return res.json({message: "Prerequisite Not Done"});
        }


        const register_query = await pool.query(`INSERT INTO takes (id, course_id, sec_id, semester, year)
                                                VALUES ($1, $2, $3, $4, $5);`, [id, course_id, sec_id, semester, year]);
        

        return res.json({message : "Registered"});


    } catch (err) {
        console.error(err.message);
    }
});

app.listen(5000, () => {
    console.log("server has started on port 5000")
})