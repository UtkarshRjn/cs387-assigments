import React, { useState, useEffect } from 'react';
import './Running.css';
import Head from '../Head/Head';
import NavBar from '../NavBar/NavBar';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/running";

const Running = () => {
    const [responseData, setResponseData] = useState({});
    const session = JSON.parse(localStorage.getItem("session"));

    useEffect(() => {

        const body = { year: session.user.year, semester: session.user.semester}
        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => setResponseData(data))
        .catch(error => console.error(error));
    }, []);

    const responseDataArray = Object.values(responseData);

  return (
    <div class='running-course-page'>
        <Head/>
        < NavBar/>
        <h1>Running Courses</h1> 
        <table id="running-course-table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Department Name</th>
                </tr>
            </thead>

            <tbody>
                {
                responseDataArray.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td><a href={`/course/running/${item.dept_name}`}>{item.dept_name}</a></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

  );
}

export default Running;