const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());

app.post("/lab4", async (req, res) => {
    try{
       const { id } = req.params;
       const allTodos = await pool.query("SELECT * FROM student");
       res.json(allTodos.rows);
    }catch (err){
        console.error(err.message);
    }
})

app.get("/lab4/student", async (req, res) => {
    try {
        console.log(req.params);
      const { id , pwd} = req.params;
      const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
        id
      ]);
  
      console.log(todo.rows[0]);
      res.json(todo.rows[0]);
    } catch (err) {
      console.error(err.message);
    }
});

app.listen(5000, () => {
    console.log("server has started on port 5000")
})