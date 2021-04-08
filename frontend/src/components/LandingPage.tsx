import React, { FC } from "react";
import { Typography, Button, makeStyles } from "@material-ui/core";
import { DoubleArrow, Build, DoneAll, LinearScale } from "@material-ui/icons";
import { useMediaQuery } from "react-responsive";
interface LandingPageProps {
  nothing?: boolean;
}

const styles = makeStyles((theme) => ({
  title: {
    paddingTop: "0.5rem",
    marginLeft: "15vw",
  },
  roadmap: {
    backgroundColor: theme.palette.background.paper,
  },
  circles: {
    paddingBottom: "30px",
    paddingLeft: "3%",
    display: "flex",
  },
  circleHolder: {
    display: "flex",
    flexDirection: "column",
  },
  circle: {
    minWidth: "25vw",
    maxWidth: "25vw",
    minHeight: "25vw",
    maxHeight: "25vw",
    backgroundColor: theme.palette.primary.dark,
    borderRadius: "50%",
    flex: "1",
    display: "flex",
    alignItems: "center",
  },
  arrow1: {
    minWidth: "7vw",
    maxWidth: "10vw",
    minHeight: "25vw",
    maxHeight: "25vw",
    marginLeft: "1vw",
    marginRight: "1vw",
    color: theme.palette.success.light,
  },
  status: {
    width: "100%",
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    color: theme.palette.success.light,
    width: "4vw",
    height: "4vw",
  },
  building: {
    color: theme.palette.secondary.light,
    width: "4vw",
    height: "4vw",
  },
  arrow2: {
    minWidth: "7vw",
    maxWidth: "10vw",
    minHeight: "25vw",
    maxHeight: "25vw",
    marginLeft: "1vw",
    marginRight: "1vw",
    color: theme.palette.secondary.light,
  },
  text: {
    width: "70%",
    margin: "15%",
    textAlign: "center",
    borderRadius: "50%",
  },
}));

const LandingPage: FC<LandingPageProps> = () => {
  const classes = styles();
  const notMobile = useMediaQuery({ minWidth: 600 });
  return (
    <div className={classes.roadmap}>
      <div className={classes.title}>
        <Typography variant="h3">
          <b>ROADMAP</b>
        </Typography>
      </div>
      <p />
      <div className={classes.circles}>
        <div className={classes.circleHolder}>
          <div className={classes.circle}>
            <Typography
              variant={notMobile ? "h5" : "body1"}
              className={classes.text}
            >
              Personal task boards
            </Typography>
          </div>
          <div className={classes.status}>
            <Typography variant={notMobile ? "h5" : "body1"}>Status:&nbsp;</Typography>
            <DoneAll className={classes.check} />
          </div>
        </div>
        <DoubleArrow className={classes.arrow1} />
        <div className={classes.circleHolder}>
          <div className={classes.circle}>
            <Typography
              variant={notMobile ? "h5" : "body1"}
              className={classes.text}
            >
              Task boards for teams
            </Typography>
          </div>
          <div className={classes.status}>
            <Typography variant={notMobile ? "h5" : "body1"}>Status:&nbsp;</Typography>
            <Build className={classes.building} />
          </div>
        </div>
        <LinearScale className={classes.arrow2} />
        <div className={classes.circleHolder}>
          <div className={classes.circle}>
            <Typography
              variant={notMobile ? "h5" : "body1"}
              className={classes.text}
            >
              Personal and team schedules
            </Typography>
          </div>
          <div className={classes.status}>
            <Typography variant={notMobile ? "h5" : "body1"}>Status:&nbsp;</Typography>
            <Build className={classes.building} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
