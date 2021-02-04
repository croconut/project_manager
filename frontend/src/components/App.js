import React, { useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { updateTasklistsFromServer } from "../redux/actions";
import Navbar from "./Navbar";
import Homepage from "./Homepage";
import EditExercise from "./EditExercise";
import CreateExercise from "./CreateExercise";
import CreateUser from "./CreateUser";
import Login from "./Login";
import {
  mainRoute,
  navbarRoutes,
  loggedInRoutes,
  usersPrivateInfo,
} from "../staticData/Routes";
// import './App.css';

const App = ({ tasklists, replaceTasklists }) => {
  // const updateFromServer = dispatch.updateTasklistsFromServer;
  useEffect(() => {
    const initUser = async () => {
      const response = await axios.get(usersPrivateInfo.route, {
        withCredentials: true,
      });
      // here imma update the tasklists
      replaceTasklists(response.data.tasklists);
    };
    initUser();
  }, [replaceTasklists]);
  return (
    <Router>
      <Navbar mainRoute={mainRoute} secondaryRoutes={navbarRoutes} />
      <br />
      <div className="container">
        <Switch>
          <Route exact path={mainRoute.route} component={Homepage} />
          <Route path={loggedInRoutes[0].route} component={EditExercise} />
          <Route path={loggedInRoutes[1].route} component={CreateExercise} />
          <Route path={navbarRoutes[0].route} component={CreateUser} />
          <Route path={navbarRoutes[1].route} component={Login} />

          <Route path={"/*"} component={Homepage} />
          {/* just redirect to home when the thing fails */}
        </Switch>
      </div>
    </Router>
  );
};

const mapStateToProps = (state) => {
  const tasklists = state.tasklistHolder.tasklists;
  return { tasklists };
};

const mapActionsToProps = {
  // renaming so i can use it without saying props.
  replaceTasklists: updateTasklistsFromServer,
};

export default connect(mapStateToProps, mapActionsToProps)(App);
