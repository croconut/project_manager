import {
  Card,
  CardContent,
  makeStyles,
  Typography,
  Grid,
  Button,
  CardHeader,
  IconButton,
  Toolbar,
  Grow,
} from "@material-ui/core";

import { AddCircle, OpenInNew } from "@material-ui/icons";
import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import { getLoggedIn, getStoreStatus, getTasklists } from "src/redux/selectors";
import { nonNavbarRoutes } from "src/staticData/Routes";
import { ITasklist, TTasklists } from "src/staticData/types";
import { v4 as genid } from "uuid";
import Expand from "./animations/Expand";
import WaitingOverlay from "./helpers/WaitingOverlay";
import CreateTasklist from "./Tasklist/CreateTasklist";

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

type styletype = ReturnType<typeof style>;

interface CreateProps {
  classes: styletype;
  callback: Function;
  open: boolean;
  onExit: () => void;
}

const CreateTasklistCard: FC<CreateProps> = ({
  classes,
  callback,
  open,
  onExit,
}) => {
  const [hover, setHover] = useState(false);
  const exitWrapper = () => {
    setHover(false);
    onExit();
  };
  return (
    <Grow in={open} onExited={exitWrapper} unmountOnExit={true}>
      <Expand in={hover} timeout={150} start={0.9} end={1.05}>
        <Grid item key={genid()} className={classes.card}>
          <Card
            className={classes.create}
            onMouseOver={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            elevation={hover ? 12 : 2}
          >
            <Button fullWidth onClick={() => callback()}>
              <CardContent>
                <Typography variant="h5" className={classes.create}>
                  Create a new tasklist
                </Typography>
                <br />
                <br />
                <AddCircle className={classes.addButton} />
              </CardContent>
            </Button>
          </Card>
        </Grid>
      </Expand>
    </Grow>
  );
};

interface TasklistStubProps {
  classes: styletype;
  tasklist: ITasklist;
  callback: Function;
}

const TasklistStub: FC<TasklistStubProps> = ({
  classes,
  tasklist,
  callback,
}) => {
  const [hover, setHover] = useState(false);
  const [date, setDate] = useState("");
  const [taskStages, setTaskStages] = useState<Array<number>>([]);
  useEffect(() => {
    setDate(new Date(tasklist.createdAt).toLocaleDateString());
    setTaskStages([
      tasklist.stage1.length,
      tasklist.stage2.length,
      tasklist.stage3.length,
      tasklist.stage4.length,
    ]);
  }, [
    tasklist.createdAt,
    tasklist.stage1.length,
    tasklist.stage2.length,
    tasklist.stage3.length,
    tasklist.stage4.length,
  ]);
  return (
    <Expand in={hover} timeout={150} start={0.9} end={1.05}>
      <Grid item className={classes.card}>
        <Card
          variant="outlined"
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <CardHeader
            title={tasklist.name}
            subheader={`created: ${date}`}
          ></CardHeader>
          <CardContent>
            <Typography noWrap color="textSecondary" variant="subtitle1">
              {tasklist.description}
            </Typography>
            <br />
            <Typography variant="h6">Tasks</Typography>
            <Toolbar disableGutters className={classes.toolbar}>
              <Typography
                variant="body2"
                color="textSecondary"
                className={classes.toolbar}
              >
                Active: {taskStages[0] + taskStages[1]}
                <br />
                Completed: {taskStages[2]}
              </Typography>
              <IconButton
                color="primary"
                onClick={() => callback(tasklist._id, false)}
              >
                <OpenInNew fontSize="large" />
              </IconButton>
            </Toolbar>
          </CardContent>
        </Card>
      </Grid>
    </Expand>
  );
};

const displayTasklists = (
  tasklists: TTasklists,
  classes: styletype,
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
        history.push("/join");
      } else if (storeState === "SYNCED") {
        history.push("/login");
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
            <CreateTasklistCard
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
  // BAD
  // const tasklists = state.tasklistHolder.tasklists;
  // GOOD cuz using a selector
  return {
    loggedIn: getLoggedIn(state),
    tasklists: getTasklists(state),
    storeState: getStoreStatus(state),
  };
};

export default connect(mapStateToProps)(Homepage);
