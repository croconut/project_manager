import React, { useState, useRef, /*useEffect,*/ FC } from "react";
import DatePicker from "react-date-picker";
// import axios from "axios";

interface Props { none?: string };

const CreateExercise: FC<Props> = (_props) => {
  const userInput = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(0);
  const [date, setDate] = useState(new Date());

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

  // console.log("create exercise rerender");
  const updateName = (e: string) => {
    // validation checks here
    if (e === null || e === undefined) return;
    console.log("updating username");
    setName(e);
  };

  const updateDescription = (e: string) => {
    setDescription(e);
  };

  const updateDuration = (e: string) => {
    const num = Number(e);
    if (!isNaN(num)) setDuration(num);
  };

  const updateDate = (e: Date | Date[]) => {
    if (e instanceof Date)
      setDate(e);
    else if (e.length > 0)
      setDate(e[0]);
  };

  const onSubmit = (submission: any) => {
    submission.preventDefault();
    if (name === "") return;

    const exercise = {
      username: name,
      description: description,
      duration: duration,
      date: date,
    };

    console.log(exercise);

    // axios
    //   .post(addExercise, exercise)
    //   .then((result) => {
    //     if (result.status >= 400) {
    //       console.error("failed to add");
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    // return to homepage on submission
    // window.location = "/";
    updateName("");
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
          <label>Exercise Name: </label>
          <input
            ref={userInput}
            required
            className="form-control"
            value={name}
            onChange={(e) => updateName(e.target.value)}
          />
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
