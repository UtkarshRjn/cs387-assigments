import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    <div>
      <h1>Welcome to the Instructor {instructor_id} Page</h1>
      <h2>Instructor Name: {responseData.name}</h2>
      <h2>Department: {responseData.dept_name}</h2>
      <h3>Courses in current semester:</h3>
      {/* <h4> Semester: {current_course[0]}</h4> */}
      <table id="current-course-table">
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

      <h3>Courses in previous semesters:</h3>
      {/* <h4> Semester: {curr_coursesArray[0]['semester']}         Year: {curr_coursesArray[0]['year']}</h4> */}
      <table id="current-course-table">
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