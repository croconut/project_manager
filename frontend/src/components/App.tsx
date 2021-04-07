import React, { FC, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { loginAttemptFromCookie } from "src/redux/actions";
import Navbar from "./Navbar";
import Homepage from "./Homepage";
import Register from "./Register";
import Login from "./Login";

import {
  mainRoute,
  loggedOutRoutes,
  loggedInRoutes,
  nonNavbarRoutes,
} from "../staticData/Routes";
import { FetchFailedAction, LoginCompleteAction } from "src/staticData/types";
import Logout from "./Logout";
import Tasklist from "./Tasklist/Tasklist";
import CreateTasklist from "./Tasklist/CreateTasklist";
type Props = {
  cookieLogin: () => Promise<FetchFailedAction | LoginCompleteAction>;
};

const App: FC<Props> = ({ cookieLogin }): React.ReactElement => {
  useEffect(() => {
    cookieLogin();
  }, [cookieLogin]);
  return (
    <Router>
      <Navbar
        mainRoute={mainRoute}
        loggedInRoutes={loggedInRoutes}
        loggedOutRoutes={loggedOutRoutes}
      />
      <br />
      <div className="container">
        <Switch>
          <Route exact path={mainRoute.route} component={Homepage} />
          <Route path={loggedOutRoutes[0].route} component={Register} />
          <Route path={loggedOutRoutes[1].route} component={Login} />
          <Route path={loggedInRoutes[3].route} component={Logout} />
          <Route path={nonNavbarRoutes[0].route} component={Tasklist} />
          <Route path={nonNavbarRoutes[1].route} component={CreateTasklist} />
          <Route path={"/*"} component={Homepage} />
          {/* just redirect to home when the thing fails */}
        </Switch>
      </div>
    </Router>
  );
};

// pass an object entirely composed of actions
// to bind them to dispatch
const mapActionsToProps = {
  // renaming so i can use it without saying props.
  cookieLogin: loginAttemptFromCookie,
};

export default connect(null, mapActionsToProps)(App);
