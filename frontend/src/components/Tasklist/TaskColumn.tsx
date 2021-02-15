import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { Droppable, DroppableProvided } from "react-beautiful-dnd";
import React, { FC } from "react";
import Task from "./Task";
import { ITask, TTasks } from "src/staticData/types";
import { useMediaQuery } from "react-responsive";
import { Add } from "@material-ui/icons";
import { hexToRGB } from "src/staticData/Constants";

const styles = makeStyles((theme) => {
  const rgbSuccessLight = hexToRGB(theme.palette.success.main);
  return {
    taskCard: {
      width: "300px",
    },
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
      backgroundColor: theme.palette.warning.dark,
    },
    taskCardContentOngoing: {
      paddingLeft: "0px",
      paddingRight: "0px",
      backgroundColor: theme.palette.warning.light,
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
    notMobile: {
      width: "33%",
    },
    normalGrid: {
      flexDirection: "column",
      paddingLeft: "8px",
      paddingRight: "8px",
    },
    addButton: {
      color: "white",
      background: rgbSuccessLight !== null
      ? `rgba(${rgbSuccessLight[0]},${rgbSuccessLight[1]},${rgbSuccessLight[2]}, 0.85)`
      : "inherit",
      fontSize: "42px",
      marginBottom: "-10px",
      marginRight: "2px",
      padding: "0px 0px 0px 0px",
      "&:hover": {
        background: theme.palette.success.main,
      },
    },
  };
});

interface TaskColumnProps {
  tasklistID: string;
  title: string;
  id: string;
  tasks: TTasks;
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

const TaskColumn: FC<TaskColumnProps> = ({ tasklistID, title, id, tasks }) => {
  const classes = styles();
  const isDesktop = useMediaQuery({ minWidth: 992 });
  const columnId = parseInt(id);
  const headerClass = getHeaderClass(columnId, classes);
  const contentClass = getContentClass(columnId, classes);
  const taskAdder = () => {
    // open up a create task component and pass it the addATask function
    // and the tasklistID and it'll create a task
  };
  return (
    <Grid
      item
      key={"column-" + id}
      className={isDesktop ? classes.notMobile : classes.taskCard}
    >
      <Droppable droppableId={id}>
        {(provided: DroppableProvided, _snapshot) => (
          <Card elevation={3}>
            <CardHeader
              className={headerClass}
              title={title}
              action={
                columnId === 0 && (
                  <IconButton
                    edge="end"
                    size="small"
                    color="primary"
                    className={classes.addButton}
                    onClick={taskAdder}
                  >
                    <Add fontSize="inherit" />
                  </IconButton>
                )
              }
            />
            <CardContent className={contentClass}>
              <Grid
                container
                justify="flex-start"
                alignItems="flex-start"
                className={classes.normalGrid}
                innerRef={provided.innerRef}
                {...provided.droppableProps}
              >
                {tasks.map((task: ITask, index: number) => (
                  <Task
                    key={task._id}
                    task={task}
                    index={index}
                    columnId={columnId}
                  />
                ))}
                {provided.placeholder}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Droppable>
    </Grid>
  );
};

export default TaskColumn;
