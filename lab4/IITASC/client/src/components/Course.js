import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/course";

const Course = () => {

  const { course_id } = useParams()
  const [ responseData, setResponseData] = useState({});

console.log("course_id: " + course_id)
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

  return (
    <div>
      <h1>Welcome to the Course {course_id} Page</h1>
        {JSON.stringify(responseData)}
    </div>
  );
}

export default Course;