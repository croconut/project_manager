import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-date-picker";
import axios from "axios";
import { apiRoutes } from "../staticData/Routes";

const CreateExercise = (props) => {
  const userInput = useRef(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(new Date());
  const [users, setUsers] = useState([]);

  const { getUsers, addExercise } = apiRoutes;

  useEffect(() => {
    axios
      .get(getUsers)
      .then((result) => {
        if (result.status >= 400) {
          console.error("failed to add");
          return;
        }
        // not using map(element => element.username) because its unacceptably slow
        const userArr = new Array(result.data.length);
        for (let i = 0; i < userArr.length; i++) {
          userArr[i] = result.data[i].username;
        }
        updateUsers(userArr);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [getUsers]);

  // console.log("create exercise rerender");
  const updateUsername = (e) => {
    // validation checks here
    if (e === null || e === undefined) return;
    console.log("updating username");
    setUsername(e);
  };

  const updateDescription = (e) => {
    setDescription(e);
  };

  const updateDuration = (e) => {
    const num = Number(e);
    if (!isNaN(num)) setDuration(num);
  };

  const updateDate = (e) => {
    setDate(e);
  };

  const updateUsers = (e) => {
    setUsers(e);
  };

  const onSubmit = (submission) => {
    submission.preventDefault();

    const exercise = {
      username: username === "" ? users[0] : username,
      description: description,
      duration: duration,
      date: date,
    };

    console.log(exercise);

    axios
      .post(addExercise, exercise)
      .then((result) => {
        if (result.status >= 400) {
          console.error("failed to add");
        }
      })
      .catch((err) => {
        console.log(err);
      });

    // return to homepage on submission
    // window.location = "/";
    updateUsername(users[0]);
    setDescription("");
    setDuration("");
    setDate(new Date());
  };

  return (
    <div>
      <h1>Create New Exercise Log</h1>
      <p />
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Username: </label>
          <select
            ref={userInput}
            required
            className="form-control"
            value={username}
            onChange={(e) => updateUsername(e.target.value)}
          >
            {users.map((user) => {
              return (
                <option key={user} value={user}>
                  {user}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label>Description: </label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => updateDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Duration (in minutes): </label>
          <input
            type="text"
            className="form-control"
            value={duration}
            onChange={(e) => updateDuration(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Date: </label>
          <div>
            <DatePicker value={date} onChange={(e) => updateDate(e)} />
          </div>
        </div>
        <div className="form-group">
          <input
            type="submit"
            value="Record Exercise"
            className="btn btn-primary"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateExercise;
