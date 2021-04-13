import { Card, CardContent, CardHeader, Grid, IconButton, Toolbar, Typography } from "@material-ui/core";
import { OpenInNew } from "@material-ui/icons";
import React, { FC, useEffect, useState } from "react";
import { ITasklist } from "src/staticData/types";
import Expand from "../animations/Expand";
import { HomepageStyles } from "../Homepage";


interface TasklistStubProps {
    classes: HomepageStyles;
    tasklist: ITasklist;
    callback: Function;
  }
  
  const TasklistStub: FC<TasklistStubProps> = ({
    classes,
    tasklist,
    callback,
  }) => {
    const [hover, setHover] = useState(false);
    const [date, setDate] = useState("");
    const [taskStages, setTaskStages] = useState<Array<number>>([]);
    useEffect(() => {
      setDate(new Date(tasklist.createdAt).toLocaleDateString());
      setTaskStages([
        tasklist.stage1.length,
        tasklist.stage2.length,
        tasklist.stage3.length,
        tasklist.stage4.length,
      ]);
    }, [
      tasklist.createdAt,
      tasklist.stage1.length,
      tasklist.stage2.length,
      tasklist.stage3.length,
      tasklist.stage4.length,
    ]);
    return (
      <Expand in={hover} timeout={150} start={0.9} end={1.05}>
        <Grid item className={classes.card}>
          <Card
            variant="outlined"
            onMouseOver={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <CardHeader
              title={tasklist.name}
              subheader={`created: ${date}`}
            ></CardHeader>
            <CardContent>
              <Typography noWrap color="textSecondary" variant="subtitle1">
                {tasklist.description}
              </Typography>
              <br />
              <Typography variant="h6">Tasks</Typography>
              <Toolbar disableGutters className={classes.toolbar}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className={classes.toolbar}
                >
                  Active: {taskStages[0] + taskStages[1]}
                  <br />
                  Completed: {taskStages[2]}
                </Typography>
                <IconButton
                  color="primary"
                  onClick={() => callback(tasklist._id, false)}
                >
                  <OpenInNew fontSize="large" />
                </IconButton>
              </Toolbar>
            </CardContent>
          </Card>
        </Grid>
      </Expand>
    );
  };

  export default TasklistStub;