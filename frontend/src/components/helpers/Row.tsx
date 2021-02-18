import React, { FC } from "react";
import { Grid, GridProps } from "@material-ui/core";

const Row: FC<GridProps> = ({children, item, container, direction, ...props}) => {
  return (
    <Grid {...props} container direction="row">
      {children}
    </Grid>
  )
}

export default Row;
