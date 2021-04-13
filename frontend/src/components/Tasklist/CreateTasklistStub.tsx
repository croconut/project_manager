import React, { FC, useState } from "react";
import { Button, Card, CardContent, Grid, Grow, Typography } from "@material-ui/core";
import { AddCircle } from "@material-ui/icons";
import { v4 as genid } from "uuid";

import Expand from "../animations/Expand";
import { HomepageStyles } from "../Homepage";

interface CreateProps {
  classes: HomepageStyles;
  callback: Function;
  open: boolean;
  onExit: () => void;
}

const CreateTasklistStub: FC<CreateProps> = ({
  classes,
  callback,
  open,
  onExit,
}) => {
  const [hover, setHover] = useState(false);
  const exitWrapper = () => {
    setHover(false);
    onExit();
  };
  return (
    <Grow in={open} onExited={exitWrapper} unmountOnExit={true}>
      <Expand in={hover} timeout={150} start={0.9} end={1.05}>
        <Grid item key={genid()} className={classes.card}>
          <Card
            className={classes.create}
            onMouseOver={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            elevation={hover ? 12 : 2}
          >
            <Button fullWidth onClick={() => callback()}>
              <CardContent>
                <Typography variant="h5" className={classes.create}>
                  Create a new tasklist
                </Typography>
                <br />
                <br />
                <AddCircle className={classes.addButton} />
              </CardContent>
            </Button>
          </Card>
        </Grid>
      </Expand>
    </Grow>
  );
};

export default CreateTasklistStub;
