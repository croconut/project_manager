import React, { FC } from "react";
import { makeStyles, Card, Grid, Typography } from "@material-ui/core";
import { ITask } from "src/staticData/types";
import { Draggable } from "react-beautiful-dnd";

interface TaskProps {
  task: ITask;
  index: number;
}

const taskStyles = makeStyles({
  grow: {
    width: "100%",
    backgroundColor: "#666",
    marginTop: "5px",
    marginBottom: "5px",
  },
  taskButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    textTransform: "none",
  },
  text: {
    paddingRight: "8px",
    paddingLeft: "8px",
  },
});

const Task: FC<TaskProps> = ({ task, index }) => {
  const classes = taskStyles();
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <Card
          className={classes.grow}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          innerRef={provided.innerRef}
        >
          <Grid item>
            <Typography className={classes.text}>
              {task.name}
            </Typography>
          </Grid>
        </Card>
      )}
    </Draggable>
  );
};

export default Task;
