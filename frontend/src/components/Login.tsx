import React, { useState, FC, useEffect } from "react";
import { loginRouter, usersPrivateInfo } from "../staticData/Routes";
import {
  Card,
  TextField,
  CardContent,
  makeStyles,
  Button,
  InputAdornment,
  IconButton,
  Collapse,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Input, Visibility, VisibilityOff } from "@material-ui/icons";
import axios, { AxiosError, AxiosResponse } from "axios";
import { hashPassword } from "../staticData/Constants";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { getLoggedIn } from "src/redux/selectors";
import { RootState } from "src/redux/reducers";
import { updateTasklistsFromServer } from "src/redux/actions";
import { isTasklists, TasklistsAction, TTasklists } from "src/staticData/types";

interface UserAuth {
  email?: string;
  username?: string;
  password: string;
}

export interface StoreProps {
  loggedIn: boolean;
  replaceTasklists: (tasklists: TTasklists) => TasklistsAction;
}

export const styles = makeStyles({
  card: {
    maxWidth: "800px",
    minWidth: "400px",
    margin: "30px",
    minHeight: "400px",
    display: "flex",
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
  }
});

const Login: FC<StoreProps> = ({ loggedIn, replaceTasklists }) => {
  const [submitting, setSubmitting] = useState(false);
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

  const updatePassword = (e: string) => {
    setPassword(e);
  };

  const updateUsername = (e: string) => {
    setUsername(e);
  };

  const onSubmit = (submission: React.FormEvent) => {
    if (submitting) return;
    // set alert notification that they need to fill in the
    // username and password to submit form
    if (!username) return;
    if (!password) return;
    setSubmitting(true);
    let userAuth: UserAuth = { password: hashPassword(password) };
    if (username.search("@") !== -1) {
      userAuth.email = username;
    } else {
      userAuth.username = username;
    }
    axios
      .post(loginRouter.route, userAuth, { withCredentials: true })
      .then(async (_result: AxiosResponse) => {
        // get myinfo after successful login
        const initUser = async () => {
          axios
            .get(usersPrivateInfo.route, {
              withCredentials: true,
            })
            .then((response: AxiosResponse) => {
              if (isTasklists(response.data.tasklists)) {
                replaceTasklists(response.data.tasklists);
                history.push("/");
              } else {
                //errored out, we're not logged in yet
                setAlertActive(true);
                setSubmitting(false);
              }
            })
            .catch((error: AxiosError) => {
              setAlertActive(true);
              setSubmitting(false);
            });
          // here imma update the tasklists assuming it came
          // TODO check for error code and wait for login signal complete if
          // error out in some way
        };
        await initUser();
      })
      .catch((err: AxiosError) => {
        // failed to login somehow
        setAlertActive(true);
        setSubmitting(false);
      });
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
            
            <h1 className={classes.inputs}>Login</h1>

            <TextField
              className={classes.inputs}
              required
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
              variant="outlined"
              color="primary"
              value="Login"
              endIcon={<Input />}
              onClick={onSubmit}
            >
              Login
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

export default connect(mapStateToProps, mapActionsToProps)(Login);
