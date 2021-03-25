import {
  DialogProps,
  TextField,
  Button,
  makeStyles,
  Card,
  CardContent,
  Grow,
} from "@material-ui/core";
import { Close, InputOutlined } from "@material-ui/icons";
import React, { FC, useRef } from "react";
import { connect } from "react-redux";
import { addTask } from "src/redux/actions";
import { ITask, TaskAction } from "src/staticData/types";
import { styles } from "../Login";
import { v4 as genid } from "uuid";

const createSpecificStyles = makeStyles((theme) => ({
  card: {
    width: "100%",
    background: theme.palette.primary.dark,
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
  onClose: () => void;
  tasklistID: string;
  open: boolean;
}

// totally forgot but since this is an individual task, there's no need to assign the task
// to a person just yet

const CreateTask: FC<CreateTaskProps> = ({
  addATask,
  tasklistID,
  onComplete,
  onClose,
  open
}) => {
  const classes = styles();
  const preciseClasses = createSpecificStyles();
  // dont need rerenders, should use useRef
  const nameRef = useRef({ value: "" });
  const descriptionRef = useRef({ value: "" });

  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    const task: ITask = {
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      assignedUserIcon: "",
      assignedUsername: "",
      _id: genid(),
    };
    addATask(tasklistID, task);
    onComplete();
  };

  const cancel = () => {
    if (onClose !== undefined) onClose();
  };

  return (
    <Grow in={open} unmountOnExit={true}>
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
              color="default"
              value="Create Task"
              type="submit"
              endIcon={<InputOutlined />}
            >
              Add Task
            </Button>
          </CardContent>
        </form>
      </Card>
    </Grow>
  );
};

const mapActionsToProps = {
  addATask: addTask,
};

export default connect(null, mapActionsToProps)(CreateTask);
