import React, { FC, useState } from "react";
import { FrontendRoute } from "../staticData/Routes";
import { Link } from "react-router-dom";

// main route has .name and .route
// secondary routes is array of objects with same parameters
// .name and .route

interface Props {
  mainRoute: FrontendRoute,
  secondaryRoutes: Array<FrontendRoute>;
}

const Navbar: FC<Props> = ({ mainRoute, secondaryRoutes }) => {
  const [collapse, setCollapse] = useState(true);

  const toggleCollapse = () => {
    setCollapse(!collapse);
  };

  // console.log("navbar rerender");

  const createNavLinks = () => {
    const arrItems: Array<JSX.Element> = new Array(secondaryRoutes.length);
    for (let i = 0; i < arrItems.length; i++) {
      arrItems[i] = (
        // the link is extremely likely to be unique in any use case for this
        // TODO implement actual unique key with uuid from the database
        <li className="navbar-item" key={secondaryRoutes[i].route}>
          <Link
            to={secondaryRoutes[i].route}
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
      <Link to={mainRoute.route} className="navbar-brand">
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
