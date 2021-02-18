import React, { FC } from "react";
import { Grid, GridProps } from "@material-ui/core";
import Row from "./Row";
import Column from "./Column";

interface GridPlusProps {
  orderBy: "column" | "row";
  crossFill?: boolean;
  fillCount: number;
  childProps?: GridProps;
  children: React.ReactNode;
  childClassName: string;
}

// removing unwanted props
const GridPlus: FC<GridProps & GridPlusProps> = ({
  children,
  item,
  container,
  crossFill,
  orderBy,
  fillCount,
  childClassName,
  childProps,
  ...props
}) => {
  const createAndFillGrids = () => {
    let arrIndex = 0;
    const arr2D = new Array<Array<JSX.Element>>(fillCount);
    for (let i = 0; i < arr2D.length; i++) arr2D[i] = [];
    const childrenArr = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return null;
      }
      return child;
    });
    if (childrenArr === undefined || childrenArr === null) return null;
    if (crossFill) {
      for (
        let i = 0;
        i < childrenArr.length;
        i++, arrIndex = (arrIndex + 1) % fillCount
      ) {
        arr2D[arrIndex].push(childrenArr[i]);
      }
    } else {
      for (let i = 0; i < childrenArr.length; i++) {
        let n = Math.floor(i / fillCount);
        arr2D[n].push(childrenArr[i]);
      }
    }

    const arr = new Array<JSX.Element>(fillCount);
    for (let i = 0; i < arr.length; i++) {
      if (orderBy === "row") {
        arr[i] = (
          <Grid key={i} item className={childClassName}>
            <Row {...childProps}>{arr2D[i]}</Row>
          </Grid>
        );
      } else {
        arr[i] = (
          <Grid key={i} item className={childClassName}>
            <Column {...childProps}>{arr2D[i]}</Column>
          </Grid>
        );
      }
    }
    return arr;
  };

  const gridChildren = createAndFillGrids();

  return (
    <Grid {...props} container>
      {gridChildren}
    </Grid>
  );
};

export default GridPlus;
