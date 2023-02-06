const Pool = require("pg").Pool;

const pool = new Pool({
    user : "utkarsh",
    password : "Utkarsh@2002",
    host: "localhost",
    port: 5432,
    database: "lab4"
})

module.exports = pool;