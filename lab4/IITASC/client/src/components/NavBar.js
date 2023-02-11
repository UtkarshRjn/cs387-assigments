import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import '../style/NavBar.css'

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
      <nav>
        <ul className="nav-links">
          <li>{session.user.id}</li>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/login" onClick={handleLogout}>Logout</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;