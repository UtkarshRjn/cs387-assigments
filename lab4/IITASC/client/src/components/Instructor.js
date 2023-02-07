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

  return (
    <div>
      <h1>Welcome to the Instructor {instructor_id} Page</h1>
        {JSON.stringify(responseData)}
    </div>
  );
}

export default Instructor;