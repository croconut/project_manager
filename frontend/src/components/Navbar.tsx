import React, { FC, useState } from "react";
import {
  AppBar,
  IconButton,
  Button,
  MenuItem,
  Toolbar,
  Typography,
  makeStyles,
  useScrollTrigger,
} from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import { useHistory } from "react-router";
import { connect } from "react-redux";
import { v4 as genid } from "uuid";
import logo from "src/assets/images/logo.png";
import { FrontendRoute } from "src/staticData/Routes";
import { getLoggedIn } from "src/redux/selectors";
import { RootState } from "src/redux/reducers";
import PopupMenu from "src/components/helpers/PopupMenu";

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
}

const createLoggedInIcon = (
  menuHandler: (event: React.MouseEvent<HTMLElement>) => void
) => {
  return (
    <IconButton
      edge="start"
      color="primary"
      onClick={menuHandler}
      aria-label="menu"
    >
      <MenuIcon />
    </IconButton>
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
}) => {
  // only need one menu anchor element since only one menu will be visible at a time
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const classes = styles();
  const scrolling = useScrollTrigger({ threshold: 10 });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // TODO connect to store, check if userinfo is set, if so, set loggedin to true
  const createMenu = (routes: Array<FrontendRoute>, menuID: string) => {
    const arrItems: Array<JSX.Element> = new Array(routes.length);
    for (let i = 0; i < arrItems.length; i++) {
      arrItems[i] = (
        <MenuItem
          color="inherit"
          onClick={(_e) => {
            handleClose();
            history.push(routes[i].route);
          }}
          key={genid()}
        >
          {routes[i].name}
        </MenuItem>
      );
    }
    return (
      <PopupMenu
        menuID={menuID}
        open={open}
        anchor={anchorEl}
        onClose={handleClose}
        children={arrItems}
      />
    );
  };

  const createButtons = (routes: Array<FrontendRoute>) => {
    const arrItems: Array<JSX.Element> = new Array(routes.length);
    for (let i = 0; i < arrItems.length; i++) {
      arrItems[i] = (
        <Button
          color="primary"
          variant="outlined"
          style={{ marginLeft: "15px" }}
          onClick={(_e) => {
            handleClose();
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

  const loggedOutItems = createButtons(loggedOutRoutes);
  const loggedInItems = createMenu(loggedInRoutes, "log-out-menu");
  const loggedInIcon = createLoggedInIcon(handleMenu);

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
          {loggedIn && loggedInItems}
          {!loggedIn && loggedOutItems}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState): StoreProps => {
  const loggedIn = getLoggedIn(state);
  // TODO
  // const getPageName = getCurrentPage(state);
  // whenever react-router is pushed to, also want to set the currentpage
  // name in the store for the navbar to render it
  return { loggedIn };
};

export default connect(mapStateToProps)(Navbar);
