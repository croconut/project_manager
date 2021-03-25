import React, { FC } from "react";
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  makeStyles,
  useScrollTrigger,
} from "@material-ui/core";
import { useHistory } from "react-router";
import { connect } from "react-redux";
import { v4 as genid } from "uuid";
import logo from "src/assets/images/logo.png";
import { FrontendRoute } from "src/staticData/Routes";
import { getLoggedIn, getUserInfo } from "src/redux/selectors";
import { RootState } from "src/redux/reducers";
import { IUserInfo } from "src/staticData/types";

// main route has .name and .route
// secondary routes is array of objects with same parameters
// .name and .route

interface Props {
  mainRoute: FrontendRoute;
  loggedOutRoutes: Array<FrontendRoute>;
  loggedInRoutes: Array<FrontendRoute>;
}

interface StoreProps {
  loggedIn: boolean;
  userInfo: IUserInfo;
}

const createLoggedInIcon = (
  onClick: (event: React.MouseEvent<HTMLElement>) => void,
  username: string
) => {
  return (
    // <IconButton
    //   edge="start"
    //   color="primary"
    //   onClick={menuHandler}
    //   aria-label="menu"
    // >
    //   <MenuIcon />
    // </IconButton>
    <div>
      <Typography>
        Welcome, {" " + username + " "}
        <Button onClick={onClick} color="primary">
          Logout
        </Button>
      </Typography>
    </div>
  );
};

const styles = makeStyles({
  title: { flexGrow: 100, display: "flex", justifyContent: "left" },
  root: {
    position: "sticky",
    paper: {
      backgroundColor: "#fffff",
    },
  },
  image: { width: "32px", height: "32px" },
  lowercase: { textTransform: "none" },
});

const Navbar: FC<Props & StoreProps> = ({
  mainRoute,
  loggedOutRoutes,
  loggedInRoutes,
  loggedIn,
  userInfo,
}) => {
  // only need one menu anchor element since only one menu will be visible at a time
  const history = useHistory();
  const classes = styles();
  const scrolling = useScrollTrigger({ threshold: 10 });

  const createButtons = (routes: Array<FrontendRoute>) => {
    const arrItems: Array<JSX.Element> = new Array(routes.length);
    for (let i = 0; i < arrItems.length; i++) {
      arrItems[i] = (
        <Button
          color="primary"
          variant="outlined"
          style={{ marginLeft: "15px" }}
          onClick={(_e) => {
            history.push(routes[i].route);
          }}
          key={genid()}
        >
          <Typography variant="button">{routes[i].name}</Typography>
        </Button>
      );
    }
    return arrItems;
  };

  const logoutButton = () => history.push("logout");

  const loggedOutItems = createButtons(loggedOutRoutes);
  const loggedInIcon = createLoggedInIcon(logoutButton, userInfo.username);

  return (
    <React.Fragment>
      <AppBar
        position="fixed"
        color={scrolling ? "inherit" : "transparent"}
        elevation={scrolling ? 4 : 0}
      >
        <Toolbar>
          <div className={classes.title}>
            <img
              src={logo}
              className={classes.image}
              alt="project manager logo"
            />
            <Button
              className={classes.lowercase}
              color="primary"
              onClick={() => history.push(mainRoute.route)}
            >
              <Typography variant="h5">{mainRoute.name}</Typography>
            </Button>
          </div>
          {loggedIn && loggedInIcon}
          {!loggedIn && loggedOutItems}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState): StoreProps => {
  // TODO
  // const getPageName = getCurrentPage(state);
  // whenever react-router is pushed to, also want to set the currentpage
  // name in the store for the navbar to render it
  return { loggedIn: getLoggedIn(state), userInfo: getUserInfo(state) };
};

export default connect(mapStateToProps)(Navbar);
