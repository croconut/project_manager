import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { Droppable, DroppableProvided } from "react-beautiful-dnd";
import React, { FC, useState } from "react";
import Task from "./Task";
import { ITask, TaskAction, TTasks } from "src/staticData/types";
import { Add } from "@material-ui/icons";
import CreateTask from "./CreateTask";
import { removeTask, modifyTask } from "src/redux/actions";
import { connect } from "react-redux";

const styles = makeStyles((theme) => {
  return {
    header: {
      backgroundColor: "#222",
    },
    headerComplete: {
      backgroundColor: theme.palette.success.dark,
    },
    headerCancelled: {
      backgroundColor: theme.palette.error.dark,
    },
    headerToDo: {
      display: "flex",
      flexDirection: "row",
      alignContent: "stretch",
      backgroundColor: theme.palette.primary.dark,
    },
    headerOngoing: {
      background: `linear-gradient( to right, ${theme.palette.primary.dark}, ${theme.palette.success.dark})`,
    },
    taskCardContentOngoing: {
      paddingLeft: "0px",
      paddingRight: "0px",
      background: `linear-gradient( to right, ${theme.palette.primary.light}, ${theme.palette.success.light})`,
    },
    taskCardContentToDo: {
      paddingLeft: "0px",
      paddingRight: "0px",
      backgroundColor: theme.palette.primary.light,
    },
    taskCardContentComplete: {
      paddingLeft: "0px",
      paddingRight: "0px",
      backgroundColor: theme.palette.success.light,
    },
    taskCardContentCancelled: {
      paddingLeft: "0px",
      paddingRight: "0px",
      backgroundColor: theme.palette.error.light,
    },
    taskCardContent: {
      paddingLeft: "0px",
      paddingRight: "0px",
    },
    small: {
      width: "100%",
    },
    normalGrid: {
      flexDirection: "column",
      paddingLeft: "8px",
      paddingRight: "8px",
    },
    addButton: {
      color: "white",
      background: theme.palette.primary.main,
      fontSize: "42px",
      marginBottom: "-10px",
      marginRight: "2px",
      padding: "0px 0px 0px 0px",
      "&:hover": {
        background: theme.palette.primary.light,
        color: "white",
      },
    },
  };
});

interface TaskColumnProps {
  tasklistID: string;
  title: string;
  id: string;
  tasks: TTasks;
  removeATask: (tasklistID: string, task: ITask) => TaskAction;
  modifyATask: (tasklistID: string, task: ITask) => TaskAction;
}

type styletype = ReturnType<typeof styles>;

const getHeaderClass = (columnId: number, classes: styletype) => {
  switch (columnId) {
    case 0:
      return classes.headerToDo;
    case 1:
      return classes.headerOngoing;
    case 2:
      return classes.headerComplete;
    case 3:
      return classes.headerCancelled;
    default:
      return classes.header;
  }
};

const getContentClass = (columnId: number, classes: styletype) => {
  switch (columnId) {
    case 0:
      return classes.taskCardContentToDo;
    case 1:
      return classes.taskCardContentOngoing;
    case 2:
      return classes.taskCardContentComplete;
    case 3:
      return classes.taskCardContentCancelled;
    default:
      return classes.taskCardContent;
  }
};

const TaskColumn: FC<TaskColumnProps> = ({
  tasklistID,
  title,
  id,
  tasks,
  removeATask,
  modifyATask
}) => {
  const [openAdd, setOpenAdd] = useState(false);
  const classes = styles();
  const columnId = parseInt(id);
  const headerClass = getHeaderClass(columnId, classes);
  const contentClass = getContentClass(columnId, classes);
  const taskAdder = () => {
    // open up a create task component and pass it the addATask function
    // and the tasklistID and it'll create a task
    setOpenAdd(true);
  };

  const taskDeleter = (task: ITask) => {
    removeATask(tasklistID, task);
  };
  
  const taskModifier = (task: ITask) => {
    //TODO create a modify task dialog
    //should be visually consistent with the create task dialog
    //pass it the task and tasklistID information
    //have it run the actual store modification
    //we LIKELY want to have this be a function it pushes back up to tasklist
    modifyATask(tasklistID, task);
  };

  const closeDialog = () => {
    setOpenAdd(false);
  };

  return (
    <Grid item key={"column-" + id} className={classes.small}>
      <Card elevation={3}>
        <CardHeader
          className={headerClass}
          title={title}
          action={
            columnId === 0 && (
              <IconButton
                edge="end"
                size="small"
                className={classes.addButton}
                onClick={taskAdder}
              >
                <Add fontSize="inherit" />
              </IconButton>
            )
          }
        />
        <Droppable droppableId={id}>
          {(provided: DroppableProvided, _snapshot) => (
            <CardContent className={contentClass}>
              <Grid
                container
                justify="flex-start"
                alignItems="flex-start"
                alignContent="flex-start"
                className={classes.normalGrid}
                innerRef={provided.innerRef}
                {...provided.droppableProps}
              >
                <CreateTask
                  open={openAdd}
                  onClose={closeDialog}
                  onComplete={closeDialog}
                  tasklistID={tasklistID}
                />

                {tasks.map((task: ITask, index: number) => (
                  <Task
                    key={task._id}
                    task={task}
                    index={index}
                    columnId={columnId}
                    onDelete={taskDeleter}
                    onUpdate={taskModifier}
                  />
                ))}
                {provided.placeholder}
              </Grid>
            </CardContent>
          )}
        </Droppable>
      </Card>
    </Grid>
  );
};

const mapActionsToProps = {
  removeATask: removeTask,
  modifyATask: modifyTask,
};

export default connect(null, mapActionsToProps)(TaskColumn);
