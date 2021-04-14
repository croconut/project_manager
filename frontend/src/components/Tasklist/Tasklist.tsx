import React, { FC, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  makeStyles,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import { v4 as genid } from "uuid";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { connect } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { RootState } from "src/redux/reducers";
import {
  getStoreStatus,
  getTasklistById,
  separateTasksByType,
} from "src/redux/selectors";
import { Stage, TaskStage } from "src/staticData/Constants";
import {
  ITask,
  ITasklist,
  TasklistAction,
  TasklistDeleteAction,
  TaskStageAction,
  UpdateFailedAction,
} from "src/staticData/types";

import TaskColumn from "./TaskColumn";
import {
  restageTask,
  deleteTasklistAttempt,
  modifyTasklist,
} from "src/redux/actions";
import GridPlus from "../helpers/GridPlus";
import { DeleteForever, DeleteOutlineRounded, Edit } from "@material-ui/icons";
import WaitingOverlay from "../helpers/WaitingOverlay";
import { MenuTuple } from "./Task";
import PopupMenu from "../helpers/PopupMenu";

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
  modTasklist: (tasklist: ITasklist) => TasklistAction;
  deleteTasklist: (
    id: string
  ) => Promise<TasklistDeleteAction | UpdateFailedAction>;
}

interface RouteParams {
  id: string;
  edit: string;
}

const styles = makeStyles((theme) => ({
  card: {
    width: "96%",
    marginLeft: "2%",
    marginRight: "2%",
  },
  titleContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
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
  menuText: {
    flexGrow: 1,
    marginLeft: "25px",
  },
  modButtonContainers: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modCancelButton: {
    marginRight: "1.5rem",
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
  modTasklist,
  deleteTasklist,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItems, setMenuItems] = useState<Array<JSX.Element>>([]);
  const [modifyMode, setModifyMode] = useState(false);
  const nameRef = useRef({ value: "" });
  const descriptionRef = useRef({ value: "" });
  const menuOpen = Boolean(anchorEl);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [waitForDelete, setWaitForDelete] = useState(false);
  const [completionPercent, setCompletionPercent] = useState("");
  const classes = styles();
  const isDesktop = useMediaQuery({ minWidth: 960 });
  const isMedium = useMediaQuery({ minWidth: 600 });
  const history = useHistory();

  useEffect(() => {
    if (/* waitForDelete && */ tasklist === null) history.push("/");
  }, [/* waitForDelete, */ tasklist, history]);

  useEffect(() => {
    if (tasklist !== null) {
      if (tasklist.tasks.length < 1) {
        setCompletionPercent("");
      } else {
        setCompletionPercent(
          (
            ((tasklist.stage3.length + tasklist.stage4.length) /
              tasklist.tasks.length) *
            100
          ).toFixed(0) + "% Complete"
        );
      }
    }
  }, [tasklist]);

  const runModify = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(null);
    // onUpdate(task);
    setModifyMode(true);
  };

  const deleteOpenButton = () => {
    setOpenDeleteDialog(true);
  };

  const menuOpenHandler = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };

  const menuOffClick = () => setAnchorEl(null);

  useEffect(() => {
    const createMenuItems = () => {
      const menuItemInfos: Array<MenuTuple> = [
        ["Modify", runModify, <Edit />],
        ["Delete", deleteOpenButton, <DeleteOutlineRounded />],
      ];
      const arr = new Array<JSX.Element>(menuItemInfos.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (
          <MenuItem color="inherit" onClick={menuItemInfos[i][1]} key={genid()}>
            {menuItemInfos[i][2]}
            <Typography className={classes.menuText}>
              {menuItemInfos[i][0]}
            </Typography>
          </MenuItem>
        );
      }
      setMenuItems(arr);
    };
    createMenuItems();
  }, [setMenuItems, classes.menuText]);

  if (tasklist === null)
    return (
      <div>
        <p />
        Tasklist not found! Did this tasklist get deleted?
      </div>
    );

  const cancelTasklistMod = () => {
    setModifyMode(false);
  };

  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    const newTasklist = { ...tasklist };
    newTasklist.name = nameRef.current.value;
    newTasklist.description = descriptionRef.current.value;
    setModifyMode(false);
    modTasklist(newTasklist);
  };

  const separatedTasks = separateTasksByType(tasklist);
  const taskCards = TaskViews(tasklist._id, separatedTasks);

  const attemptTasklistDelete = () => {
    setWaitForDelete(true);
    setOpenDeleteDialog(false);
    deleteTasklist(tasklist._id);
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
      <WaitingOverlay wait={waitForDelete} />
      <Card className={classes.card}>
        {modifyMode && (
          <div>
            <CardHeader
              title="Update Tasklist"
              titleTypographyProps={{ variant: "h3", gutterBottom: true }}
            />
            <CardContent>
              <form onSubmit={onSubmit} autoComplete="off">
                <TextField
                  required
                  autoFocus
                  fullWidth
                  label="Tasklist Name"
                  variant="outlined"
                  defaultValue={tasklist.name}
                  inputRef={nameRef}
                />
                <p />
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  defaultValue={tasklist.description}
                  inputRef={descriptionRef}
                />
                <p />
                <div className={classes.modButtonContainers}>
                  <Button
                    color="secondary"
                    className={classes.modCancelButton}
                    variant="outlined"
                    onClick={cancelTasklistMod}
                  >
                    Cancel
                  </Button>
                  <Button color="primary" variant="contained" type="submit">
                    Update
                  </Button>
                </div>
                <p />
              </form>
            </CardContent>
          </div>
        )}
        {!modifyMode && (
          <div>
            <CardHeader
              title={
                <div className={classes.titleContainer}>
                  <Typography gutterBottom variant="h3">
                    {tasklist.name}
                  </Typography>
                  <IconButton onClick={menuOpenHandler}>
                    <Edit />
                  </IconButton>
                </div>
              }
              subheader={
                <div>
                  Total tasks: {tasklist.tasks.length} <br />
                  {completionPercent}
                </div>
              }
            />
            <CardContent>
              <Typography>{tasklist.description}</Typography>
              <p />
            </CardContent>
          </div>
        )}
        <PopupMenu
          menuID={"task-menu-" + tasklist._id}
          children={menuItems}
          open={menuOpen}
          anchor={anchorEl}
          onClose={menuOffClick}
        />
        <CardContent>
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
      storeState: getStoreStatus(state),
    };
  return { tasklist: null };
};

const mapActionsToProps = {
  restageTasks: restageTask,
  modTasklist: modifyTasklist,
  deleteTasklist: deleteTasklistAttempt,
};

export default connect(mapStateToProps, mapActionsToProps)(Tasklist);
