import React from 'react';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/home";

const Home = () => {
    const session = JSON.parse(localStorage.getItem("session"));
    console.log("session", session);

    const body = { id: session.user.id };
    const response = fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      {session && JSON.stringify(session)}
      {response && JSON.stringify(response)}
    </div>
  );
}

export default Home;