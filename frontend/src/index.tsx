import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import configureStore from "./redux/configureStore";
import "bootstrap/dist/css/bootstrap.css";
import Root from "./components/Root";
import { Store, CombinedState } from "redux";
import { AllTasklistActions, ITasklistsHolder } from "./staticData/types";

const store: Store<
  CombinedState<{ tasklistHolder: ITasklistsHolder }>,
  AllTasklistActions
> = configureStore();

ReactDOM.render(<Root store={store} />, document.getElementById("root"));
