// reducer for each field we care about from the server's stored data
import { combineReducers } from "redux";
import { tasklistHolder } from "./tasklist";
import serverState from "./serverState";
import storeState from "./storeState";
import userInfo from "./userinfo";
// import username from "./username";
// import icon from "./icon";
// import color from "./color";
// import email from "./email";

const rootReducer = combineReducers({ tasklistHolder, serverState, storeState, userInfo });

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
export type RootReducer = typeof rootReducer;
