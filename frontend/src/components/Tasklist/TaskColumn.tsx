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
import { Droppable, DroppableProvided } from "react-beautiful-dnd";
import React, { FC, useEffect, useState } from "react";
import Task from "./Task";
import { ITask, TTasks } from "src/staticData/types";

const styles = makeStyles({
  taskCard: {
    width: "300px",
  },
  innerTaskCard: {
    backgroundColor: "#222",
  },
  taskCardContent: {
    paddingLeft: "8px",
    paddingRight: "8px",
  },
});

interface TaskColumnProps {
  title: string;
  id: string;
  tasks: TTasks;
}

const TaskColumn: FC<TaskColumnProps> = ({ title, id, tasks }) => {
  const classes = styles();

  return (
    <Grid item key={"column-" + id} className={classes.taskCard}>
      <Card elevation={3}>
        <CardHeader
          className={classes.innerTaskCard}
          title={/*TaskStage[i] || "Other Tasks"*/ title}
        />
        <CardContent className={classes.taskCardContent}>
          <Droppable droppableId={id}>
            {(provided: DroppableProvided) => (
              <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="flex-start"
                innerRef={provided.innerRef}
                {...provided.droppableProps}
              >
                {tasks.map((task: ITask, index: number) => (
                  <Task key={task._id} task={task} index={index} />
                ))}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default TaskColumn;
