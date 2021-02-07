import React, { FC, ReactElement } from "react";
import { Provider } from "react-redux";
import { RootStore } from "src/redux/configureStore";
import App from "./App";

type Props = {
  store: RootStore
};

const Root: FC<Props> = ({ store }) :ReactElement<null> => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default Root;
