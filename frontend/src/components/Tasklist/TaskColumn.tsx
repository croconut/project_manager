import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Grow,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { Droppable, DroppableProvided } from "react-beautiful-dnd";
import React, { FC, useState } from "react";
import Task from "./Task";
import { ITask, TTasks } from "src/staticData/types";
import { useMediaQuery } from "react-responsive";
import { Add } from "@material-ui/icons";
import CreateTask from "./CreateTask";
import { TransitionProps } from "@material-ui/core/transitions";

const styles = makeStyles((theme) => {
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

// should i credit docs? ...
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Grow ref={ref} {...props} />;
});

const TaskColumn: FC<TaskColumnProps> = ({ tasklistID, title, id, tasks }) => {
  const [openAdd, setOpenAdd] = useState(false);
  const classes = styles();
  const isDesktop = useMediaQuery({ minWidth: 992 });
  const columnId = parseInt(id);
  const headerClass = getHeaderClass(columnId, classes);
  const contentClass = getContentClass(columnId, classes);
  const taskAdder = () => {
    // open up a create task component and pass it the addATask function
    // and the tasklistID and it'll create a task
    setOpenAdd(true);
  };
  const closeDialog = () => {
    setOpenAdd(false);
  };
  return (
    <Grid
      item
      key={"column-" + id}
      className={isDesktop ? classes.notMobile : classes.taskCard}
    >
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
          )}
        </Droppable>
      </Card>
      <CreateTask
        open={openAdd}
        TransitionComponent={Transition}
        onClose={closeDialog}
        onComplete={closeDialog}
        tasklistID={tasklistID}
      />
    </Grid>
  );
};

export default TaskColumn;
