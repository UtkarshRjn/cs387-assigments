import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Head from '../Head/Head';
import NavBar from '../NavBar/NavBar';
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
    <div class='course-page'>
        <Head/>
        < NavBar/>
        <h1> { responseData.title } </h1>
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
                    <td style={{ whiteSpace: "pre-wrap" }}>
                        {
                            responseData.prereq_id
                            ? responseData.prereq_id.map(prereq => (
                                <React.Fragment key={prereq}>
                                    <a href={`/course/${prereq}`}>{prereq}</a>
                                    <br />
                                </React.Fragment>
                                ))
                            : `None`
                        }
                    </td>     
                </tr>
                <tr>
                    <td>Instructors</td>
                    <td style={{ whiteSpace: "pre-wrap" }}>
                        {
                            responseData.instructors
                            ? responseData.instructors.map(instructor => (
                                <React.Fragment key={instructor}>
                                    <a href={`/instructor/${instructor[0]}`}>{instructor[1]}</a>
                                    <br />
                                </React.Fragment>
                                ))
                            : `None`
                        }
                    </td>                
                </tr>
            </tbody>
        </table>
    </div>
  );
}

export default Course;