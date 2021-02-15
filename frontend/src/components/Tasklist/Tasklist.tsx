import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";

import { DragDropContext, DropResult } from "react-beautiful-dnd";
import React, { FC } from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import {
  getTasklistById,
  separateTasksByType,
  sortAlreadySeparatedTasks,
} from "src/redux/selectors";
import { Stage, TaskStage } from "src/staticData/Constants";
import {
  ITask,
  ITasklist,
  TaskOrderAction,
  TaskStageAction,
} from "src/staticData/types";

import TaskColumn from "./TaskColumn";
import { reorderTask, restageTask } from "src/redux/actions";

interface ReduxProps {
  tasklist: ITasklist | null;
  reorderTasks: (
    tasklistID: string,
    taskID: string,
    stage: Stage,
    priority: number,
    oldPriority: number
  ) => TaskOrderAction;
  restageTasks: (
    tasklistID: string,
    taskID: string,
    stage: Stage,
    oldStage: Stage,
    priority: number,
    oldPriority: number
  ) => TaskStageAction;
}

interface RouteParams {
  id: string;
  edit: string;
}

const styles = makeStyles((theme) => ({
  card: {
    width: "90%",
    marginLeft: "5%",
    marginRight: "5%",
  },

}));

const TaskViews = (tasklistID: string, separatedTasks: ITask[][]) => {
  const arr2d = new Array<JSX.Element>(separatedTasks.length);
  // not showing a cancelled tasklist, can hit a trash icon to ditch a task
  // will just mark the task as cancelled
  for (let i = 0; i < separatedTasks.length - 2; i++) {
    const tasks = sortAlreadySeparatedTasks(separatedTasks[i]);
    arr2d[i] = (
      <TaskColumn
        key={i}
        tasklistID={tasklistID}
        id={i.toString()}
        title={TaskStage[i]}
        tasks={tasks}
      ></TaskColumn>
    );
  }
  return arr2d;
};

const Tasklist: FC<RouteComponentProps<RouteParams> & ReduxProps> = ({
  tasklist,
  reorderTasks,
  restageTasks,
}) => {
  const classes = styles();

  if (tasklist === null) return <div>No tasklist selected!</div>;
  const separatedTasks = separateTasksByType(tasklist.tasks);
  const taskCards = TaskViews(tasklist._id, separatedTasks);
  const onDragEnd = (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    if (destination.droppableId === source.droppableId) {
      reorderTasks(
        tasklist._id,
        draggableId,
        TaskStage[parseInt(destination.droppableId)],
        destination.index,
        source.index
      );
    } else {
      restageTasks(
        tasklist._id,
        draggableId,
        TaskStage[parseInt(destination.droppableId)],
        TaskStage[parseInt(source.droppableId)],
        destination.index,
        source.index
      );
    }
    // update task completion ===> change task (draggableId)'s taskstage to
    // destination.droppableId through store action
    // should make specific action that does reordering and re-staging
    // need to give ids a priority --> everything initially ordered
    // by position in actual array, when reordered reorder it s.t.
    // it is placed directly above closest task stage in array
    // and below (check if there's task above and task below)
    // OR
    // give backend list items a priority value
    // order based on priority value, give list starters priority of 1
    // and each one increases, order ascending
    // second option is easier will implement backend changes in support of
    // frontend need
  };

  return (
    <div>
      <Card className={classes.card}>
        <CardHeader
          title={tasklist.name}
          titleTypographyProps={{ variant: "h3" }}
          subheader={"Total tasks: " + tasklist.tasks.length}
        />
        <CardContent>
          <Typography>{tasklist.description}</Typography>

          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            spacing={2}
          >
            <DragDropContext onDragEnd={onDragEnd}>{taskCards}</DragDropContext>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

// we know that location is there but we cant guarantee state or id
// explicitly any... gross
const mapStateToProps = (state: RootState, otherProps: any) => {
  if (otherProps.location?.state?.id)
    return {
      tasklist: getTasklistById(state, { id: otherProps.location.state.id }),
    };
  return { tasklist: null };
};

const mapActionsToProps = {
  reorderTasks: reorderTask,
  restageTasks: restageTask,
};

export default connect(mapStateToProps, mapActionsToProps)(Tasklist);
