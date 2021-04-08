import React, { useState, useEffect, FC } from "react";
import { useHistory } from "react-router-dom";
import {
  Card,
  TextField,
  CardContent,
  Button,
  InputAdornment,
  IconButton,
  Collapse,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import {
  Input as InputIcon,
  Visibility,
  VisibilityOff,
} from "@material-ui/icons";

import {
  EMAIL_REGEX,
  hashPassword,
  MAX_CHAR,
  MIN_CHAR,
  MIN_NO_RESTRICTIONS,
  PASSWORD_REQ,
  TRequestFail,
  TStatus,
  USER_REGEX,
} from "../staticData/Constants";
import { styles } from "./Login";
import {
  FetchFailedAction,
  LoginCompleteAction,
  IUserRegister,
} from "src/staticData/types";
import { connect } from "react-redux";
import {
  getLastFetchFailure,
  getLoggedIn,
  getStoreStatus,
} from "src/redux/selectors";
import { signUpAttempt } from "src/redux/actions";
import { RootState } from "src/redux/reducers";

// general summary of logic: just add user when they

interface StoreProps {
  loggedIn: boolean;
  status: TStatus;
  failReason: TRequestFail;
  signUp: (
    user: IUserRegister
  ) => Promise<FetchFailedAction | LoginCompleteAction>;
}

const Register: FC<StoreProps> = ({ loggedIn, status, failReason, signUp }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDuplicate, setShowPasswordDuplicate] = useState(false);
  const [passwordDuplicate, setPasswordDuplicate] = useState("");
  // set to true for now, then as user writes in form it gets updated to not okay
  // as needed
  const [passwordMatches, setPasswordMatches] = useState(true);
  const [passwordOkay, setPasswordOkay] = useState(true);
  const [email, setEmail] = useState("");
  const [emailOkay, setEmailOkay] = useState(true);
  const [usernameOkay, setUsernameOkay] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertActive, setAlertActive] = useState(false);
  const history = useHistory();
  const classes = styles();

  const alertLoginFail = () => {
    return (
      <Collapse in={alertActive} className={classes.alert}>
        <Alert variant="filled" severity="error">
          {errorMessage}
        </Alert>
      </Collapse>
    );
  };

  const alert = alertLoginFail();

  useEffect(() => {
    if (alertActive) {
      let errmsg = errorMessage;
      let timer = setTimeout(() => {
        if (errmsg === errorMessage) setAlertActive(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [alertActive, errorMessage]);

  useEffect(() => {
    if (loggedIn) {
      history.push("/");
    }
  }, [loggedIn, history, status]);

  useEffect(() => {
    if (status !== "FETCH_NEEDED") return;
    switch (failReason) {
      case "email_and_username_match":
        setErrorMessage("Email and username already taken");
        setUsername("");
        setEmail("");
        setAlertActive(true);
        return;
      case "email_match":
        setErrorMessage("Email already taken");
        setEmail("");
        setAlertActive(true);
        return;
      case "username_match":
        setErrorMessage("Username already taken");
        setUsername("");
        setAlertActive(true);
        return;
      case "lookup":
        setErrorMessage("User information error, try refreshing the page");
        setAlertActive(true);
        return;
      case "unknown":
        setErrorMessage("Server did not respond, please try again later");
        setAlertActive(true);
        return;
      default:
        return;
    }
  }, [failReason, status]);

  const checkMatches = (p: string, p2: string) => {
    setPasswordMatches(p === p2);
  };

  const validatePassword = (password: string, duplicate: string) => {
    checkMatches(password, duplicate);
    setPasswordOkay(
      password.length <= MAX_CHAR &&
        (password.length >= MIN_NO_RESTRICTIONS || PASSWORD_REQ.test(password))
    );
  };

  const updatePasswordDuplicate = (e: string) => {
    setPasswordDuplicate(e);
    checkMatches(password, e);
  };

  const updatePassword = (e: string) => {
    setPassword(e);
    validatePassword(e, passwordDuplicate);
  };

  const updateEmail = (e: string) => {
    setEmail(e);
    setEmailOkay(EMAIL_REGEX.test(e));
  };

  const updateUsername = (e: string) => {
    if (e === "" || USER_REGEX.test(e)) setUsername(e);
    setUsernameOkay(e.length > 2);
  };

  const CheckSubmittable = () => {
    let earlyReturn = false;
    if (!emailOkay) {
      setErrorMessage("Emails must have an '@' and a '.'");
      earlyReturn = true;
    }
    if (password !== passwordDuplicate) {
      setErrorMessage("Passwords don't match");
      earlyReturn = true;
    }
    if (!usernameOkay) {
      setErrorMessage("Username must be 2+ characters");
      earlyReturn = true;
    }
    return earlyReturn;
  };

  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    if (status === "UPDATING" || status === "FETCHING") return;
    if (CheckSubmittable()) {
      setAlertActive(true);
      return;
    }
    const user: IUserRegister = {
      username: username,
      email: email,
      password: hashPassword(password),
    };
    signUp(user);
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
              sign up
            </Typography>
            <p />
            <TextField
              className={classes.inputs}
              autoFocus
              required
              error={!usernameOkay}
              helperText={usernameOkay ? "" : "min. 3 characters"}
              id="username"
              label="Username"
              variant="outlined"
              autoComplete="username"
              value={username}
              onChange={(e) => updateUsername(e.target.value)}
            />
            <p />
            <TextField
              className={classes.inputs}
              required
              error={!emailOkay}
              helperText={emailOkay ? "" : "must have '@' and '.'"}
              id="email"
              label="Email"
              variant="outlined"
              autoComplete="email"
              value={email}
              onChange={(e) => updateEmail(e.target.value)}
            />
            <p />
            <TextField
              className={classes.inputs}
              required
              error={!passwordOkay}
              helperText={
                !passwordOkay ? "must meet requirements stated below" : ""
              }
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
            <p />
            <TextField
              className={classes.inputs}
              required
              error={!passwordMatches && password !== ""}
              helperText={
                !passwordMatches && password !== ""
                  ? "passwords must match"
                  : ""
              }
              id="password-duplicate"
              type={showPasswordDuplicate ? "text" : "password"}
              label="Confirm Password"
              autoComplete="current-password"
              variant="outlined"
              value={passwordDuplicate}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={(_e) =>
                        setShowPasswordDuplicate(!showPasswordDuplicate)
                      }
                      onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
                        e.preventDefault()
                      }
                    >
                      {showPasswordDuplicate ? (
                        <Visibility />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={(e) => updatePasswordDuplicate(e.target.value)}
            />
            <br />
            <Typography variant="subtitle1">
              Passwords must have lower and uppercase letters and numbers OR be{" "}
              {MIN_NO_RESTRICTIONS}+ characters long
              <br />
              Passwords may also use special characters: !@#$%^*()_-
              <br />
            </Typography>

            <Typography variant="subtitle1">
              Passwords must be {MIN_CHAR}-{MAX_CHAR} characters long
              <br />
            </Typography>
          </CardContent>
          <CardContent className={classes.cardActions}>
            <Button
              color="primary"
              variant="contained"
              value="Sign Up"
              type="submit"
              fullWidth
              endIcon={<InputIcon />}
            >
              <Typography variant="h5" ><b>Sign Up</b></Typography>
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
  signUp: signUpAttempt,
};

export default connect(mapStateToProps, mapActionsToProps)(Register);
