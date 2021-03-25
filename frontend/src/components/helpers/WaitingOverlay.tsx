import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import React from "react";

interface WaitingProps {
  wait: boolean;
}

const styles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const WaitingOverlay: React.FC<WaitingProps> = ({ wait }) => {
  const classes = styles();
  return (
    <Backdrop className={classes.backdrop} open={wait}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default WaitingOverlay;
