import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import {
  ArrowRight,
  ArrowRightAltOutlined,
  Check,
  Close,
} from "@material-ui/icons";
import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { RouteComponentProps, RouteProps } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import { getTasklistById, separateTasksByType } from "src/redux/selectors";
import { TaskStage } from "src/staticData/Constants";
import { ITask, ITasklist, TTasks } from "src/staticData/types";

import { v4 as genid } from "uuid";
import Expand from "./animations/Expand";

interface ReduxProps {
  tasklist: ITasklist | null;
}

interface RouteParams {
  id: string;
  edit: string;
}

const styles = makeStyles({
  card: {
    width: "90%",
    marginLeft: "5%",
    marginRight: "5%",
  },
  taskCard: {
    width: "300px",
  },
  innerTaskCard: {
    backgroundColor: "#222",
  },
  grow: {
    width: "100%",
    backgroundColor: "#666",
    marginTop: "10px",
    marginBottom: "10px",
  },
  taskButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    textTransform: "none"
  },
  moveTaskButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    textTransform: "none"
  },
  buttonRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

type styletype = ReturnType<typeof styles>;

const TaskViews = (separatedTasks: ITask[][], classes: styletype) => {
  const arr2d = new Array<JSX.Element>(separatedTasks.length);
  for (let i = 0; i < separatedTasks.length; i++) {
    if (separatedTasks[i].length < 1) continue;
    const individualTasks = new Array<JSX.Element>(separatedTasks[i].length);
    for (let j = 0; j < separatedTasks[i].length; j++) {
      const task = separatedTasks[i][j];
      individualTasks[j] = (
        <Card className={classes.grow} key={task._id}>
          <Expand in={true} timeout={200} start={0.8} end={1.0}>
            <Grid item>
              <Button
                fullWidth
                className={classes.taskButton}
                color="primary"
                onClick={() => {}}
              >
                <Typography noWrap>{task.name}</Typography>
              </Button>
              {/* {i < TaskStage.length - 2 && (
                <div className={classes.buttonRow}>
                  <Button fullWidth className={classes.moveTaskButton} color="primary" >
                    <Typography color="textPrimary" >Move task to {TaskStage[i + 1]}</Typography>  
                    <ArrowRightAltOutlined />
                  </Button>
                </div>
              )} */}
            </Grid>
          </Expand>
        </Card>
      );
    }
    arr2d[i] = (
      <Grid item key={genid()} className={classes.taskCard}>
        <Card elevation={3}>
          <CardHeader
            className={classes.innerTaskCard}
            title={TaskStage[i] || "Other Tasks"}
          />
          <CardContent>
            <Grid
              container
              direction="column"
              justify="flex-start"
              alignItems="flex-start"
            >
              {individualTasks}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  }
  return arr2d;
};

const Tasklist: FC<RouteComponentProps<RouteParams> & ReduxProps> = ({
  tasklist,
}) => {
  const classes = styles();
  if (tasklist === null) return <div>No tasklist selected!</div>;
  const separatedTasks = separateTasksByType(tasklist.tasks);
  const taskCards = TaskViews(separatedTasks, classes);
  return (
    <div>
      <Card className={classes.card}>
        <CardHeader
          title={tasklist.name}
          titleTypographyProps={{ variant: "h3" }}
          subheader={"Total tasks: " + tasklist.tasks.length}
        />
        <CardContent>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            spacing={2}
          >
            {taskCards}
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

// we know that location is there but we cant guarantee state or id
const mapStateToProps = (state: RootState, otherProps: any) => {
  if (otherProps.location?.state?.id)
    return {
      tasklist: getTasklistById(state, { id: otherProps.location.state.id }),
    };
  return { tasklist: null };
};

export default connect(mapStateToProps)(Tasklist);
