import React, { useState, useEffect } from 'react';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/running";

const Running = () => {
    const [responseData, setResponseData] = useState({});

    useEffect(() => {
        const session = JSON.parse(localStorage.getItem("session"));

        const body = { id: session.user.id };

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
      <h1>Welcome to the Running Course Page</h1>
      {JSON.stringify(responseData)}
    </div>
  );
}

export default Running;