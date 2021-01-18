import React, { useState, useRef } from "react";
import DatePicker from "react-date-picker";

const CreateExercise = (props) => {
  const userInput = useRef(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(0);
  const [date, setDate] = useState(new Date());
  const [users, setUsers] = useState(["test_user", "test_user_2"]);

  const updateUsername = (e) => {
    // validation checks here
    setUsername(e);
  };

  const updateDescription = (e) => {
    setDescription(e);
  };

  const updateDuration = (e) => {
    setDuration(Number(e));
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
      username: username,
      description: description,
      duration: duration,
      date: date,
    };

    console.log(exercise);

    // return to homepage on submission
    // window.location = "/";
    setUsername("");
    setDescription("");
    setDuration(0);
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
