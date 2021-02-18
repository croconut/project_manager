import { makeStyles } from "@material-ui/core";
import React, { FC } from "react";

const styles = makeStyles((theme) => ({
  gridPlus: {
    width: "100%",
  },
  gridContainer: {
    width: "20%",
  },
}));

const Organization: FC<any> = () => {
  const classes = styles();
  return <div className={classes.gridPlus}>muh organization info</div>;
};

export default Organization;
