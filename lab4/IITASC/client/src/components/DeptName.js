import React, { useState, useEffect } from 'react';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/deptName";

const DeptName = () => {
    const [responseData, setResponseData] = useState({});
    const dept_name = 'Comp. Sci.'

    useEffect(() => {

        const body = { dept_name: dept_name };

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
      <h1>Welcome to the Running Course Page of {dept_name} Department</h1>
      {JSON.stringify(responseData)}
    </div>
  );
}

export default DeptName;