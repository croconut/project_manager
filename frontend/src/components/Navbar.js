import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = (props) => {
  const [collapse, setCollapse] = useState(true);
  const toggleCollapse = () => {
    setCollapse(!collapse);
  };
  return (
    <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
      <Link to="/" className="navbar-brand">
        ExerciseTracker
      </Link>
      <button type="button" className="navbar-toggler" onClick={toggleCollapse}>
        <span className="navbar-toggler-icon"></span>
      </button>
      <div
        id="navbarCollapse"
        className={`${collapse ? "collapse" : ""} navbar-collapse`}
      >
        <ul className="navbar-nav mr-auto">
          <li className="navbar-item">
            <Link to="/user" className="nav-link" onClick={toggleCollapse}>
              Create a User
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/create" className="nav-link" onClick={toggleCollapse}>
              Record an Exercise
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
