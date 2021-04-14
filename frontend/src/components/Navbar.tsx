import React, { FC, useEffect, useState } from "react";
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  makeStyles,
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
    <div>
      <Typography variant="body1" noWrap>
        Welcome, {" " + username + " "}
        <Button onClick={onClick} color="primary">
          Logout
        </Button>
      </Typography>
    </div>
  );
};

const styles = makeStyles((theme) => ({
  title: { flexGrow: 100, display: "flex", justifyContent: "left" },
  root: {
    position: "sticky",
    paper: {
      backgroundColor: "#fffff",
    },
  },
  image: {
    marginTop: "8px",
    width: "16px",
    height: "16px",
    [theme.breakpoints.up("sm")]: { width: "32px", height: "32px" },
  },
  lowercase: { textTransform: "none" },
}));

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
  const [scrollUp, setScrollUp] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [latestScrollTop, setLatestScrollTop] = useState(0);
  const createButtons = (routes: Array<FrontendRoute>) => {
    const arrItems: Array<JSX.Element> = new Array(routes.length);
    for (let i = 0; i < arrItems.length; i++) {
      arrItems[i] = (
        <Button
          color="primary"
          variant="outlined"
          disableElevation
          style={{ marginLeft: "0.45rem" }}
          onClick={(_e) => {
            history.push(routes[i].route);
          }}
          key={genid()}
        >
          <Typography variant="body1">{routes[i].name}</Typography>
        </Button>
      );
    }
    return arrItems;
  };

  const logoutButton = () => history.push("/logout");

  const loggedOutItems = createButtons(loggedOutRoutes);
  const loggedInIcon = createLoggedInIcon(logoutButton, userInfo.username);

  const scrollEvent = (e: Event) => {
    setLatestScrollTop(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollEvent);
    // return function to be called when unmounted
    return () => {
      window.removeEventListener("scroll", scrollEvent);
    };
  }, []);

  useEffect(() => {
    if (latestScrollTop > lastScrollTop) {
      setScrollUp(true);
      setLastScrollTop(latestScrollTop);
    } else if (latestScrollTop < lastScrollTop) {
      setScrollUp(false);
      setLastScrollTop(latestScrollTop);
    } else if (latestScrollTop === 0) {
      setScrollUp(true);
    }
  }, [lastScrollTop, latestScrollTop]);

  return (
    <React.Fragment>
      {(lastScrollTop === 0 || !scrollUp) && (
        <AppBar
          position="fixed"
          color={!scrollUp ? "inherit" : "transparent"}
          elevation={!scrollUp ? 4 : 0}
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
                <Typography variant="h5">
                  {mainRoute.name}
                </Typography>
              </Button>
            </div>
            {loggedIn && loggedInIcon}
            {!loggedIn && loggedOutItems}
          </Toolbar>
        </AppBar>
      )}
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
