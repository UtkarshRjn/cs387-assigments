import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import Head from '../Head/Head';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/deptName";

const DeptName = () => {
    const [responseData, setResponseData] = useState({});
    const { dept_name } = useParams();
    const session = JSON.parse(localStorage.getItem("session"));

    useEffect(() => {
        const body = { dept_name: dept_name , year: session.user.year, semester: session.user.semester };

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
    <div class='dept-running-course-page'>
        <Head/>
        < NavBar/>
        <h1>{ dept_name } Department</h1>
        <table id="departments-table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Course Id</th>
                    <th>Course Title</th>
                </tr>
            </thead>

            <tbody>
                {
                responseDataArray.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td><a href={`/course/${item.course_id}`}>{item.course_id}</a></td>
                        <td>{item.title}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}

export default DeptName;