import React, { useState, useEffect } from 'react';
import './Home.css';
import { useNavigate } from "react-router-dom";
import NavBar from '../NavBar/NavBar';
import Head from '../Head/Head';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/home";

const Home = () => {
    const [responseData, setResponseData] = useState({});
    const navigate = useNavigate();
    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const session = JSON.parse(localStorage.getItem("session"));

    useEffect(() => {

        if (!session) {
            navigate("/login");
        }
        console.log(session);
        const body = { id: session.user.id , year: session.user.year, semester: session.user.semester};
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

    const onClickDrop = async (courseId) => {
      try {
          
        const body = { id: session.user.id, course_id: courseId , year: session.user.year, semester: session.user.semester };
        fetch(`http://localhost:5000/drop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => setResponseData(data))
        .catch(error => console.error(error));
        
        } catch (err) {
          console.error(err.message);
        }
  }

  return (
    <div class="table-container">
    <Head/>
    < NavBar/>
      <div class='header-container'>
          <h1 >Home Page</h1>
          <table class="student-info">
            <tr>
              <td style={{width: "50%", padding: 0}}>
                <table style={{width: "100%"}}>
                  <tr>
                    <th style={{width: "50%"}}>Student Id:</th>
                    <td style={{width: "50%"}}>{responseData.id}</td>
                  </tr>
                  <tr>
                    <th style={{width: "50%"}}>Department:</th>
                    <td style={{width: "50%"}}>{responseData.dept_name}</td>
                  </tr>
                </table>
              </td>
              <td style={{width: "50%", padding: 0}}>
                <table style={{width: "100%"}}>
                  <tr>
                    <th style={{width: "50%"}}>Student Name:</th>
                    <td style={{width: "50%"}}>{responseData.name}</td>
                  </tr>
                  <tr>
                    <th style={{width: "50%"}}>Total Credits:</th>
                    <td style={{width: "50%"}}>{responseData.tot_cred}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
      </div>

      <div class='course-container'>
          <h3 class="header-text" style={{textAlign: "center"}}>Semester: {session.user.semester} Year: {session.user.year}</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Section</th>
                <th>Grade</th>
                <th>Drop</th>
              </tr>
            </thead>
            <tbody>
              {curr_coursesArray.map((item, index) => (
                <tr key={index}>
                  <td><a href={`/course/${item.course_id}`}>{item.course_id}</a></td>
                  <td>{item.title}</td>
                  <td>{item.credits}</td>
                  <td>{item.sec_id}</td>
                  <td>{item.grade}</td>
                  <td>
                      <button class="myButton" onClick={() => onClickDrop(item.course_id)}>
                          Drop
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        {curr_coursesArray.length === 0 && <p style={{fontSize: "15px", color: "white", textAlign: "center"}}>No Current Course</p>}

          {
            Object.entries(
              coursesArray.reduce((acc, course) => {
                if (!acc[course.semester + course.year]) {
                  acc[course.semester + course.year] = [];
                }
                acc[course.semester + course.year].push(course);
                return acc;
              }, {})
            ).map(([key, coursesInSemester]) => (
              <React.Fragment key={key}>
                <h3 class="header-text" style={{textAlign: "center"}}>Semester: {coursesInSemester[0].semester} Year: {coursesInSemester[0].year}</h3>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Credits</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coursesInSemester.map((item, index) => (
                      <tr key={index}>
                        <td>{item.course_id}</td>
                        <td>{item.title}</td>
                        <td>{item.credits}</td>
                        <td>{item.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </React.Fragment>
            ))
          }
      </div>
      
    </div>
  );
}

export default Home;