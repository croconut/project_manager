// reducer for each field we care about from the server's stored data
import { combineReducers } from "redux";
import { tasklistReducer } from "./tasklist";
// import username from "./username";
// import icon from "./icon";
// import color from "./color";
// import email from "./email";

export default combineReducers({ tasklistReducer });
