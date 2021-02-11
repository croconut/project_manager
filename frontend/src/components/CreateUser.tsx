import React, { useState, useEffect, FC } from "react";
import { useHistory } from "react-router-dom";
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

import axios, { AxiosError, AxiosResponse } from "axios";
import { registerRouter, usersPrivateInfo } from "../staticData/Routes";
import {
  EMAIL_REGEX,
  hashPassword,
  // EMAIL_REGEX,
  MAX_CHAR,
  MIN_CHAR,
  MIN_NO_RESTRICTIONS,
  PASSWORD_REQ,
  USER_REGEX,
} from "../staticData/Constants";
import { styles, StoreProps } from "./Login";
import { isTasklists } from "src/staticData/types";
import { connect } from "react-redux";
import { getLoggedIn } from "src/redux/selectors";
import { updateTasklistsFromServer } from "src/redux/actions";
import { RootState } from "src/redux/reducers";

// general summary of logic: just add user when they

const CreateUser: FC<StoreProps> = ({ loggedIn, replaceTasklists }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDuplicate, setShowPasswordDuplicate] = useState(false);
  const [passwordDuplicate, setPasswordDuplicate] = useState("");
  const [passwordMatches, setPasswordMatches] = useState(true);
  const [passwordMinChar, setPasswordMinChar] = useState(false);
  const [passwordHasAlphaNumerics, setPasswordHasAlphaNumerics] = useState(
    false
  );
  const [passwordOkay, setPasswordOkay] = useState("");
  const [email, setEmail] = useState("");
  const [emailOkay, setEmailOkay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  }, [loggedIn, history]);

  const checkMatches = (p: string, p2: string) => {
    setPasswordMatches(p === p2);
  };

  const validatePassword = (password: string, duplicate: string) => {
    checkMatches(password, duplicate);
    setPasswordMinChar(
      MAX_CHAR >= password.length && password.length >= MIN_CHAR
    );
    setPasswordHasAlphaNumerics(
      password.length >= MIN_NO_RESTRICTIONS || PASSWORD_REQ.test(password)
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

  useEffect(() => {
    if (passwordMatches && passwordMinChar && passwordHasAlphaNumerics) {
      setPasswordOkay("text-success");
    } else {
      setPasswordOkay("");
    }
  }, [passwordMatches, passwordMinChar, passwordHasAlphaNumerics]);

  const updateUsername = (e: string) => {
    if (e === "" || USER_REGEX.test(e)) setUsername(e);
  };

  const onSubmit = (submission: React.FormEvent) => {
    if (submitting) return;
    if (!emailOkay) return;
    if (password !== passwordDuplicate) {
      return;
    }
    if (!passwordOkay) return;
    if (!email || !username || !password) return;
    setSubmitting(true);
    const user = {
      username: username,
      email: email,
      password: hashPassword(password),
    };
    console.log(user);
    //TODO check that not hitting database with duplicate to our knowledge
    axios
      .post(registerRouter.route, user)
      .then((result: AxiosResponse) => {
        const initUser = async () => {
          axios
            .get(usersPrivateInfo.route, {
              withCredentials: true,
            })
            .then((response: AxiosResponse) => {
              setSubmitting(false);
              if (isTasklists(response.data.tasklists)) {
                replaceTasklists(response.data.tasklists);
                history.push("/");
              } else {
                //errored out, we're not logged in yet
                setErrorMessage("User information error, try refreshing");
                setAlertActive(true);
              }
            })
            .catch((error: AxiosError) => {
              setErrorMessage(
                "Information could not be retrieved, try refreshing"
              );
              setAlertActive(true);
              setSubmitting(false);
            });
          // here imma update the tasklists assuming it came
          // TODO check for error code and wait for login signal complete if
          // error out in some way
        };
        initUser();
      })
      .catch((err: AxiosError) => {
        setSubmitting(false);
        setAlertActive(true);
        if (err.response === undefined || err.response.status !== 409) {
          console.log(err);
          console.log(err.response);
          setErrorMessage("Server did not respond, please try again later");
          return;
        }
        if (err.response.data.username) {
          if (err.response.data.email) {
            setErrorMessage("Email and username already taken");
            setUsername("");
            setEmail("");
          } else {
            setErrorMessage("Username already taken");
            setUsername("");
          }
        } else if (err.response.data.email) {
          setErrorMessage("Email already taken");
          setEmail("");
        }
      });
  };

  return (
    <div className={classes.root}>
      {alert}
      <Card className={classes.card}>
        <form
          onSubmit={onSubmit}
          noValidate
          autoComplete="on"
          className={classes.cardContent}
        >
          <CardContent className={classes.cardContent}>
            <h1 className={classes.inputs}>Sign Up</h1>
            <p />
            <TextField
              className={classes.inputs}
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
              id="email"
              label="Email"
              variant="outlined"
              autoComplete="Email"
              value={email}
              onChange={(e) => updateEmail(e.target.value)}
            />
            <p />
            <TextField
              className={classes.inputs}
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
              id="password"
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
            {!passwordMatches && (
              <Typography variant="subtitle2" color="error">
                Passwords must match
              </Typography>
            )}
            {!passwordHasAlphaNumerics && (
              <Typography variant="subtitle2" color="error">
                Passwords must have lower and uppercase letters and numbers OR
                be {MIN_NO_RESTRICTIONS}+ characters long
                <br />
                Passwords may also use special characters: !@#$%^*()_-
                <br />
              </Typography>
            )}
            {!passwordMinChar && (
              <Typography variant="subtitle2" color="error">
                Passwords must be {MIN_CHAR}-{MAX_CHAR} characters long
                <br />
              </Typography>
            )}
          </CardContent>
          <CardContent className={classes.cardActions}>
            <Button
              variant="outlined"
              value="Sign Up"
              endIcon={<Input />}
              onClick={onSubmit}
            >
              Sign Up
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
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

export default connect(mapStateToProps, mapActionsToProps)(CreateUser);