import React, { useState } from "react";
import { Link } from "react-router-dom";

// main route has .name and .link
// secondary routes is array of objects with same parameters
// .name and .link
const Navbar = ({ mainRoute, secondaryRoutes }) => {
  const [collapse, setCollapse] = useState(true);

  const toggleCollapse = () => {
    setCollapse(!collapse);
  };

  const createNavLinks = () => {
    const arrItems = new Array(secondaryRoutes.length);
    for (let i = 0; i < arrItems.length; i++) {
      arrItems[i] = (
        <li className="navbar-item">
          <Link
            to={secondaryRoutes[i].link}
            className="nav-link"
            onClick={toggleCollapse}
          >
            {secondaryRoutes[i].name}
          </Link>
        </li>
      );
    }
    return arrItems;
  };

  const navItems = createNavLinks();

  return (
    <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
      <Link to={mainRoute.link} className="navbar-brand">
        {mainRoute.name}
      </Link>
      <button type="button" className="navbar-toggler" onClick={toggleCollapse}>
        <span className="navbar-toggler-icon"></span>
      </button>
      <div
        id="navbarCollapse"
        className={`${collapse ? "collapse" : ""} navbar-collapse`}
      >
        <ul className="navbar-nav mr-auto">{navItems}</ul>
      </div>
    </nav>
  );
};

export default Navbar;
