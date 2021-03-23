import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogTitle,
  makeStyles,
  Typography,
} from "@material-ui/core";

import { DragDropContext, DropResult } from "react-beautiful-dnd";
import React, { FC, useState } from "react";
import { connect } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { RootState } from "src/redux/reducers";
import { getTasklistById, separateTasksByType } from "src/redux/selectors";
import { Stage, TaskStage } from "src/staticData/Constants";
import {
  ITask,
  ITasklist,
  TasklistDeleteAction,
  TaskStageAction,
  UpdateFailedAction,
} from "src/staticData/types";

import TaskColumn from "./TaskColumn";
import { restageTask, deleteTasklistAttempt } from "src/redux/actions";
import GridPlus from "../helpers/GridPlus";
import { DeleteForever } from "@material-ui/icons";

interface ReduxProps {
  tasklist: ITasklist | null;
  restageTasks: (
    tasklistID: string,
    taskID: string,
    stage: Stage,
    oldStage: Stage,
    priority: number,
    oldPriority: number
  ) => TaskStageAction;
  deleteTasklist: (id: string) => Promise<TasklistDeleteAction | UpdateFailedAction>;
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
  gridChild: {
    width: "33%",
  },
  gridChildMedium: {
    width: "50%",
  },
  gridChildSmall: {
    width: "100%",
    minWidth: "300px",
  },
  gridParent: {
    width: "100%",
  },
  cancelButton: {
    marginRight: "20px",
  },
  deleteDialog: {
    minWidth: "300px",
  },
}));

const TaskViews = (tasklistID: string, separatedTasks: ITask[][]) => {
  const arr2d = new Array<JSX.Element>(separatedTasks.length);
  // not showing a cancelled tasklist, can hit a trash icon to ditch a task
  // will just mark the task as cancelled
  for (let i = 0; i < separatedTasks.length - 2; i++) {
    const tasks = separatedTasks[i];
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
  restageTasks,
  deleteTasklist
}) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [waitForDelete, setWaitForDelete] = useState(false);
  const classes = styles();
  const isDesktop = useMediaQuery({ minWidth: 992 });
  const isMedium = useMediaQuery({ minWidth: 700 });
  const history = useHistory();

  if (tasklist === null)
    return (
      <div>
        <p />
        Tasklist not found!
      </div>
    );
  const separatedTasks = separateTasksByType(tasklist);
  const taskCards = TaskViews(tasklist._id, separatedTasks);

  const deleteOpenButton = () => {
    setOpenDeleteDialog(true);
  };

  const attemptTasklistDelete = () => {
    deleteTasklist(tasklist._id);
    history.goBack();
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const onDragEnd = (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    restageTasks(
      tasklist._id,
      draggableId,
      TaskStage[parseInt(destination.droppableId)],
      TaskStage[parseInt(source.droppableId)],
      destination.index,
      source.index
    );
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
          <DragDropContext onDragEnd={onDragEnd}>
            <GridPlus
              container
              direction="row"
              crossFill
              orderBy="column"
              fillCount={isDesktop ? 3 : isMedium ? 2 : 1}
              className={classes.gridParent}
              justify="flex-start"
              alignItems="flex-start"
              spacing={2}
              childClassName={
                isDesktop
                  ? classes.gridChild
                  : isMedium
                  ? classes.gridChildMedium
                  : classes.gridChildSmall
              }
              childProps={{ spacing: 2 }}
            >
              {taskCards}
            </GridPlus>
          </DragDropContext>
          <p />
          <Button
            startIcon={<DeleteForever />}
            color="secondary"
            variant="outlined"
            onClick={deleteOpenButton}
          >
            Delete tasklist
          </Button>
        </CardContent>
      </Card>
      <Dialog open={openDeleteDialog} onClose={closeDeleteDialog}>
        <DialogTitle className={classes.deleteDialog}>
          Confirm tasklist deletion?
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            color="primary"
            variant="outlined"
            className={classes.cancelButton}
            autoFocus
          >
            cancel
          </Button>
          <Button
            onClick={attemptTasklistDelete}
            color="secondary"
            variant="outlined"
          >
            delete
          </Button>
        </DialogActions>
      </Dialog>
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
  restageTasks: restageTask,
  deleteTasklist: deleteTasklistAttempt,
};

export default connect(mapStateToProps, mapActionsToProps)(Tasklist);
