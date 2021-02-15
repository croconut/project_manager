import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  makeStyles,
} from "@material-ui/core";

import { DragDropContext, DropResult } from "react-beautiful-dnd";
import React, { FC } from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import { getTasklistById, separateTasksByType } from "src/redux/selectors";
import { TaskStage } from "src/staticData/Constants";
import { ITask, ITasklist } from "src/staticData/types";

import TaskColumn from "./Tasklist/TaskColumn";

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
});

const TaskViews = (separatedTasks: ITask[][]) => {
  const arr2d = new Array<JSX.Element>(separatedTasks.length);
  // the big question here is allowing task cancellation from the
  // drag and drop, and then keeping cancelled tasks always viewable?
  // i guess it should be allowed
  for (let i = 0; i < separatedTasks.length - 1; i++) {
    arr2d[i] = (
      <TaskColumn
        key={i}
        id={i.toString()}
        title={TaskStage[i]}
        tasks={separatedTasks[i]}
      ></TaskColumn>
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
  const taskCards = TaskViews(separatedTasks);
  const onDragEnd = (result: DropResult) => {
    const { draggableId, source, destination, reason, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && 
      destination.index === source.index) return;
    console.log(source);
    console.log(draggableId);
    console.log(destination);
    console.log(reason);
    console.log(type);
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

export default connect(mapStateToProps)(Tasklist);
