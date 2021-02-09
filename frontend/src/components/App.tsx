import React, { FC, useEffect } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { updateTasklistsFromServer } from "src/redux/actions";
import { getTasklists } from "src/redux/selectors";
import Navbar from "./Navbar";
import Homepage from "./Homepage";
import EditExercise from "./EditExercise";
import CreateUser from "./CreateUser";
import Login from "./Login";

import {
  mainRoute,
  navbarRoutes,
  loggedInRoutes,
  usersPrivateInfo,
} from "../staticData/Routes";
import { RootState } from "src/redux/reducers";
import { TTasklists } from "src/staticData/types";


type Props = {
  replaceTasklists: Function;
  tasklists: TTasklists;
};

const App: FC<Props> = ({ tasklists, replaceTasklists }): React.ReactElement => {
  console.log(tasklists[0]._id);
  useEffect(() => {
    const initUser = async () => {
      axios.get(usersPrivateInfo.route, {
        withCredentials: true,
      })
      .then((response: AxiosResponse) => {
        replaceTasklists(response.data.tasklists);
      })
      .catch((error: AxiosError) => {
        console.error(error);
      });
      // here imma update the tasklists assuming it came
      // TODO check for error code and wait for login signal complete if
      // error out in some way
      
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
          <Route path={navbarRoutes[0].route} component={CreateUser} />
          <Route path={navbarRoutes[1].route} component={Login} />

          <Route path={"/*"} component={Homepage} />
          {/* just redirect to home when the thing fails */}
        </Switch>
      </div>
    </Router>
  );
};

// not sure i'll need to look at the tasklists at any point from this component
// TODO remove when component complete and deemed unnecessary
const mapStateToProps = (state: RootState) => {
  // BAD
  // const tasklists = state.tasklistHolder.tasklists;
  // GOOD cuz using a selector
  const tasklists = getTasklists(state);
  return { tasklists };
};

// pass an object entirely composed of actions
// to bind them to dispatch
const mapActionsToProps = {
  // renaming so i can use it without saying props.
  replaceTasklists: updateTasklistsFromServer,
};

export default connect(mapStateToProps, mapActionsToProps)(App);
