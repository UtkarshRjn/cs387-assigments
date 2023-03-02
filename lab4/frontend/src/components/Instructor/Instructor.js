import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import './Instructor.css';
import Head from '../Head/Head.js';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/instructor";

const Instructor = () => {
  const { instructor_id } = useParams()
  const [responseData, setResponseData] = useState({});
  const session = JSON.parse(localStorage.getItem("session"));

  useEffect(() => {

    const body = { id: instructor_id , year: session.user.year, semester: session.user.semester};
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
  const curr_coursesArray = responseData.current_course ? responseData.current_course : [];

  return (
    <div className="instructor-page">
      <Head/>
      < NavBar/>
      <h1>Instructor Page</h1>
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
      <h3 className="header-text">Semester: {session.user.semester} Year: {session.user.year}</h3>
      <table id="current-course-table" className="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                </tr>
            </thead>

            <tbody>
                {
                curr_coursesArray.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td><a href={`/course/${item.course_id}`}>{item.course_id}</a></td>
                        <td>{item.title}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {curr_coursesArray.length === 0 && <p style={{fontSize: "15px", color: "white"}}>No Current Course</p>}


    {
      Object.entries(
        coursesArray.reduce((acc, course) => {
    
          if (!acc[course.semester + course.year]) {
              acc[course.semester + course.year] = [];
          }  
      
          acc[course.semester + course.year].push(course);
          return acc;
    
      }, {})).map(([key, coursesInSemester])  => (
        <React.Fragment key={key}>
          <h3 className="header-text">Semester: {coursesInSemester[0].semester} Year: {coursesInSemester[0].year}</h3>
          <table id="previous-course-table" className="table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Course Code</th>
                <th>Course Name</th>
              </tr>
            </thead>
            <tbody>
              {coursesInSemester.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.course_id}</td>
                  <td>{item.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </React.Fragment>
      ))}



    </div>

  );
}

export default Instructor;