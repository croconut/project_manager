import React from "react";
import ReactDOM from "react-dom";
import configureStore, { RootStore } from "./redux/configureStore";
import Root from "./components/Root";

const store: RootStore = configureStore();

ReactDOM.render(<Root store={store} />, document.getElementById("root"));
