import React, { useState, FC } from "react";
import { loginRouter } from "../staticData/Routes";
import axios, { AxiosError, AxiosResponse } from "axios";
import { hashPassword } from "../staticData/Constants";

interface UserAuth {
  email?: string;
  username?: string;
  password: string;
}

const Login: FC<any> = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const updatePassword = (e: string) => {
    setPassword(e);
  };

  const updateUsername = (e: string) => {
    setUsername(e);
  };

  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    let userAuth: UserAuth = { password: hashPassword(password)};
    if (username.search('@')) {
      userAuth.email = username;
    }
    else {
      userAuth.username = username;
    }
    axios
      .post(loginRouter.route, userAuth, { withCredentials: true })
      .then((result: AxiosResponse) => {
        // get myinfo after successful login
        console.log(result.status);
      })
      .catch((err: AxiosError) => {
        // failed to login somehow
        console.error(err);
        console.error(err.response);
      });
  };

  return (
    <div>
      <h1>Login</h1>
      <p /> 
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Username / Email: </label>
          <input
            type="text"
            className="form-control"
            autoComplete="username"
            value={username}
            onChange={(e) => updateUsername(e.target.value)}
          />
          <label>Password: </label>
          <input
            type="password"
            name="password"
            className="form-control password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="submit"
            value="Login"
            className="btn btn-primary"
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
