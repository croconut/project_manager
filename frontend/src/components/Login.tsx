import React, { useState, FC, useEffect } from "react";
import {
  Card,
  TextField,
  CardContent,
  makeStyles,
  Button,
  InputAdornment,
  IconButton,
  Collapse,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Input, Visibility, VisibilityOff } from "@material-ui/icons";
import { hashPassword, TRequestFail, TStatus } from "../staticData/Constants";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import {
  getLastFetchFailure,
  getLoggedIn,
  getStoreStatus,
} from "src/redux/selectors";
import { RootState } from "src/redux/reducers";
import { loginAttempt } from "src/redux/actions";
import {
  FetchFailedAction,
  LoginCompleteAction,
  TUserCredentials,
} from "src/staticData/types";

export interface StoreProps {
  loggedIn: boolean;
  status: TStatus;
  failReason: TRequestFail;
  tryLogin: (
    creds: TUserCredentials
  ) => Promise<LoginCompleteAction | FetchFailedAction>;
}

export const styles = makeStyles((theme) => ({
  card: {
    maxWidth: "800px",
    minWidth: "300px",
    margin: "30px",
    marginTop: "10vh",
    minHeight: "320px",
    display: "flex",
    [theme.breakpoints.down("xs")]: { marginTop: "10px" },
  },
  root: {
    display: "flex",
    justifyContent: "center",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 3,
  },
  inputs: {
    flex: 1,
  },
  cardActions: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
  },
  alert: {
    position: "absolute",
    top: "62px",
  },
}));

const Login: FC<StoreProps> = ({ loggedIn, tryLogin, status, failReason }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const classes = styles();
  const history = useHistory();

  const alertLoginFail = () => {
    return (
      <Collapse in={alertActive} className={classes.alert}>
        <Alert variant="filled" severity="error">
          Login unsuccessful!
        </Alert>
      </Collapse>
    );
  };

  const alert = alertLoginFail();

  useEffect(() => {
    if (loggedIn) {
      history.push("/");
    }
  }, [loggedIn, history]);

  useEffect(() => {
    if (alertActive) {
      let timer = setTimeout(() => {
        if (alertActive) {
          setAlertActive(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [alertActive]);

  useEffect(() => {
    if (status !== "FETCH_NEEDED") return;
    switch (failReason) {
      case "login":
        setAlertActive(true);
        return;
      default:
        return;
    }
  }, [status, failReason]);

  const updatePassword = (e: string) => {
    setPassword(e);
  };

  const updateUsername = (e: string) => {
    setUsername(e);
  };

  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    if (status === "FETCHING" || status === "UPDATING") return;
    let userAuth;
    if (username.search("@") !== -1) {
      userAuth = { password: hashPassword(password), email: username };
    } else {
      userAuth = { password: hashPassword(password), username };
    }
    tryLogin(userAuth);
  };

  return (
    <div className={classes.root}>
      {alert}
      <Card className={classes.card}>
        <form
          onSubmit={onSubmit}
          autoComplete="on"
          className={classes.cardContent}
        >
          <CardContent className={classes.cardContent}>
            <Typography variant="h3" className={classes.inputs}>
              login
            </Typography>
            <p />
            <TextField
              className={classes.inputs}
              required
              autoFocus
              id="username"
              label="Username / Email"
              variant="outlined"
              autoComplete="username"
              value={username}
              onChange={(e) => updateUsername(e.target.value)}
            />
            <p />
            <TextField
              className={classes.inputs}
              required
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              autoComplete="current-password"
              variant="outlined"
              value={password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={(_e) => setShowPassword(!showPassword)}
                      onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
                        e.preventDefault()
                      }
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={(e) => updatePassword(e.target.value)}
            />
          </CardContent>
          <CardContent className={classes.cardActions}>
            <Button
              variant="contained"
              color="primary"
              value="Login"
              fullWidth
              endIcon={<Input />}
              type="submit"
            >
              <Typography variant="h5"><b>Login</b></Typography>
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const loggedIn = getLoggedIn(state);
  const status = getStoreStatus(state);
  const failReason = getLastFetchFailure(state);
  // TODO
  // const getPageName = getCurrentPage(state);
  // whenever react-router is pushed to, also want to set the currentpage
  // name in the store for the navbar to render it
  return { loggedIn, status, failReason };
};

const mapActionsToProps = {
  tryLogin: loginAttempt,
};

export default connect(mapStateToProps, mapActionsToProps)(Login);
