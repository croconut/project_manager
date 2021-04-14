import {
  makeStyles,
  Typography,
  Grid,
} from "@material-ui/core";
import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import { getLoggedIn, getStoreStatus, getTasklists } from "src/redux/selectors";
import { landingRoute, nonNavbarRoutes } from "src/staticData/Routes";
import { TTasklists } from "src/staticData/types";
import WaitingOverlay from "./helpers/WaitingOverlay";
import CreateTasklist from "./Tasklist/CreateTasklist";
import CreateTasklistStub from "./Tasklist/CreateTasklistStub";
import TasklistStub from "./Tasklist/TasklistStub";

interface StoreProps {
  tasklists: TTasklists;
  loggedIn: boolean;
  storeState: string;
}

const style = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    paddingLeft: "25px",
    paddingRight: "25px",
    marginTop: "40px",
  },
  cardHeader: {
    display: "block",
    overflow: "hidden"
  },
  outer: {
    margin: "15px",
  },
  toolbar: {
    flexGrow: 1,
  },
  card: {
    width: "325px",
    [theme.breakpoints.down("xs")]: { width: "250px"}
  },
  create: {
    backgroundColor: "#eee",
    color: theme.palette.success.dark,
  },
  addButton: {
    fontSize: 70,
    backgroundColor: "transparent",
    color: theme.palette.success.dark,
  },
  createText: {
    backgroundColor: "transparent",
    color: theme.palette.success.dark,
  },
}));

export type HomepageStyles = ReturnType<typeof style>;

const displayTasklists = (
  tasklists: TTasklists,
  classes: HomepageStyles,
  callback: Function
): Array<JSX.Element> => {
  const tasklistArr = new Array<JSX.Element>(tasklists.length);
  const tasklistsecondary = [...tasklists];
  tasklistsecondary.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  for (let i = 0; i < tasklistArr.length; i++) {
    tasklistArr[i] = (
      <TasklistStub
        key={tasklistsecondary[i]._id}
        tasklist={tasklistsecondary[i]}
        classes={classes}
        callback={callback}
      />
    );
  }
  return tasklistArr;
};

const Homepage: FC<StoreProps> = ({ tasklists, loggedIn, storeState }) => {
  const classes = style();
  const history = useHistory();
  const [create, setCreate] = useState(true);
  const [createForm, setCreateForm] = useState(false);
  const createTasklist = () => {
    setCreate(false);
  };

  const onCreateClose = () => {
    setCreateForm(true);
  };

  const openTasklist = (id: string, edit: boolean) => {
    history.push(nonNavbarRoutes[0].route, { id, edit });
  };

  const onCancelCreate = () => {
    setCreateForm(false);
  };

  const onCreateTasklistExit = () => {
    setCreate(true);
  };

  const onCreateTasklistComplete = () => {
    setCreateForm(false);
  };

  useEffect(() => {
    if (!loggedIn) {
      if (storeState === "FETCH_NEEDED") {
        history.push(landingRoute.route);
      } else if (storeState === "SYNCED") {
        history.push(landingRoute.route);
      }
    }
  }, [history, storeState, loggedIn]);

  const displayable = displayTasklists(tasklists, classes, openTasklist);
  return (
    <div className={classes.outer}>
      <WaitingOverlay wait={!loggedIn} />
      {loggedIn && (
        <React.Fragment>
          <Typography variant="h3">Tasklists</Typography>
          <hr />
          <Grid className={classes.root} container spacing={2}>
            <CreateTasklistStub
              classes={classes}
              callback={createTasklist}
              onExit={onCreateClose}
              open={create}
            />
            <CreateTasklist
              onCancel={onCancelCreate}
              onExit={onCreateTasklistExit}
              onComplete={onCreateTasklistComplete}
              open={createForm}
            />
            {displayable}
          </Grid>
        </React.Fragment>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: getLoggedIn(state),
    tasklists: getTasklists(state),
    storeState: getStoreStatus(state),
  };
};

export default connect(mapStateToProps)(Homepage);
