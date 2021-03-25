import React, { FC, useEffect } from "react";
import {
  DialogTitle,
  Dialog,
  DialogActions,
  Button,
  makeStyles,
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { getLastUpdateFailure, getLoggedIn, getStoreStatus } from "src/redux/selectors";
import { RootState } from "src/redux/reducers";
import { logoutAttempt } from "src/redux/actions";
import { LogoutCompleteAction, UpdateFailedAction } from "src/staticData/types";

interface StoreProps {
  loggedIn: boolean;
  tryLogout: () => Promise<UpdateFailedAction | LogoutCompleteAction>;
}

const styles = makeStyles({
  dialog: {
    position: "absolute",
    top: "80px",
  },
});

//todo convert to modal pop up --> asks if you're sure you want to log out?
const Logout: FC<StoreProps> = ({ loggedIn, tryLogout }) => {
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
  }, [loggedIn, history]);

  const handleClose = (logoutRequested: boolean) => {
    // axios to log out
    if (logoutRequested) {
      tryLogout();
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
        <Button color="primary" onClick={() => handleClose(false)}>
          No
        </Button>
        <Button color="primary" onClick={() => handleClose(true)} autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state: RootState) => {
  const loggedIn = getLoggedIn(state);
  const status = getStoreStatus(state);
  const failReason = getLastUpdateFailure(state);
  return { loggedIn, status, failReason };
};

const mapActionsToProps = {
  tryLogout: logoutAttempt,
};

export default connect(mapStateToProps, mapActionsToProps)(Logout);
