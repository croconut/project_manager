import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import ExercisesList from "./components/ExercisesList";
import EditExercise from "./components/EditExercise";
import CreateExercise from "./components/CreateExercise";
import CreateUser from "./components/CreateUser";
import { mainRoute, navbarRoutes, otherRoutes } from "./staticData/Routes";
// import './App.css';

function App() {
  return (
    <Router>
      <Navbar mainRoute={mainRoute} secondaryRoutes={navbarRoutes} />
      <br />
      <div className="container">
        <Switch>
          {/*   // TODO update to retrieve user profile if logged in,
                // or a signup/login page if not 
          */}
          <Route exact path={mainRoute.link} component={ExercisesList} />
          <Route path={otherRoutes[0].link} component={EditExercise} />
          <Route path={navbarRoutes[0].link} component={CreateExercise} />
          <Route path={navbarRoutes[1].link} component={CreateUser} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
