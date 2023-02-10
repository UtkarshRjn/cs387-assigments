import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/registration";

const Registration = () => {
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
    const handleChange = (e) => {
        e.preventDefault();
        setResponseData(e.target.value);
    };
      
    if (responseData.length > 0) {
        responseDataArray.filter((item) => {
        return item.course_id.match(responseData);
    });

  return (
    <Layout>
        <input
            type="search"
            placeholder="Search here"
            onChange={handleChange}
            value={responseData} />

    <html>
        <head>
            <style>

            </style>
        </head>
        <body>
            <h1>Welcome to the Registration Page</h1>
            <table id="running-course-table">
                <thead>
                    <tr>
                        <th>S.N</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Section</th>
                        <th>Register</th>
                    </tr>
                </thead>

                <tbody>
                    {
                    responseDataArray.map((item, index) => (
                        <tr key={index}>
                            <td>{index+1}</td>
                            <td>{item.course_id}</td>
                            <td>{item.title}</td>
                            <td>{item.section}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </body>
    </html>
    </Layout>
  );
}
}

export default Registration;