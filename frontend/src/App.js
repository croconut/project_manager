import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import ExercisesList from "./components/ExercisesList";
import EditExercise from "./components/EditExercise";
import CreateExercise from "./components/CreateExercise";
import CreateUser from "./components/CreateUser";
import Login from "./components/Login";
import { mainRoute, navbarRoutes, otherRoutes } from "./staticData/Routes";
// import './App.css';

function App() {
  console.log("re-render triggered");
  return (
    <Router>
      <Navbar mainRoute={mainRoute} secondaryRoutes={navbarRoutes} />
      <br />
      <div className="container">
        <Switch>
          <Route exact path={mainRoute.link} component={ExercisesList} />
          <Route path={otherRoutes[0].link} component={EditExercise} />
          <Route path={navbarRoutes[0].link} component={CreateExercise} />
          <Route path={navbarRoutes[1].link} component={CreateUser} />
          <Route path={navbarRoutes[2].link} component={Login} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
