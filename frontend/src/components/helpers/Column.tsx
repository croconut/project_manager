import React, { FC } from "react";
import { Grid, GridProps } from "@material-ui/core";

const Column: FC<GridProps> = ({children, item, container, direction, ...props}) => {
  return (
    <Grid {...props} container direction="column">
      {children}
    </Grid>
  )
}

export default Column;
