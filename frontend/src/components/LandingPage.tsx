import React, { FC } from "react";
import { Card, Typography, Button, makeStyles } from "@material-ui/core";
import { DoubleArrow, Build, DoneAll, LinearScale } from "@material-ui/icons";
import { useMediaQuery } from "react-responsive";
import { useHistory } from "react-router";
import { loggedOutRoutes } from "src/staticData/Routes";
interface LandingPageProps {
  nothing?: boolean;
}

const styles = makeStyles((theme) => ({
  heading: {
    paddingTop: "2.5rem",
    marginLeft: "2vw",
    marginRight: "2vw",
  },
  spacer: {
    height: "2rem",
  },
  title: {
    marginTop: "5rem",
    paddingTop: "1rem",
    width: "96%",
    marginLeft: "2%",
    marginRight: "2%",
    marginBottom: "5%",
    textAlign: "center",
  },
  root: {
    // backgroundColor: theme.palette.background.paper,
  },
  callToActionContainer: {
    display: "flex",
    marginTop: "3rem",
    justifyContent: "space-between",
    alignItems: "center",
  },
  joinButton: {
    marginLeft: "2rem",
  },
  circles: {
    paddingBottom: "30px",
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
  },
  circleHolder: {
    display: "flex",
    flexDirection: "column",
  },
  circle: {
    minWidth: "22vw",
    maxWidth: "22vw",
    borderColor: "white",
    borderStyle: "dashed",
    borderRadius: "3%",
    flex: "1",
    display: "flex",
    alignItems: "center",
  },
  arrow1: {
    minWidth: "7vw",
    maxWidth: "10vw",
    minHeight: "12vw",
    marginLeft: "1vw",
    marginRight: "1vw",
    alignSelf: "center",
    color: theme.palette.success.light,
  },
  status: {
    width: "100%",
    marginTop: "2%",
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
    minHeight: "12vw",
    marginLeft: "1vw",
    marginRight: "1vw",
    alignSelf: "center",
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
  const history = useHistory();
  const joinClick = () => {
    history.push(loggedOutRoutes[0].route);
  };
  return (
    <div className={classes.root}>
      <div className={classes.heading}>
        <Typography align="center" variant="h3">
          Project Management Has <i>Never</i> Been Easier
        </Typography>
        <p />
        <div className={classes.spacer} />
        <Typography align="center" variant="h5">
          latest feature: personal tasklists
        </Typography>
        <p />
        <div className={classes.callToActionContainer}>
          <Typography variant="h4">
            Tasklist features include intuitive drag-and-drop controls and
            automatic backups!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={joinClick}
            className={classes.joinButton}
          >
            <Typography variant="h4">
              <b>join</b>
            </Typography>
          </Button>
        </div>
      </div>
      <Card className={classes.title}>
          <Typography variant="h4">
            <b>Milestones</b>
          </Typography>
        <p />
        <div className={classes.circles}>
          <div className={classes.circleHolder}>
            <div className={classes.circle}>
              <Typography
                variant={notMobile ? "h5" : "body1"}
                className={classes.text}
              >
                Personal tasklists
              </Typography>
            </div>
            <div className={classes.status}>
              <Typography variant={notMobile ? "h5" : "body1"}>
                Status:&nbsp;
              </Typography>
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
              <Typography variant={notMobile ? "h5" : "body1"}>
                Status:&nbsp;
              </Typography>
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
              <Typography variant={notMobile ? "h5" : "body1"}>
                Status:&nbsp;
              </Typography>
              <Build className={classes.building} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LandingPage;
