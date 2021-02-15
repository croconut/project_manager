import React, { FC } from "react";
import { makeStyles, Card, Grid, Typography } from "@material-ui/core";
import { ITask } from "src/staticData/types";
import { Draggable } from "react-beautiful-dnd";

interface TaskProps {
  task: ITask;
  index: number;
  columnId: number;
}

const taskStyles = makeStyles(theme => ({
  grow: {
    width: "100%",
    backgroundColor: "#666",
    marginTop: "5px",
    marginBottom: "5px",
  },
  growToDo: {
    width: "100%",
    backgroundColor: theme.palette.primary.dark,
    marginTop: "5px",
    marginBottom: "5px",
  },
  growOngoing: {
    width: "100%",
    backgroundColor: theme.palette.warning.dark,
    marginTop: "5px",
    marginBottom: "5px",
  },
  growComplete: {
    width: "100%",
    backgroundColor: theme.palette.success.dark,
    marginTop: "5px",
    marginBottom: "5px",
  },
  growCancelled: {
    width: "100%",
    backgroundColor: theme.palette.error.dark,
    marginTop: "5px",
    marginBottom: "5px",
  },
  dragging: {
    width: "100%",
    // of note, need to reduce margin by size of border
    // so margin was reduced by 2 all the way around
    margin: "3px -2px 3px -2px",
    backgroundColor: theme.palette.primary.main,
    border: `2px solid #ddd`,
  },
  taskButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    textTransform: "none",
  },
  text: {
    padding: "8px",
  },
}));

type styletype = ReturnType<typeof taskStyles>;

const getClass = (columnId: number, classes: styletype) => {
  switch(columnId) {
    case 0:
      return classes.growToDo;
    case 1:
      return classes.growOngoing;
    case 2:
      return classes.growComplete;
    case 3:
      return classes.growCancelled;
    default:
      return classes.grow;
  }
}

const Task: FC<TaskProps> = ({ task, index, columnId }) => {
  const classes = taskStyles();
  const normalClass = getClass(columnId, classes);
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <Card
          className={snapshot.isDragging ? classes.dragging : normalClass}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          innerRef={provided.innerRef}
        >
          <Grid item>
            <Typography className={classes.text}>{task.name}</Typography>
          </Grid>
        </Card>
      )}
    </Draggable>
  );
};

export default Task;
