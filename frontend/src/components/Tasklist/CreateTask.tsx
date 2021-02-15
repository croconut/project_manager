import { Modal } from "@material-ui/core";
import React, { FC } from "react";
import { connect } from "react-redux";
import { addTask } from "src/redux/actions";
import { ITask, TaskAction } from "src/staticData/types";

interface CreateTaskProps {
  addATask: (tasklistID: string, task: ITask) => TaskAction;
  tasklistID: string;
}

const CreateTask: FC<CreateTaskProps> = ({ addATask, tasklistID }) => {
  return (
    // <Modal>
    //   blah blah blah
    // </Modal>
    <div>make a task yo</div>
  );
};

const mapActionsToProps = {
  addATask: addTask,
};

export default connect(null, mapActionsToProps)(CreateTask);
