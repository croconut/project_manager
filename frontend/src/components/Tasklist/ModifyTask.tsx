import {
  CardContent,
  Card,
  Button,
  CardProps,
  TextField,
} from "@material-ui/core";
import React, { useRef } from "react";
import { ITask } from "src/staticData/types";

interface ModifyProps {
  task: ITask;
  onComplete: (task: ITask) => void;
}

const ModifyTask: React.FC<ModifyProps & CardProps> = ({
  task,
  onComplete,
  ...props
}) => {
  const nameRef = useRef({ value: "" });
  const descriptionRef = useRef({ value: "" });

  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    const newTask = { ...task };
    newTask.name = nameRef.current.value;
    newTask.description = descriptionRef.current.value;
    onComplete(newTask);
  };

  return (
    <Card className={props.className}>
      <CardContent>
        <form onSubmit={onSubmit} autoComplete="off">
          <TextField
            required
            autoFocus
            fullWidth
            label="Name"
            variant="outlined"
            defaultValue={task.name}
            inputRef={nameRef}
          />
          <p />
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            defaultValue={task.description}
            inputRef={descriptionRef}
          />
          <p />
          <Button variant="outlined" fullWidth type="submit">
            Done
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ModifyTask;
