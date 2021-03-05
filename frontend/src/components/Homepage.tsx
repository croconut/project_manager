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
} from "@material-ui/core";

import { AddCircle, Edit, OpenInNew } from "@material-ui/icons";
import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import { getLoggedIn, getTasklists } from "src/redux/selectors";
import { nonNavbarRoutes } from "src/staticData/Routes";
import { ITasklist, TTasklists } from "src/staticData/types";
import { v4 as genid } from "uuid";
import Expand from "./animations/Expand";

interface StoreProps {
  tasklists: TTasklists;
  loggedIn: boolean;
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
}

const CreateTasklistCard: FC<CreateProps> = ({ classes, callback }) => {
  const [hover, setHover] = useState(false);
  return (
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
    setTimeout(() => history.push(nonNavbarRoutes[0].route, { id, edit }), 200);
  };

  const displayable = displayTasklists(tasklists, classes, openTasklist);
  const createNew = CreateTasklistCard({ classes, callback: createTasklist });
  return (
    <div className={classes.outer}>
      {loggedIn && (
        <React.Fragment>
          <Typography variant="h3">Recent Tasklists</Typography>
          <hr />
          <Grid className={classes.root} container spacing={2}>
            {createNew}
            {displayable}
          </Grid>
        </React.Fragment>
      )}
      {!loggedIn && <React.Fragment></React.Fragment>}
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
