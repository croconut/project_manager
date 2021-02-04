import React, { useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import EditExercise from "./components/EditExercise";
import CreateExercise from "./components/CreateExercise";
import CreateUser from "./components/CreateUser";
import Login from "./components/Login";
import {
  mainRoute,
  navbarRoutes,
  loggedInRoutes,
  usersPrivateInfo,
} from "./staticData/Routes";
// import './App.css';

function App() {
  useEffect(() => {
    const initUser = async () => {
      const response = await axios.get(usersPrivateInfo.route, {
        withCredentials: true,
      });
      console.log(response.data);
    };
    initUser();
  }, []);
  return (
    <Router>
      <Navbar mainRoute={mainRoute} secondaryRoutes={navbarRoutes} />
      <br />
      <div className="container">
        <Switch>
          <Route exact path={mainRoute.route} component={Homepage} />
          <Route path={loggedInRoutes[0].route} component={EditExercise} />
          <Route path={navbarRoutes[0].route} component={CreateExercise} />
          <Route path={navbarRoutes[1].route} component={CreateUser} />
          <Route path={navbarRoutes[2].route} component={Login} />

          <Route path={"/*"} component={Homepage} />
          {/* just redirect to home when the thing fails */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
