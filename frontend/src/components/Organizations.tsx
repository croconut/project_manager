import { makeStyles } from "@material-ui/core";
import React, { FC } from "react";
import GridPlus from "./helpers/GridPlus";

const styles = makeStyles((theme) => ({
  gridPlus: {
    width: "100%",
    height: "25%",
  },
  gridContainer: {
    width: "20%",
  }
}));

const Organizations: FC<any> = () => {
  const data = [
    <div key={1}>"hey"</div>,
    <div key={1253}>this</div>,
    <div key={122}>is</div>,
    <div key={14}>lame</div>,
  ];
  const classes = styles();
  return (
    <GridPlus
      className={classes.gridPlus}
      justify="flex-start"
      // tells it to fill one in each child col / row
      // OR tells it to fill col up to fill count then
      // go to next one
      crossFill
      orderBy="column"
      direction="row"
      fillCount={3}
      childProps={{ className: classes.gridContainer }}
      childClassName={classes.gridContainer}
      children={data}
    />
  );
};

export default Organizations;
