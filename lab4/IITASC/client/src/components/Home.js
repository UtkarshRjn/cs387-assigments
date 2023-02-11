import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import '../style/Home.css';
import { useNavigate } from "react-router-dom";
import NavBar from './NavBar.js';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/home";

const Home = () => {
    //const { id } = useParams()
    const [responseData, setResponseData] = useState({});
    const navigate = useNavigate();
    const [redirectToLogin, setRedirectToLogin] = useState(false);

    useEffect(() => {
        const session = JSON.parse(localStorage.getItem("session"));

        if (!session) {
            navigate("/login");
        }

        const body = { id: session.user.id };
        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        
        .then(data => setResponseData(data) 
          )
        .catch(error => console.error(error));
    }, []);

    const coursesArray = responseData.courses ? responseData.courses : [];
    const curr_coursesArray = responseData.current_courses ? responseData.current_courses : [];

    

  return (
    <div class="table-container">
      < NavBar/>
      <h1 class="header-text">Welcome to the Home Page</h1>
      <table class="student-info">
        <tr>
          <th>Student Id:</th>
          <td>{responseData.id}</td>
        </tr>
        <tr>
          <th>Student Name:</th>
          <td>{responseData.name}</td>
        </tr>
        <tr>
          <th>Department:</th>
          <td>{responseData.dept_name}</td>
        </tr>
      </table>
      <h2 class="header-text">Courses in current semester:</h2>
      <table class="table">
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Course Id</th>
          </tr>
        </thead>
        <tbody>
          {curr_coursesArray.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td><a href={`/course/${item.course_id}`}>{item.course_id}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 class="header-text">Courses in previous semesters:</h2>
      <table class="table">
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Course Id</th>
            <th>Semester</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          {coursesArray.map((item, index) => (
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

export default Home;