import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiRoutes } from "../staticData/Routes";

const Login = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState(["test_user", "test_user_2"]);

  const { addUser, getUsers } = apiRoutes;

  const updateUsers = (e) => {
    setUsers(e);
  };

  const updatePassword = (e) => {
    setPassword(e);
  };

  // useEffect(() => {
  //   axios
  //     .get(getUsers)
  //     .then((result) => {
  //       if (result.status >= 400) {
  //         console.error("failed to add");
  //         return;
  //       }
  //       // not using map(element => element.username) because its unacceptably slow
  //       const userArr = new Array(result.data.length);
  //       for (let i = 0; i < userArr.length; i++) {
  //         userArr[i] = result.data[i].username;
  //       }
  //       updateUsers(userArr);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // }, [getUsers]);

  const updateUsername = (e) => {
    setUsername(e);
  };

  const onSubmit = (submission) => {
    submission.preventDefault();

    const user = {
      username: username,
    };
    console.log(user);
    //TODO check that not hitting database with duplicate to our knowledge
    // axios.post(addUser, user).then((result) => {
    //   if (result.status >= 400) {
    //     //TODO display we hit database with duplicate
    //     console.error("failed to add");
    //   }
    // }).catch(err => {
    //   console.error(err);
    // });

    setUsers([...users, username]);
    setUsername("");
  };

  return (
    <div>
      <h1>Login</h1>
      <p /> 
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Username: </label>
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
