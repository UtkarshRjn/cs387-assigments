import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import './NavBar.css'

const NavBar = () => {
  const navigate = useNavigate();
  const [redirectToLogin, setRedirectToLogin] = React.useState(false);

  const session = JSON.parse(localStorage.getItem("session"));

  if (!session) {
      navigate("/login");
  }

  const handleLogout = () => {
      localStorage.removeItem("session");
  };

  console.log(session);

  return (
    <header className="navbar">
      <div className="session-id" style={{float: "left"}}>{session.user.id}</div>
      <nav className="d-flex" style={{justifyContent: "flex-start"}}>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/course/running">Course</Link></li>
          <li><Link to="/home/registration">Register</Link></li>
          <li><Link to="/login" onClick={handleLogout}>Logout</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;