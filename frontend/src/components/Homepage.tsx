import {
  Card,
  CardContent,
  makeStyles,
  Typography,
  Grid,
  Button,
  CardHeader,
} from "@material-ui/core";
import { AddCircle } from "@material-ui/icons";
import React, { FC } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import {
  getLoggedIn,
  getTasklists,
  getTaskStageCounts,
} from "src/redux/selectors";
import { nonNavbarRoutes } from "src/staticData/Routes";
import { TTasklists } from "src/staticData/types";
import { v4 as genid } from "uuid";

interface StoreProps {
  tasklists: TTasklists;
  loggedIn: boolean;
}

const style = makeStyles({
  root: {
    flexGrow: 1,
    paddingLeft: "25px",
    paddingRight: "25px",
  },
  card: {
    maxWidth: "300px",
    minWidth: "300px",
  },
  create: {
    backgroundColor: "#05ac72",
    color: "#fff"
  },
});

type styletype = ReturnType<typeof style>;

const createTasklistCard = (classes: styletype, callback: Function) => {
  return (
    <Grid item key={genid()} className={classes.card}>
      <Card className={classes.create}>
        <Button onClick={() => callback()}>
          <CardContent>
            <Typography variant="h5" className={classes.create}>Create a new tasklist</Typography>
            <AddCircle fontSize="large" className={classes.create} />
          </CardContent>
        </Button>
      </Card>
    </Grid>
  );
};

const displayTasklists = (
  tasklists: TTasklists,
  classes: styletype
): Array<JSX.Element> => {
  const tasklistArr = new Array<JSX.Element>(tasklists.length);
  for (let i = 0; i < tasklistArr.length; i++) {
    const taskStages = getTaskStageCounts(tasklists[i].tasks);
    const date = new Date(tasklists[i].createdAt);
    const dateString =
      date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear();
    tasklistArr[i] = (
      <Grid item key={tasklists[i]._id} className={classes.card}>
        <Card variant="outlined">
          <CardHeader
            title={tasklists[i].name}
            subheader={`created: ${dateString}`}
          ></CardHeader>
          <CardContent>
            <Typography variant="subtitle1">
              {tasklists[i].description}
            </Typography>
            <br />
            <Typography variant="h6">Tasks</Typography>
            <Typography variant="body2" color="textSecondary">
              Active: {taskStages[0] + taskStages[1]} Completed: {taskStages[2]}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }
  return tasklistArr;
};

const Homepage: FC<StoreProps> = ({ tasklists, loggedIn }) => {
  const classes = style();
  const history = useHistory();
  const createTasklist = () => history.push(nonNavbarRoutes[1].route);
  const displayable = displayTasklists(tasklists, classes);
  const createNew = createTasklistCard(classes, createTasklist);
  return (
    <Grid className={classes.root} container spacing={2}>
      {createNew}
      {loggedIn && displayable}
      {loggedIn && displayable}
      {loggedIn && displayable}
      {loggedIn && displayable}
    </Grid>
  );
};

const mapStateToProps = (state: RootState) => {
  // BAD
  // const tasklists = state.tasklistHolder.tasklists;
  // GOOD cuz using a selector
  return { loggedIn: getLoggedIn(state), tasklists: getTasklists(state) };
};

export default connect(mapStateToProps)(Homepage);
