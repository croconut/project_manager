import { Card, CardContent } from "@material-ui/core";
import React, { FC } from "react";
import { connect } from "react-redux";
import { RootState } from "src/redux/reducers";
import { getLoggedIn, getTasklists } from "src/redux/selectors";
import { TTasklists } from "src/staticData/types";

interface StoreProps {
  tasklists: TTasklists;
  loggedIn: boolean;
}

const displayTasklists = (tasklists: TTasklists):Array<JSX.Element> => {
  const tasklistArr = new Array<JSX.Element>(tasklists.length);
  for (let i = 0; i < tasklistArr.length; i++) {
    tasklistArr[i] = (
      <Card key={tasklists[i]._id}>
        <CardContent>
          {tasklists[i].name}
          <br />
          {tasklists[i].description}
        </CardContent>
      </Card>
    );
  }
  return tasklistArr;
}

const Homepage: FC<StoreProps> = ({tasklists, loggedIn}) => {
  const displayable = displayTasklists(tasklists);
  return <div>{loggedIn && displayable}</div>;
};

const mapStateToProps = (state: RootState) => {
  // BAD
  // const tasklists = state.tasklistHolder.tasklists;
  // GOOD cuz using a selector
  return { loggedIn: getLoggedIn(state), tasklists: getTasklists(state) };
};

export default connect(mapStateToProps)(Homepage);
