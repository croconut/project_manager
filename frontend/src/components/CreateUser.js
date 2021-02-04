import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import crypto from "crypto";
import { registerRouter } from "../staticData/Routes";

const MIN_CHAR = 14;
const MAX_CHAR = 128;
const MIN_NO_RESTRICTIONS = 32;

// just says i need at least one uppercase, lowercase
// and one number and optionally special characters
const PASSWORD_REQ = new RegExp(
  `^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_-]{${MIN_CHAR},${MAX_CHAR}}$`
);

const USER_REGEX = new RegExp("^[A-Za-z][a-zA-Z0-9_-]*$");

const EMAIL_REGEX = new RegExp(`^.+[@]+(?=.*[.]).+$`);

// general summary of logic: just add user when they

const CreateUser = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordDuplicate, setPasswordDuplicate] = useState("");
  const [passwordMatches, setPasswordMatches] = useState(true);
  const [passwordMinChar, setPasswordMinChar] = useState(false);
  const [passwordHasAlphaNumerics, setPasswordHasAlphaNumerics] = useState(
    false
  );
  const [passwordOkay, setPasswordOkay] = useState("");
  const [email, setEmail] = useState("");
  const history = useHistory();
  const resetState = () => {
    setUsername("");
    updatePassword("");
    setPasswordMatches("");
    setEmail("");
  };

  const checkMatches = (p, p2) => {
    setPasswordMatches(p === p2);
  };

  const validatePassword = (password, duplicate) => {
    checkMatches(password, duplicate);
    setPasswordMinChar(
      MAX_CHAR >= password.length && password.length >= MIN_CHAR
    );
    setPasswordHasAlphaNumerics(
      password.length >= MIN_NO_RESTRICTIONS || PASSWORD_REQ.test(password)
    );
  };

  const updatePasswordDuplicate = (e) => {
    setPasswordDuplicate(e);
    checkMatches(password, e);
  };

  const updatePassword = (e) => {
    setPassword(e);
    validatePassword(e, passwordDuplicate);
  };

  const updateEmail = (e) => {
    setEmail(e);
  };

  useEffect(() => {
    if (passwordMatches && passwordMinChar && passwordHasAlphaNumerics) {
      setPasswordOkay("text-success");
    } else {
      setPasswordOkay("");
    }
  }, [passwordMatches, passwordMinChar, passwordHasAlphaNumerics]);

  const updateUsername = (e) => {
    if (e === "" || USER_REGEX.test(e)) setUsername(e);
  };

  const onSubmit = (submission) => {
    if (password !== passwordDuplicate) {
      return;
    }
    submission.preventDefault();
    const sha = crypto.createHash("sha512").update(String(password));
    const result = sha.digest("hex");
    const user = {
      username: username,
      email: email,
      password: result,
    };
    console.log(user);
    //TODO check that not hitting database with duplicate to our knowledge
    axios
      .post(registerRouter.route, user)
      .then((result) => {
        console.log(result.status);
        if (result.status !== 201) {
          //TODO display we hit database with duplicate
          console.error("failed to add");
        }
        else {
          history.push("/");
        }
      })
      .catch((err) => {
        console.error(err);
      });

    //only reset information when form successfully submitted
    //display specific error else
    resetState();
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <p />
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <div className="form-group row">
            <label htmlFor="usernameInput" className="col-sm-2 col-form-label">
              Username:
            </label>
            <div className="col-sm-7">
              <input
                id="usernameInput"
                required
                maxLength={MAX_CHAR}
                autoComplete="username"
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => updateUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="emailInput" className="col-sm-2 col-form-label">
              Email:
            </label>
            <div className="col-sm-7">
              <input
                id="emailInput"
                required
                type="email"
                maxLength={MAX_CHAR}
                className="form-control"
                autoComplete="email"
                value={email}
                onChange={(e) => updateEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group row">
            <label
              htmlFor="passwordFirst"
              className={`col-sm-2 col-form-label ${passwordOkay}`}
            >
              Password:
            </label>
            <div className="col-sm-7">
              <input
                id="passwordFirst"
                required
                type="password"
                name="password"
                maxLength={MAX_CHAR}
                className={`form-control password ${passwordOkay}`}
                autoComplete="current-password"
                value={password}
                onChange={(e) => updatePassword(e.target.value)}
              />
            </div>
            {passwordOkay !== "" && (
              <div className="col-sm-3">
                <i className="fas fa-check" style={{ color: "green" }}></i>
              </div>
            )}
          </div>

          <div className="form-group row">
            <label
              htmlFor="passwordDuplicate"
              className={`col-sm-2 col-form-label ${passwordOkay}`}
            >
              Confirm Password:
            </label>
            <div className="col-sm-7">
              <input
                id="passwordDuplicate"
                required
                type="password"
                name="password"
                className={`form-control password ${passwordOkay}`}
                autoComplete="current-password"
                value={passwordDuplicate}
                onChange={(e) => updatePasswordDuplicate(e.target.value)}
              />
            </div>
            {!passwordMatches && (
              <div className="col-sm-3">
                <small id="passwordHelp" className="text-danger">
                  Passwords must match
                </small>
              </div>
            )}
          </div>

          {!passwordHasAlphaNumerics && (
            <small id="passwordHelp" className="text-danger">
              Passwords must have lower and uppercase letters and numbers OR be{" "}
              {MIN_NO_RESTRICTIONS}+ characters long
              <br />
              Passwords may also use special characters: !@#$%^*()_-
              <br />
            </small>
          )}
          {!passwordMinChar && (
            <small id="passwordHelp" className="text-danger">
              Passwords must be {MIN_CHAR}-{MAX_CHAR} characters long
              <br />
            </small>
          )}
          <br />
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
