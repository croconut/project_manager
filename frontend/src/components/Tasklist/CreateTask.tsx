import {
  DialogProps,
  Dialog,
  DialogTitle,
  TextField,
  Button,
  makeStyles,
  Card,
  CardContent,
} from "@material-ui/core";
import { Close, InputOutlined } from "@material-ui/icons";
import React, { FC, useRef } from "react";
import { connect } from "react-redux";
import { addTask } from "src/redux/actions";
import { ITask, TaskAction } from "src/staticData/types";
import { styles } from "../Login";
import { v4 as genid } from "uuid";
import { TaskStage } from "src/staticData/Constants";

const createSpecificStyles = makeStyles((theme) => ({
  card: {
    width: "400px",
  },
  cardActions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  leftButton: {
    marginRight: "20px",
  },
}));

interface CreateTaskProps {
  addATask: (tasklistID: string, task: ITask) => TaskAction;
  onComplete: () => void;
  tasklistID: string;
}

// totally forgot but since this is an individual task, there's no need to assign the task
// to a person just yet

const CreateTask: FC<CreateTaskProps & DialogProps> = ({
  addATask,
  tasklistID,
  onComplete,
  onClose,
  className,
  ...otherDialogProps
}) => {
  const classes = styles();
  const preciseClasses = createSpecificStyles();
  // dont need rerenders, should use useRef
  const nameRef = useRef({ value: "" });
  const descriptionRef = useRef({ value: ""});
  
  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    const task: ITask = {
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      assignedUserIcon: "",
      assignedUsername: "",
      _id: genid(),
      // will be set to a real default by the addATask fn
      priority: 0,
      stage: TaskStage[0],
    };
    addATask(tasklistID, task);
    onComplete();
  };

  const cancel = () => {
    if (onClose !== undefined) onClose({}, "backdropClick");
  };

  return (
    <Dialog
      {...otherDialogProps}
      onClose={onClose}
      aria-labelledby="add-task-title"
      className={classes.root}
    >
      <DialogTitle id="add-task-title">Add a new task!</DialogTitle>
      <Card className={preciseClasses.card} elevation={0}>
        <form
          onSubmit={onSubmit}
          autoComplete="off"
          className={classes.cardContent}
        >
          <CardContent className={classes.cardContent}>
            <TextField
              className={classes.inputs}
              required
              autoFocus
              id="name"
              label="Task Name"
              variant="outlined"
              inputRef={nameRef}
            />
            <p />
            <TextField
              className={classes.inputs}
              id="description"
              type="text"
              label="Description"
              variant="outlined"
              inputRef={descriptionRef}
            />
            <p />
          </CardContent>
          <CardContent className={preciseClasses.cardActions}>
            <Button
              className={preciseClasses.leftButton}
              variant="outlined"
              color="secondary"
              value="Cancel"
              endIcon={<Close />}
              onClick={cancel}
            >
              cancel
            </Button>
            <Button
              variant="outlined"
              color="primary"
              value="Create Task"
              type="submit"
              endIcon={<InputOutlined />}
            >
              Add Task
            </Button>
          </CardContent>
        </form>
      </Card>
    </Dialog>
  );
};

const mapActionsToProps = {
  addATask: addTask,
};

export default connect(null, mapActionsToProps)(CreateTask);
