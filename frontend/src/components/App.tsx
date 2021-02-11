import React, { FC, useEffect } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { updateTasklistsFromServer } from "src/redux/actions";
import { getTasklists } from "src/redux/selectors";
import Navbar from "./Navbar";
import Homepage from "./Homepage";
import CreateUser from "./CreateUser";
import Login from "./Login";

import {
  mainRoute,
  loggedOutRoutes,
  loggedInRoutes,
  usersPrivateInfo,
  nonNavbarRoutes,
} from "../staticData/Routes";
import { RootState } from "src/redux/reducers";
import { isTasklists, TasklistsAction, TTasklists } from "src/staticData/types";
import Logout from "./Logout";
import Tasklists from "./Tasklists";
import Profile from "./Profile";
import Organizations from "./Organizations";
import Tasklist from "./Tasklist";
import Organization from "./Organization";


type Props = {
  replaceTasklists: (tasklists: TTasklists) => TasklistsAction;
  tasklists: TTasklists;
};

const App: FC<Props> = ({ tasklists, replaceTasklists }): React.ReactElement => {
  useEffect(() => {
    const initUser = async () => {
      axios.get(usersPrivateInfo.route, {
        withCredentials: true,
      })
      .then((response: AxiosResponse) => {
        if (isTasklists(response.data.tasklists)) {
          replaceTasklists(response.data.tasklists);
        } else {
          //errored out, we're not logged in yet
          console.log(response.data);
        }
      })
      .catch((error: AxiosError) => {
        console.error(error);
      });
      // here imma update the tasklists assuming it came
      // TODO check for error code and wait for login signal complete if
      // error out in some way
      /*  { name: "My Tasklists", route: "/tasklists" },
  { name: "My Organizations", route: "/organizations" },
  { name: "Profile", route: "/profile"},
  { name: "Logout", route: "/logout" }, */
    };
    initUser();
  }, [replaceTasklists]);
  return (
    <Router>
      <Navbar mainRoute={mainRoute} loggedInRoutes={loggedInRoutes} loggedOutRoutes={loggedOutRoutes} />
      <br />
      <div className="container">
        <Switch>
          <Route exact path={mainRoute.route} component={Homepage} />
          <Route path={loggedOutRoutes[0].route} component={CreateUser} />
          <Route path={loggedOutRoutes[1].route} component={Login} />
          <Route path={loggedInRoutes[0].route} component={Tasklists} />
          <Route path={loggedInRoutes[1].route} component={Organizations} />
          <Route path={loggedInRoutes[2].route} component={Profile} />
          <Route path={loggedInRoutes[3].route} component={Logout} />
          <Route path={nonNavbarRoutes[0].route} component={Tasklist} />
          <Route path={nonNavbarRoutes[1].route} component={Organization} />
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
