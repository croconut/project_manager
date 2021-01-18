import React, { useState } from "react";
import axios from "axios";

const CreateUser = (props) => {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState(["test_user", "test_user_2"]);

  const updateUsername = (e) => {
    setUsername(e);
  };

  const onSubmit = (submission) => {
    submission.preventDefault();

    const user = {
      username: username,
    };
    console.log(user);
    axios.post("/api/users/add", user).then((result) => {
      if (result.status >= 400) {
        console.error("failed to add");
      }
    });

    setUsers([...users, username]);
    setUsername("");
  };

  return (
    <div>
      <h1>Create New Exercise Log</h1>
      <p />
      {/* <p />
      Current users:
      {users.map(item => <p>{item}</p>)} */}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Username: </label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => updateUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="submit"
            value="Create User"
            className="btn btn-primary"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
