import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Table from "./Table";
//import {usetable} from 'react-table';

const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/home";

const Home = () => {
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
    <Layout>
      <h1>Welcome to the Home Page</h1>
      {JSON.stringify(responseData)}
    </Layout>
  );
}

export default Home;