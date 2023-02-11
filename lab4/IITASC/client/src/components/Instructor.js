import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import NavBar from './NavBar.js';
import '../style/Instructor.css';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/instructor";

const Instructor = () => {
  const { instructor_id } = useParams()
  const [responseData, setResponseData] = useState({});

  useEffect(() => {

    const body = { id: instructor_id };
    fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => setResponseData(data))
    .catch(error => console.error(error));
  }, []);

  const coursesArray = responseData.courses ? responseData.courses : [];
  const curr_coursesArray = responseData.current_courses ? responseData.current_courses : [];

  return (
    <div className="instructor-page">
      < NavBar/>
      <h1 class="header-text">Welcome to the Instructor {instructor_id} Page</h1>
      <table class="instructor-info">
        <tr>
          <th>Instructor Id:</th>
          <td>{instructor_id}</td>
        </tr>
        <tr>
          <th>Instructor Name:</th>
          <td>{responseData.name}</td>
        </tr>
        <tr>
          <th>Department:</th>
          <td>{responseData.dept_name}</td>
        </tr>
      </table>
      <h3 class="header-text">Courses in Current Semester:</h3>
      <table id="current-course-table" className="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Course Id</th>
                </tr>
            </thead>

            <tbody>
                {
                curr_coursesArray.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td><a href={`/course/${item.course_id}`}>{item.course_id}</a></td>
                    </tr>
                ))}
            </tbody>
        </table>

    <h3 class="header-text">Courses in Previous Semesters:</h3>
    <table id="previous-course-table" className="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Course Id</th>
                    <th>Semester</th>
                    <th>Year</th>
                </tr>
            </thead>

            <tbody>
                {
                coursesArray.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.course_id}</td>
                        <td>{item.semester}</td>
                        <td>{item.year}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

  );
}

export default Instructor;