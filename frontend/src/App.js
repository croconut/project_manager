import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import ExercisesList from "./components/ExercisesList";
import EditExercise from "./components/EditExercise";
import CreateExercise from "./components/CreateExercise";
import CreateUser from "./components/CreateUser";
var RouteInformation = require("./staticData/Routes");
// import './App.css';

function App() {
  const {mainRoute, navbarRoutes, nonNavbarRoutes} = RouteInformation;

  return (
    <Router>
      <Navbar
        mainRoute={mainRoute}
        secondaryRoutes={navbarRoutes}
      />
      <br />
      <div className="container">
        <Switch>
          <Route exact path={mainRoute.link} component={ExercisesList} />
          <Route path={nonNavbarRoutes[0].link}  component={EditExercise} />
          <Route path={navbarRoutes[0].link}  component={CreateExercise} />
          <Route path={navbarRoutes[1].link}  component={CreateUser} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
