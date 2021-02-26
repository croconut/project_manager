import {
  Button,
  Card,
  CardContent,
  CardHeader,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { Close, InputOutlined } from "@material-ui/icons";
import React, { FC, useRef } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState } from "src/redux/reducers";
import { getStoreStatus } from "src/redux/selectors";
import {
  ITasklistCreate,
  UpdateFailedAction,
  // create this action
  TasklistCreatedAction,
} from "src/staticData/types";
// create this thunk action
import { addTasklistAttempt } from "src/redux/actions";
import { styles as loginStyles } from "../Login";

interface StoreProps {
  createATasklist: (
    tasklist: ITasklistCreate
  ) => Promise<TasklistCreatedAction | UpdateFailedAction>;
}

const styles = makeStyles((theme) => ({
  card: {
    width: "90%",
    minHeight: "400px",
    height: "80vh",
    marginLeft: "5%",
    marginRight: "5%",
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

const CreateTasklist: FC<StoreProps> = ({ createATasklist }) => {
  const nameRef = useRef({ value: "" });
  const history = useHistory();
  const descriptionRef = useRef({ value: "" });
  const classes = styles();
  const borrowedStyles = loginStyles();
  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    const tasklist: ITasklistCreate = {
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      stages: { stage1: [], stage2: [], stage3: [], stage4: [] },
      tasks: [],
    };
    createATasklist(tasklist);
  };

  const cancel = () => {
    history.goBack();
  };

  return (
    <Card className={classes.card}>
      <CardHeader title="Create a tasklist!" />
      <form
        onSubmit={onSubmit}
        autoComplete="off"
        className={borrowedStyles.cardContent}
      >
        <CardContent className={borrowedStyles.cardContent}>
          <TextField
            className={borrowedStyles.inputs}
            required
            autoFocus
            id="name"
            label="Name"
            variant="outlined"
            inputRef={nameRef}
          />
          <p />
          <TextField
            className={borrowedStyles.inputs}
            id="description"
            label="Description"
            variant="outlined"
            inputRef={descriptionRef}
          />
        </CardContent>
        <CardContent className={classes.cardActions}>
          <Button
            className={classes.leftButton}
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
            Create Tasklist
          </Button>
        </CardContent>
      </form>
    </Card>
  );
};

const mapStateToProps = (state: RootState) => {
  return { storeState: getStoreStatus(state) };
};

const mapActionsToProps = {
  createATasklist: addTasklistAttempt,
};

export default connect(mapStateToProps, mapActionsToProps)(CreateTasklist);
