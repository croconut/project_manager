import { makeStyles } from "@material-ui/core";
import React, { FC } from "react";
import GridPlus from "./helpers/GridPlus";

const styles = makeStyles((theme) => ({
  gridPlus: {
    width: "100%",
  },
  gridContainer: {
    width: "20%",
  }
}));

const Organization: FC<any> = () => {
  const data = [(<div>"hey"</div>), (<div>this</div>), (<div>is</div>), (<div>"hey"</div>)];
  const classes = styles();
  return (
    <GridPlus
      className={classes.gridPlus}
      justify="flex-end"
      orderBy="column"
      fillCount={3}
      childClassName={classes.gridContainer}
      childProps={{}}
    >
      {data}
    </GridPlus>
  );
};

export default Organization;
