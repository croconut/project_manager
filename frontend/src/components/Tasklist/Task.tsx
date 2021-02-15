import React, { FC, useState } from "react";
import { makeStyles, Card, Grid, Button, Typography } from "@material-ui/core";
import Expand from "src/components/animations/Expand";
import { ITask } from "src/staticData/types";
import CSS from "csstype";
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
            <Typography className={classes.text} noWrap>
              {task.name}
            </Typography>
            {/* {i < TaskStage.length - 2 && (
                <div className={classes.buttonRow}>
                  <Button fullWidth className={classes.moveTaskButton} color="primary" >
                    <Typography color="textPrimary" >Move task to {TaskStage[i + 1]}</Typography>  
                    <ArrowRightAltOutlined />
                  </Button>
                </div>
              )} */}
          </Grid>
        </Card>
      )}
    </Draggable>
  );
};

export default Task;
