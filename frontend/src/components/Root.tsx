import React, { FC, ReactElement } from "react";
import { Provider } from "react-redux";
import {
  createMuiTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@material-ui/core/styles";
import { RootStore } from "src/redux/configureStore";
import App from "./App";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeOptions, useMediaQuery } from "@material-ui/core";

type Props = {
  store: RootStore;
};

const unchangedThemeOptions: ThemeOptions = {
  palette: {
    type: "dark",
    primary: {
      main: "#00b0ff",
    },
    secondary: {
      main: "#ff7043",
    },
    warning: {
      main: "#00CAAA",
    },
  },
};

const themeMobile = responsiveFontSizes(
  createMuiTheme({
    ...unchangedThemeOptions,
    typography: {
      fontFamily: "Roboto",
      fontSize: 9.8,
    },
  })
);

const themeDesktop = responsiveFontSizes(
  createMuiTheme({
    ...unchangedThemeOptions,
    typography: {
      fontFamily: "Roboto",
      fontSize: 12,
    },
  })
);

const Root: FC<Props> = ({ store }): ReactElement<null> => {
  const themeSwap = useMediaQuery("(min-width:600px)");
  return (
    <Provider store={store}>
      <ThemeProvider theme={themeSwap ? themeDesktop : themeMobile}>
        <CssBaseline>
          <App />
        </CssBaseline>
      </ThemeProvider>
    </Provider>
  );
};

export default Root;
