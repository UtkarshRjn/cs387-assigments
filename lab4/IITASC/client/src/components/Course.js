import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/course";

const Course = () => {

  const { course_id } = useParams()
  const [ responseData, setResponseData] = useState({});

  useEffect(() => {

    const body = { id: course_id };
    fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => setResponseData(data))
    .catch(error => console.error(error));
  }, []);

  // const responseDataArray = Object.values(responseData);

  return (
    <Layout>
    <html>
      <head>
            <style>

            </style>
        </head>
        <body>
            <h1>Welcome to the Course { course_id } Page</h1>
            <table id="course-detail-table">
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>Course Id</td>
                        <td>{responseData.course_id}</td>
                    </tr>
                    <tr>
                        <td>Title</td>
                        <td>{responseData.title}</td>
                    </tr>
                    <tr>
                        <td>Credits</td>
                        <td>{responseData.credits}</td>
                    </tr>
                    <tr>
                        <td>Prereq</td>
                        <td><a href={`/course/${responseData.prereq_id}`}>{responseData.prereq_id}</a></td>
                    </tr>
                    <tr>
                        <td>Instructors</td>
                        <td><a href={`/instructor/${responseData.instructors}`} >{responseData.instructors ? responseData.instructors.join(', ') : `None` }</a></td>
                    </tr>
                </tbody>
            </table>
        </body>      
    </html>
    </Layout>
  );
}

export default Course;