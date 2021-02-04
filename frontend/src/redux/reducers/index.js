// reducer for each field we care about from the server's stored data
import { combineReducers } from "redux";
import tasklist from "./tasklist";
import user from "./username";

export default combineReducers({ tasklist, user });
