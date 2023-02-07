import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/running";

const Running = () => {
    const [responseData, setResponseData] = useState({});

    useEffect(() => {
        const session = JSON.parse(localStorage.getItem("session"));

        const body = { id: session.user.id };

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
    <html>
        <head>
            <style>

            </style>
        </head>
        <body>
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
        </body>
    </html>
  );
}

export default Running;