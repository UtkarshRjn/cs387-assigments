import React, { useState, useEffect } from 'react';
import '../style/Running.css';
import NavBar from './NavBar.js';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/running";

const Running = () => {
    const [responseData, setResponseData] = useState({});

    useEffect(() => {

        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => setResponseData(data))
        .catch(error => console.error(error));
    }, []);

    const responseDataArray = Object.values(responseData);

  return (
    <div class='running-course-page'>
        < NavBar/>
        <h1>Welcome to the Running Course Page</h1> 
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