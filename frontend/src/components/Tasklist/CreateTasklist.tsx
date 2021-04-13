import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Grow,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { Close, InputOutlined } from "@material-ui/icons";
import React, { FC, useEffect, useRef, useState } from "react";
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
import { TStatus } from "src/staticData/Constants";
import { Alert } from "@material-ui/lab";
import WaitingOverlay from "../helpers/WaitingOverlay";

interface StoreProps {
  storeState: TStatus;
  createATasklist: (
    tasklist: ITasklistCreate
  ) => Promise<TasklistCreatedAction | UpdateFailedAction>;
  onCancel: () => void;
  onExit: () => void;
  onComplete: () => void;
  open: boolean;
}

const styles = makeStyles((theme) => ({
  card: {
    width: "90%",
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
  submitButton: {
    backgroundColor: theme.palette.success.dark,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.success.main,
    },
  },
}));

const CreateTasklist: FC<StoreProps> = ({
  storeState,
  createATasklist,
  onCancel,
  onComplete,
  open,
  onExit,
}) => {
  const nameRef = useRef({ value: "" });
  const [sentRequest, setSentRequest] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertActive, setAlertActive] = useState(false);
  const history = useHistory();
  const descriptionRef = useRef({ value: "" });
  const classes = styles();
  const borrowedStyles = loginStyles();

  const alertLoginFail = () => {
    return (
      <Collapse in={alertActive} className={borrowedStyles.alert}>
        <Alert variant="filled" severity="error">
          {alertMessage}
        </Alert>
      </Collapse>
    );
  };

  const alert = alertLoginFail();

  useEffect(() => {
    if (alertActive) {
      let errmsg = alertMessage;
      let timer = setTimeout(() => {
        if (errmsg === alertMessage) setAlertActive(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [alertActive, alertMessage]);

  useEffect(() => {
    if (sentRequest && storeState === "SYNCED") {
      setSentRequest(false);
      onComplete();
    }
    if (sentRequest && storeState === "UPDATE_NEEDED") {
      setSentRequest(false);
      setAlertMessage("tasklist create failed, server may be busy or down");
      setAlertActive(true);
    }
  }, [sentRequest, storeState, history, onComplete]);

  const onSubmit = (submission: React.FormEvent) => {
    submission.preventDefault();
    if (sentRequest || storeState === "UPDATING") return;
    const tasklist: ITasklistCreate = {
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      stages: { stage1: [], stage2: [], stage3: [], stage4: [] },
      tasks: [],
    };
    setSentRequest(true);
    createATasklist(tasklist);
  };

  const cancel = () => {
    onCancel();
  };

  return (
    <Grow in={open} unmountOnExit={true} onExited={onExit}>
      <div className={borrowedStyles.root}>
        <WaitingOverlay wait={sentRequest} />
        {alert}
        <Card className={classes.card}>
          <CardHeader title="new tasklist" />
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
                <Typography>
                  <b>cancel</b>
                </Typography>
              </Button>
              <Button
                variant="contained"
                className={classes.submitButton}
                value="Create Task"
                type="submit"
                endIcon={<InputOutlined />}
              >
                <Typography>Create Tasklist</Typography>
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </Grow>
  );
};

const mapStateToProps = (state: RootState) => {
  return { storeState: getStoreStatus(state) };
};

const mapActionsToProps = {
  createATasklist: addTasklistAttempt,
};

export default connect(mapStateToProps, mapActionsToProps)(CreateTasklist);
