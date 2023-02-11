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
    console.log(req.sessionID);
    
    try{
       const { id , pwd } = req.body;
       const password_query = await pool.query("SELECT hashed_password FROM user_password WHERE id = $1", [id]);
       if(password_query.rows.length == 0){
            return res.status(401).json({ message: "Login failed." });
       }
       
       const password = password_query.rows[0]['hashed_password'];
       console.log(password);
        
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
        console.log(id);
        const student_query = await pool.query("SELECT * FROM student WHERE id = $1", [id]);
        console.log(student_query.rows);
        const course_query = await pool.query(`
                                                SELECT course_id, semester, year
                                                FROM takes
                                                WHERE takes.ID = $1
                                                ORDER BY year DESC, semester DESC;
                                                `, [id]);
        
        const current_course = await pool.query(`SELECT c.course_id, 'Spring' AS semester, '2010' AS year
                                                 FROM course c
                                                 LEFT JOIN takes r ON c.course_id = r.course_id
                                                 WHERE r.ID = $1 AND r.semester = 'Spring' AND r.year = '2010';                                           
                                                 `, [id]);                                        
        
        const data = {
            id: student_query.rows[0]['id'],
            name: student_query.rows[0]['name'],
            dept_name: student_query.rows[0]['dept_name'],
            tot_cred: student_query.rows[0]['tot_cred'],
            courses: course_query.rows,
            current_course: current_course.rows
        }

 
        // console.log(student_query.rows[0]);
        console.log(data);
        res.send(data);
 
     }catch (err){
         console.error(err.message);
     }

});

app.post("/instructor", async (req, res) => {

    try{
        const { id } = req.body;
        console.log(id);
        const student_query = await pool.query("SELECT * FROM instructor WHERE id = $1", [id]);
        
        const course_query = await pool.query(`
                                                SELECT course_id, semester, year
                                                FROM teaches
                                                WHERE teaches.ID = $1 and semester <> 'Spring' and year <> '2010'
                                                ORDER BY year DESC, semester DESC;
                                                `, [id]);
        
        const current_course = await pool.query(`SELECT course_id, semester, year
                                                FROM teaches
                                                WHERE teaches.ID = $1 and semester = 'Spring' and year = '2010'
                                                ORDER BY course_id;`, [id]);                                        

        const data = {
            name: student_query.rows[0]['name'],
            dept_name: student_query.rows[0]['dept_name'],
            courses: course_query.rows,
            current_course: current_course.rows
        }

 
        // console.log(student_query.rows[0]);
        console.log(data);
        res.send(data);
 
     }catch (err){
         console.error(err.message);
     }

});


app.post("/course", async (req, res) => {

    try{
        const { id} = req.body;
        console.log(id);
        // const course_query = await pool.query(`SELECT course.course_id as course_id, title, building, credits, prereq_id, T.id as instructor_id
        //                                         FROM course
        //                                         LEFT JOIN prereq
        //                                         ON course.course_id = prereq.course_id
        //                                         NATURAL JOIN section AS C , teaches AS T
        //                                         WHERE C.course_id = $1
        //                                         AND C.course_id = T.course_id 
        //                                         AND C.sec_id = T.sec_id
        //                                         AND C.semester = T.semester
        //                                         AND C.year = T.year;`, [id]);                                      

        const course_query = await pool.query(`SELECT course.course_id as course_id, title,  credits, prereq_id
                                                FROM course
                                                LEFT JOIN prereq
                                                ON course.course_id = prereq.course_id
                                                WHERE course.course_id = $1;`, [id]); 
        

        // This part of code takes multiple instructor teaching the same course into consideration
        const instructors = [];

        for (const elem of course_query.rows) {
            const instr = elem['instructor_id'];
            instructors.push(instr);
        }


        console.log(course_query)
        
        const data = {
            course_id: course_query.rows[0]['course_id'],
            title: course_query.rows[0]['title'],
            building: course_query.rows[0]['building'],
            credits: course_query.rows[0]['credits'],
            prereq_id: course_query.rows[0]['prereq_id'],
            instructors: instructors,
        }

 
        // console.log(student_query.rows[0]);
        console.log(data);
        res.send(data);
 
     }catch (err){
         console.error(err.message);
     }

});

app.post("/registration", async (req, res) => {

    try{
        const {} = req.body;
        //console.log(id);
        // const course_query = await pool.query(`SELECT course.course_id as course_id, title, building, credits, prereq_id, T.id as instructor_id
        //                                         FROM course
        //                                         LEFT JOIN prereq
        //                                         ON course.course_id = prereq.course_id
        //                                         NATURAL JOIN section AS C , teaches AS T
        //                                         WHERE C.course_id = $1
        //                                         AND C.course_id = T.course_id 
        //                                         AND C.sec_id = T.sec_id
        //                                         AND C.semester = T.semester
        //                                         AND C.year = T.year;`, [id]);                                      
//course_id, title,  credits, sec_id
        const reg_query = await pool.query(`select  (ROW_NUMBER() OVER() -1 ) as id, course.course_id, title,sec_id,credits from course,section where section.course_id=course.course_id;
        `); 
        

        // This part of code takes multiple instructor teaching the same course into consideration
        // const instructors = [];

        // for (const elem of course_query.rows) {
        //     const instr = elem['instructor_id'];
        //     instructors.push(instr);
        // }
        
        const data = reg_query.rows

 
        // console.log(student_query.rows[0]);
        console.log(data);
        res.send(data);
 
     }catch (err){
         console.error(err.message);
     }

});


app.post("/running", async (req, res) => {

    try{
        const { id } = req.body;
        console.log(id);
        const dept_query = await pool.query(`SELECT DISTINCT dept_name
                                                FROM course natural JOIN section
                                                WHERE semester='Spring' and year='2010'`);                                      
        

        console.log(dept_query.rows);
        
        res.send(dept_query.rows);
 
     }catch (err){
         console.error(err.message);
     }

});

app.post("/deptName", async (req, res) => {

    try{
        const { dept_name } = req.body;
        console.log( dept_name );
        const course_query = await pool.query(`SELECT course_id , title
                                            FROM course natural JOIN section
                                            WHERE semester='Spring' and year='2010' and dept_name = $1;`, [dept_name]);                                      
        

        console.log(course_query.rows)
        
        res.send(course_query.rows);
 
     }catch (err){
         console.error(err.message);
     }

});

app.listen(5000, () => {
    console.log("server has started on port 5000")
});