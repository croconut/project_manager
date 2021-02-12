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

type Props = {
  store: RootStore;
};

const theme = responsiveFontSizes(
  createMuiTheme({
    /*
  props: {
    // Name of the component ⚛️
    MuiButtonBase: {
      // The default props to change
      disableRipple: true, // No more ripple, on the whole application 💣!
    },
  },
  */
    palette: {
      primary: {
        main: "#444",
      },
      secondary: {
        main: "#19857b",
      },
      error: {
        main: "#ff1744",
      },
      background: {
        default: "#222",
        paper: "#0244a1",
      },
      text: {
        primary: "#fff",
        secondary: "#ddd",
      },
    },
    typography: {
      fontFamily: "Roboto",
    },
    overrides: {
      // Style sheet name ⚛️
      MuiButton: {
        // Name of the rule
        text: {
          // Some CSS
          // background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
        },
      },
    },
  })
);

const Root: FC<Props> = ({ store }): ReactElement<null> => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <App />
        </CssBaseline>
      </ThemeProvider>
    </Provider>
  );
};

export default Root;
