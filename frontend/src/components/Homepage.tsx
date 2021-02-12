import {
  Card,
  CardContent,
  makeStyles,
  Typography,
  Grid,
  Button,
  CardHeader,
  Zoom,
  Collapse,
  Fade,
  CardActions,
  IconButton,
  Toolbar,
} from "@material-ui/core";

import { AddCircle, Edit, OpenInNew } from "@material-ui/icons";
import React, { FC, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import {
  getLoggedIn,
  getTasklists,
  getTaskStageCounts,
} from "src/redux/selectors";
import { nonNavbarRoutes } from "src/staticData/Routes";
import { ITasklist, TTasklists } from "src/staticData/types";
import { v4 as genid } from "uuid";
import Tasklist from "./Tasklist";

interface StoreProps {
  tasklists: TTasklists;
  loggedIn: boolean;
}

const style = makeStyles({
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
    maxWidth: "300px",
    minWidth: "300px",
  },
  create: {
    backgroundColor: "#329760",
    color: "#fff",
  },
  createHover: {
    backgroundColor: "#33b864",
  },
  addButton: {
    fontSize: 70,
    backgroundColor: "transparent",
  },
  zoom: {
    maxWidth: "500px",
    maxHeight: "500px",
  },
});

type styletype = ReturnType<typeof style>;

interface CreateProps {
  classes: styletype;
  callback: Function;
}

const CreateTasklistCard: FC<CreateProps> = ({ classes, callback }) => {
  const [hover, setHover] = useState(false);
  return (
    <Grid item key={genid()} className={classes.card}>
      <Card
        className={hover ? classes.createHover : classes.create}
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        elevation={hover ? 4 : 12}
      >
        <Button onClick={() => callback()}>
          <CardContent>
            <Fade in={hover} timeout={500}>
              <Typography variant="h5" className={hover ? classes.createHover : classes.create}>
                Create a new tasklist
              </Typography>
            </Fade>
            <AddCircle className={classes.addButton} />
          </CardContent>
        </Button>
      </Card>
    </Grid>
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
  const taskStages = getTaskStageCounts(tasklist.tasks);
  const date = new Date(tasklist.createdAt);
  const dateString =
    date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear();
  return (
    <Zoom in appear>
      <Grid item className={classes.card}>
        <Card variant="outlined">
          <CardHeader
            title={tasklist.name}
            subheader={`created: ${dateString}`}
          ></CardHeader>
          <CardContent>
            <Typography variant="subtitle1">{tasklist.description}</Typography>
            <br />
            <Typography variant="h6">Tasks</Typography>
            <Toolbar disableGutters className={classes.toolbar}>
              <Typography variant="body2" color="textSecondary" className={classes.toolbar}>
                Active: {taskStages[0] + taskStages[1]}
                <br />
                Completed: {taskStages[2]}
              </Typography>
              <IconButton onClick={() => callback(tasklist._id, false)} >
                <OpenInNew fontSize="large" />
              </IconButton>
              <IconButton onClick={() => callback(tasklist._id, true)} >
                <Edit fontSize="large" />
              </IconButton>
            </Toolbar>
          </CardContent>
        </Card>
      </Grid>
    </Zoom>
  );
};

const displayTasklists = (
  tasklists: TTasklists,
  classes: styletype,
  callback: Function
): Array<JSX.Element> => {
  const tasklistArr = new Array<JSX.Element>(tasklists.length);
  for (let i = 0; i < tasklistArr.length; i++) {
    tasklistArr[i] = (
      <TasklistStub
        key={tasklists[i]._id}
        tasklist={tasklists[i]}
        classes={classes}
        callback={callback}
      />
    );
  }
  return tasklistArr;
};

const Homepage: FC<StoreProps> = ({ tasklists, loggedIn }) => {
  const classes = style();
  const history = useHistory();
  const [leaving, setLeaving] = useState(false);
  const createTasklist = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => history.push(nonNavbarRoutes[1].route), 200);
  };

  const openTasklist = (id: string, edit: boolean) => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => history.push(nonNavbarRoutes[0].route + id, { edit }), 200);
  };

  const displayable = displayTasklists(tasklists, classes, openTasklist);
  const createNew = CreateTasklistCard({ classes, callback: createTasklist });
  return (
    <div className={classes.outer}>
      <Typography variant="h3">Tasklists</Typography>
      <hr />
      <Grid className={classes.root} container spacing={2}>
        {createNew}
        {loggedIn && displayable}
        {loggedIn && displayable}
        {loggedIn && displayable}
        {loggedIn && displayable}
      </Grid>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  // BAD
  // const tasklists = state.tasklistHolder.tasklists;
  // GOOD cuz using a selector
  return { loggedIn: getLoggedIn(state), tasklists: getTasklists(state) };
};

export default connect(mapStateToProps)(Homepage);
