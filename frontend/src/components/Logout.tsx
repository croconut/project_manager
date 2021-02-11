import React, { FC, useEffect } from "react";
import { logoutRouter } from "../staticData/Routes";
import {
  DialogTitle,
  Dialog,
  DialogActions,
  Button,
  makeStyles,
} from "@material-ui/core";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { getLoggedIn } from "src/redux/selectors";
import { RootState } from "src/redux/reducers";
import { updateTasklistsFromServer } from "src/redux/actions";
import { defaultTasklists } from "src/redux/reducers/tasklist";
import { TasklistsAction, TTasklists } from "src/staticData/types";

interface StoreProps {
  loggedIn: boolean;
  replaceTasklists: (tasklists: TTasklists) => TasklistsAction;
}

const styles = makeStyles({
  dialog: {
    position: "absolute",
    top: "80px",
  },
});

//todo convert to modal pop up --> asks if you're sure you want to log out?
const Logout: FC<StoreProps> = ({ loggedIn, replaceTasklists }) => {
  const history = useHistory();
  const classes = styles();
  useEffect(() => {
    const logoutRequest = (loggedIn: boolean) => {
      if (!loggedIn) {
        // just redirect
        history.push("/");
      }
    };
    logoutRequest(loggedIn);
  }, [loggedIn, history, replaceTasklists]);

  const handleClose = (logoutRequested: boolean) => {
    // axios to log out
    if (logoutRequested) {
      axios
        .post(logoutRouter.route, {}, { withCredentials: true })
        .then((_response: AxiosResponse) => {
          // replace store data with defaults
          replaceTasklists(defaultTasklists.tasklists);
          history.push("/");
        })
        .catch((error: AxiosError) => {
          history.push("/");
        });
    } else {
      history.goBack();
      history.push("/");
    }
  };

  return (
    <Dialog
      classes={{
        paper: classes.dialog,
      }}
      open
      maxWidth="sm"
      fullWidth
      onClose={() => handleClose(false)}
      aria-labelledby="logout-request-title"
      aria-describedby="logout-request"
    >
      <DialogTitle id="logout-request-title">
        {"Are you sure you want to log out?"}
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => handleClose(false)} color="primary">
          No
        </Button>
        <Button onClick={() => handleClose(true)} color="primary" autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state: RootState) => {
  const loggedIn = getLoggedIn(state);
  // TODO
  // const getPageName = getCurrentPage(state);
  // whenever react-router is pushed to, also want to set the currentpage
  // name in the store for the navbar to render it
  return { loggedIn };
};

const mapActionsToProps = {
  // renaming so i can use it without saying props.
  replaceTasklists: updateTasklistsFromServer,
};

export default connect(mapStateToProps, mapActionsToProps)(Logout);
